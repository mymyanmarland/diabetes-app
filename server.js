// server.js — Diabetes Lifestyle Management System (Tech Stack 2)
// Express + node:sqlite + vanilla JS. No frameworks, no CDN, no analytics.
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb' }));

// ---------------- helpers ----------------
function parseCookies(req) {
  const h = req.headers.cookie || '';
  const o = {};
  h.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return o;
}
function hashPassword(pw) {
  return new Promise((res, rej) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(pw, salt, 64, (e, k) => e ? rej(e) : res(salt + ':' + k.toString('hex')));
  });
}
function verifyPassword(pw, stored) {
  return new Promise((res, rej) => {
    const parts = String(stored).split(':');
    if (parts.length !== 2) return res(false);
    crypto.scrypt(pw, parts[0], 64, (e, k) => {
      if (e) return rej(e);
      try { res(crypto.timingSafeEqual(Buffer.from(parts[1], 'hex'), k)); }
      catch { res(false); }
    });
  });
}
const SESSION_DAYS = 30;
function newSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').run(token, userId, exp);
  return token;
}
function setSessionCookie(res, token) {
  res.cookie('sid', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: SESSION_DAYS * 864e5 });
}
function publicUser(u) {
  return {
    id: u.id, email: u.email, name: u.name, lang: u.lang, glucose_unit: u.glucose_unit,
    diabetes_type: u.diabetes_type, diagnosed_year: u.diagnosed_year,
    target_fasting_low: u.target_fasting_low, target_fasting_high: u.target_fasting_high,
    target_postmeal_high: u.target_postmeal_high,
  };
}
function auth(req, res, next) {
  const sid = parseCookies(req).sid;
  if (!sid) return res.status(401).json({ error: 'unauthorized' });
  const u = db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > strftime('%Y-%m-%d %H:%M:%S','now')`).get(sid);
  if (!u) return res.status(401).json({ error: 'unauthorized' });
  req.user = publicUser(u);
  next();
}
// simple in-memory rate limiter for auth endpoints
const rl = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'x';
  const now = Date.now();
  const arr = (rl.get(ip) || []).filter(t => now - t < 60000);
  if (arr.length >= 30) return res.status(429).json({ error: 'too_many_requests' });
  arr.push(now); rl.set(ip, arr); next();
}
// Yangon is UTC+6:30 fixed (no DST)
const YG_OFFSET_MS = 6.5 * 3600 * 1000;
function yangonLocalToISO(dateStr, timeStr) {
  const [Y, M, D] = String(dateStr).split('-').map(Number);
  const [h, m] = String(timeStr || '00:00').split(':').map(Number);
  if (!Y || !M || !D) return null;
  return new Date(Date.UTC(Y, M - 1, D, h || 0, m || 0) - YG_OFFSET_MS).toISOString();
}
function addDays(dateStr, n) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(Y, M - 1, D) + n * 864e5);
  return d.toISOString().slice(0, 10);
}
// validation helpers
const isISODate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const isTime = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || ''));
function num(v, min, max) {
  const n = Number(v);
  return (v === '' || v == null || Number.isNaN(n) || n < min || n > max) ? null : n;
}
function str(v, maxLen) {
  if (v == null) return '';
  const s = String(v).trim();
  return s.length > maxLen ? null : s;
}
function inRangeTIR(value, type, u) {
  const lo = u.target_fasting_low, hi = type === 'postmeal' ? u.target_postmeal_high : u.target_fasting_high;
  return value >= lo && value <= hi;
}
function glucoseStats(rows, u) {
  if (!rows.length) return { count: 0, avg: null, min: null, max: null, tirPct: null, inRange: 0 };
  let sum = 0, min = Infinity, max = -Infinity, inR = 0;
  for (const r of rows) {
    const v = r.value_mgdl; sum += v;
    if (v < min) min = v; if (v > max) max = v;
    if (inRangeTIR(v, r.reading_type, u)) inR++;
  }
  return { count: rows.length, avg: Math.round(sum / rows.length), min, max, inRange: inR, tirPct: Math.round(inR / rows.length * 100) };
}
// medication schedule for a Yangon date: [{medication_id,name,dose,time,scheduled_for,taken,skipped}]
function medSchedule(userId, dateStr) {
  const meds = db.prepare(`SELECT * FROM medications WHERE user_id=? AND active=1
    AND start_date<=? AND (end_date IS NULL OR end_date>=?)`).all(userId, dateStr, dateStr);
  const from = yangonLocalToISO(dateStr, '00:00');
  const to = yangonLocalToISO(addDays(dateStr, 1), '00:00');
  const logs = db.prepare(`SELECT medication_id, scheduled_for, taken_at, skipped FROM medication_logs
    WHERE user_id=? AND scheduled_for>=? AND scheduled_for<?`).all(userId, from, to);
  const logByKey = {};
  for (const l of logs) logByKey[l.medication_id + '|' + l.scheduled_for] = l;
  const out = [];
  for (const m of meds) {
    let times = [];
    try { times = JSON.parse(m.times_json || '[]'); } catch { times = []; }
    for (const tm of times) {
      if (!isTime(tm)) continue;
      const sf = yangonLocalToISO(dateStr, tm);
      const lg = logByKey[m.id + '|' + sf];
      out.push({
        medication_id: m.id, name: m.name, dose: m.dose, time: tm, scheduled_for: sf,
        taken: !!(lg && lg.taken_at), skipped: !!(lg && lg.skipped),
      });
    }
  }
  out.sort((a, b) => a.time < b.time ? -1 : 1);
  return out;
}
function adherence(userId, monthStr) { // monthStr YYYY-MM
  const [Y, M] = monthStr.split('-').map(Number);
  if (!Y || !M) return null;
  const lastDay = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let scheduled = 0, taken = 0;
  for (let d = 1; d <= lastDay; d++) {
    const ds = `${monthStr}-${String(d).padStart(2, '0')}`;
    for (const s of medSchedule(userId, ds)) { scheduled++; if (s.taken) taken++; }
  }
  return { scheduled, taken, pct: scheduled ? Math.round(taken / scheduled * 100) : null };
}

// ---------------- auth routes ----------------
app.post('/api/auth/signup', rateLimit, async (req, res) => {
  const email = str(req.body.email, 120);
  const password = req.body.password;
  const name = str(req.body.name, 80) || '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'invalid_email' });
  if (typeof password !== 'string' || password.length < 6 || password.length > 128)
    return res.status(400).json({ error: 'password_length' });
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'email_taken' });
  try {
    const hash = await hashPassword(password);
    const r = db.prepare(`INSERT INTO users (email,password_hash,name) VALUES (?,?,?)`)
      .run(email.toLowerCase(), hash, name);
    const u = db.prepare('SELECT * FROM users WHERE id=?').get(r.lastInsertRowid);
    setSessionCookie(res, newSession(u.id));
    res.status(201).json({ user: publicUser(u) });
  } catch (e) { res.status(500).json({ error: 'server_error' }); }
});
app.post('/api/auth/login', rateLimit, async (req, res) => {
  const email = str(req.body.email, 120);
  const password = req.body.password;
  if (!email || typeof password !== 'string') return res.status(400).json({ error: 'invalid_request' });
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase());
  if (!u || !(await verifyPassword(password, u.password_hash)))
    return res.status(401).json({ error: 'invalid_credentials' }); // generic message
  setSessionCookie(res, newSession(u.id));
  res.json({ user: publicUser(u) });
});
app.post('/api/auth/logout', (req, res) => {
  const sid = parseCookies(req).sid;
  if (sid) db.prepare('DELETE FROM sessions WHERE token=?').run(sid);
  res.clearCookie('sid', { path: '/' });
  res.json({ ok: true });
});
app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));
app.post('/api/auth/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128)
    return res.status(400).json({ error: 'password_length' });
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!(await verifyPassword(currentPassword, u.password_hash)))
    return res.status(401).json({ error: 'invalid_credentials' });
  const hash = await hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, req.user.id);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(req.user.id);
  setSessionCookie(res, newSession(req.user.id));
  res.json({ ok: true });
});
app.delete('/api/auth/account', auth, async (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!(await verifyPassword(req.body.password, u.password_hash)))
    return res.status(401).json({ error: 'invalid_credentials' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.user.id);
  res.clearCookie('sid', { path: '/' });
  res.json({ ok: true });
});

// ---------------- settings ----------------
app.get('/api/me/settings', auth, (req, res) => res.json({ user: req.user }));
app.put('/api/me/settings', auth, (req, res) => {
  const b = req.body;
  const lang = ['my', 'en'].includes(b.lang) ? b.lang : req.user.lang;
  const unit = ['mgdl', 'mmol'].includes(b.glucose_unit) ? b.glucose_unit : req.user.glucose_unit;
  const dtype = ['type1', 'type2', 'gestational', 'unknown'].includes(b.diabetes_type) ? b.diabetes_type : req.user.diabetes_type;
  const dy = b.diagnosed_year == null || b.diagnosed_year === '' ? null : num(b.diagnosed_year, 1900, 2100);
  if (b.diagnosed_year != null && b.diagnosed_year !== '' && dy === null) return res.status(400).json({ error: 'invalid_year' });
  const tfl = num(b.target_fasting_low, 40, 200), tfh = num(b.target_fasting_high, 60, 300), tph = num(b.target_postmeal_high, 80, 400);
  if (tfl === null || tfh === null || tph === null) return res.status(400).json({ error: 'invalid_targets' });
  if (tfl >= tfh) return res.status(400).json({ error: 'target_order' });
  const name = str(b.name, 80);
  if (name === null) return res.status(400).json({ error: 'invalid_name' });
  db.prepare(`UPDATE users SET lang=?, glucose_unit=?, diabetes_type=?, diagnosed_year=?,
    target_fasting_low=?, target_fasting_high=?, target_postmeal_high=?, name=? WHERE id=?`)
    .run(lang, unit, dtype, dy, tfl, tfh, tph, name, req.user.id);
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  res.json({ user: publicUser(u) });
});

// ---------------- glucose ----------------
const READING_TYPES = ['fasting', 'postmeal', 'wakeup', 'bedtime', 'random'];
app.get('/api/glucose', auth, (req, res) => {
  const from = req.query.from, to = req.query.to;
  let sql = 'SELECT * FROM glucose_readings WHERE user_id=?';
  const p = [req.user.id];
  if (from) { sql += ' AND measured_at>=?'; p.push(from); }
  if (to) { sql += ' AND measured_at<?'; p.push(to); }
  sql += ' ORDER BY measured_at DESC LIMIT 2000';
  res.json({ readings: db.prepare(sql).all(...p) });
});
app.get('/api/glucose/stats', auth, (req, res) => {
  const from = req.query.from, to = req.query.to;
  let sql = 'SELECT value_mgdl, reading_type FROM glucose_readings WHERE user_id=?';
  const p = [req.user.id];
  if (from) { sql += ' AND measured_at>=?'; p.push(from); }
  if (to) { sql += ' AND measured_at<?'; p.push(to); }
  res.json(glucoseStats(db.prepare(sql).all(...p), req.user));
});
app.post('/api/glucose', auth, (req, res) => {
  const b = req.body;
  const unit = b.unit === 'mmol' ? 'mmol' : 'mgdl';
  const raw = Number(b.value);
  if (Number.isNaN(raw) || raw <= 0) return res.status(400).json({ error: 'invalid_value' });
  const mgdl = Math.round(raw * (unit === 'mmol' ? 18 : 1));
  if (mgdl < 20 || mgdl > 600) return res.status(400).json({ error: 'value_out_of_range' });
  const rtype = READING_TYPES.includes(b.reading_type) ? b.reading_type : 'random';
  const note = str(b.note, 500);
  if (note === null) return res.status(400).json({ error: 'note_too_long' });
  const measured = b.measured_at ? new Date(b.measured_at) : new Date();
  if (Number.isNaN(measured.getTime())) return res.status(400).json({ error: 'invalid_time' });
  const r = db.prepare(`INSERT INTO glucose_readings (user_id,value_mgdl,reading_type,note,measured_at)
    VALUES (?,?,?,?,?)`).run(req.user.id, mgdl, rtype, note, measured.toISOString());
  res.status(201).json({ reading: db.prepare('SELECT * FROM glucose_readings WHERE id=?').get(r.lastInsertRowid) });
});
app.delete('/api/glucose/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM glucose_readings WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- foods ----------------
app.get('/api/foods', auth, (req, res) => {
  const q = str(req.query.q, 80);
  let sql = 'SELECT * FROM foods WHERE (user_id IS NULL OR user_id=?)';
  const p = [req.user.id];
  if (q) { sql += ' AND (name_my LIKE ? OR name_en LIKE ?)'; p.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY is_custom, name_my LIMIT 100';
  res.json({ foods: db.prepare(sql).all(...p) });
});
app.post('/api/foods', auth, (req, res) => {
  const name_my = str(req.body.name_my, 80);
  const name_en = str(req.body.name_en, 80) || '';
  const serving = str(req.body.serving, 40) || '';
  const carbs = num(req.body.carbs_g, 0, 500);
  if (!name_my || carbs === null) return res.status(400).json({ error: 'invalid_food' });
  const r = db.prepare('INSERT INTO foods (name_my,name_en,serving,carbs_g,is_custom,user_id) VALUES (?,?,?,?,1,?)')
    .run(name_my, name_en, serving, carbs, req.user.id);
  res.status(201).json({ food: db.prepare('SELECT * FROM foods WHERE id=?').get(r.lastInsertRowid) });
});
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
app.get('/api/food-logs', auth, (req, res) => {
  const date = req.query.date;
  if (!isISODate(date)) return res.status(400).json({ error: 'invalid_date' });
  const from = yangonLocalToISO(date, '00:00'), to = yangonLocalToISO(addDays(date, 1), '00:00');
  const logs = db.prepare(`SELECT fl.*, f.name_my, f.name_en FROM food_logs fl
    LEFT JOIN foods f ON f.id=fl.food_id WHERE fl.user_id=? AND fl.logged_at>=? AND fl.logged_at<? ORDER BY fl.logged_at`)
    .all(req.user.id, from, to);
  const total = Math.round(logs.reduce((s, l) => s + l.carbs_g, 0) * 10) / 10;
  res.json({ logs, totalCarbs: total, date });
});
app.post('/api/food-logs', auth, (req, res) => {
  const b = req.body;
  const carbs = num(b.carbs_g, 0, 500);
  const meal = MEAL_TYPES.includes(b.meal_type) ? b.meal_type : 'snack';
  if (carbs === null) return res.status(400).json({ error: 'invalid_carbs' });
  let food_id = null, custom_name = '';
  if (b.food_id) {
    const f = db.prepare('SELECT * FROM foods WHERE id=? AND (user_id IS NULL OR user_id=?)').get(b.food_id, req.user.id);
    if (!f) return res.status(400).json({ error: 'invalid_food' });
    food_id = f.id;
  } else {
    custom_name = str(b.custom_name, 80);
    if (!custom_name) return res.status(400).json({ error: 'invalid_food' });
  }
  const logged = b.logged_at ? new Date(b.logged_at) : new Date();
  if (Number.isNaN(logged.getTime())) return res.status(400).json({ error: 'invalid_time' });
  const r = db.prepare(`INSERT INTO food_logs (user_id,food_id,custom_name,carbs_g,meal_type,logged_at)
    VALUES (?,?,?,?,?,?)`).run(req.user.id, food_id, custom_name, carbs, meal, logged.toISOString());
  res.status(201).json({ log: db.prepare('SELECT * FROM food_logs WHERE id=?').get(r.lastInsertRowid) });
});
app.delete('/api/food-logs/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM food_logs WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- medications ----------------
const MEAL_REL = ['before', 'with', 'after', 'any'];
app.get('/api/medications', auth, (req, res) => {
  res.json({ medications: db.prepare('SELECT * FROM medications WHERE user_id=? ORDER BY active DESC, name').all(req.user.id) });
});
function validateMed(b) {
  const name = str(b.name, 100);
  if (!name) return { error: 'invalid_med_name' };
  const dose = str(b.dose, 60) || '';
  let times = b.times;
  if (typeof times === 'string') { try { times = JSON.parse(times); } catch { return { error: 'invalid_times' }; } }
  if (!Array.isArray(times) || !times.length || times.length > 12 || !times.every(isTime))
    return { error: 'invalid_times' };
  const rel = MEAL_REL.includes(b.relation_to_meal) ? b.relation_to_meal : 'any';
  const start = str(b.start_date, 10);
  if (!isISODate(start)) return { error: 'invalid_date' };
  const end = b.end_date ? str(b.end_date, 10) : null;
  if (b.end_date && !isISODate(end)) return { error: 'invalid_date' };
  const stock = b.stock_qty == null || b.stock_qty === '' ? null : num(b.stock_qty, 0, 100000);
  if (b.stock_qty != null && b.stock_qty !== '' && stock === null) return { error: 'invalid_stock' };
  const active = b.active === 0 || b.active === false ? 0 : 1;
  return { name, dose, times_json: JSON.stringify(times), relation_to_meal: rel, start_date: start, end_date: end, stock_qty: stock, active };
}
app.post('/api/medications', auth, (req, res) => {
  const v = validateMed(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const r = db.prepare(`INSERT INTO medications (user_id,name,dose,times_json,relation_to_meal,start_date,end_date,stock_qty,active)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(req.user.id, v.name, v.dose, v.times_json, v.relation_to_meal, v.start_date, v.end_date, v.stock_qty, v.active);
  res.status(201).json({ medication: db.prepare('SELECT * FROM medications WHERE id=?').get(r.lastInsertRowid) });
});
app.put('/api/medications/:id', auth, (req, res) => {
  const v = validateMed(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const r = db.prepare(`UPDATE medications SET name=?,dose=?,times_json=?,relation_to_meal=?,start_date=?,end_date=?,stock_qty=?,active=?
    WHERE id=? AND user_id=?`).run(v.name, v.dose, v.times_json, v.relation_to_meal, v.start_date, v.end_date, v.stock_qty, v.active, req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ medication: db.prepare('SELECT * FROM medications WHERE id=?').get(req.params.id) });
});
app.delete('/api/medications/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM medications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});
app.get('/api/med-schedule', auth, (req, res) => {
  const date = req.query.date;
  if (!isISODate(date)) return res.status(400).json({ error: 'invalid_date' });
  res.json({ date, schedule: medSchedule(req.user.id, date) });
});
app.post('/api/med-logs', auth, (req, res) => {
  const { medication_id, scheduled_for, action } = req.body;
  if (!['taken', 'skipped', 'untaken'].includes(action)) return res.status(400).json({ error: 'invalid_action' });
  const med = db.prepare('SELECT id FROM medications WHERE id=? AND user_id=?').get(medication_id, req.user.id);
  if (!med) return res.status(404).json({ error: 'not_found' });
  const sf = scheduled_for ? new Date(scheduled_for) : null;
  if (!sf || Number.isNaN(sf.getTime())) return res.status(400).json({ error: 'invalid_time' });
  const sfIso = sf.toISOString();
  if (action === 'untaken') {
    db.prepare('DELETE FROM medication_logs WHERE medication_id=? AND scheduled_for=?').run(medication_id, sfIso);
  } else {
    db.prepare(`INSERT INTO medication_logs (medication_id,user_id,scheduled_for,taken_at,skipped)
      VALUES (?,?,?, ?, ?) ON CONFLICT(medication_id,scheduled_for)
      DO UPDATE SET taken_at=excluded.taken_at, skipped=excluded.skipped`)
      .run(medication_id, req.user.id, sfIso, action === 'taken' ? new Date().toISOString() : null, action === 'skipped' ? 1 : 0);
  }
  res.json({ ok: true });
});
app.get('/api/adherence', auth, (req, res) => {
  const month = req.query.month;
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) return res.status(400).json({ error: 'invalid_month' });
  res.json({ month, ...(adherence(req.user.id, month) || { scheduled: 0, taken: 0, pct: null }) });
});

// ---------------- activities ----------------
const ACT_TYPES = ['walk', 'run', 'cycle', 'yoga', 'swim', 'other', 'steps'];
app.get('/api/activities', auth, (req, res) => {
  const from = req.query.from, to = req.query.to;
  let sql = 'SELECT * FROM activities WHERE user_id=?';
  const p = [req.user.id];
  if (from) { sql += ' AND logged_at>=?'; p.push(from); }
  if (to) { sql += ' AND logged_at<?'; p.push(to); }
  sql += ' ORDER BY logged_at DESC LIMIT 2000';
  res.json({ activities: db.prepare(sql).all(...p) });
});
app.get('/api/activity/stats', auth, (req, res) => {
  const from = req.query.from, to = req.query.to;
  let sql = 'SELECT type,duration_min,steps FROM activities WHERE user_id=?';
  const p = [req.user.id];
  if (from) { sql += ' AND logged_at>=?'; p.push(from); }
  if (to) { sql += ' AND logged_at<?'; p.push(to); }
  const rows = db.prepare(sql).all(...p);
  let minutes = 0, steps = 0;
  const byType = {};
  for (const r of rows) {
    minutes += r.duration_min || 0; steps += r.steps || 0;
    byType[r.type] = (byType[r.type] || 0) + 1;
  }
  res.json({ minutes, steps, sessions: rows.length, byType });
});
function validateActivity(b) {
  const type = ACT_TYPES.includes(b.type) ? b.type : 'other';
  const dur = num(b.duration_min, 0, 1440);
  if (dur === null) return { error: 'invalid_duration' };
  const inten = ['low', 'moderate', 'high'].includes(b.intensity) ? b.intensity : 'moderate';
  const steps = b.steps == null || b.steps === '' ? null : num(b.steps, 0, 200000);
  if (b.steps != null && b.steps !== '' && steps === null) return { error: 'invalid_steps' };
  const note = str(b.note, 500) || '';
  if (note === null) return { error: 'invalid_note' };
  const logged = b.logged_at ? new Date(b.logged_at) : new Date();
  if (Number.isNaN(logged.getTime())) return { error: 'invalid_time' };
  return { type, duration_min: dur, intensity: inten, steps, note, logged_at: logged.toISOString() };
}
app.post('/api/activities', auth, (req, res) => {
  const v = validateActivity(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const r = db.prepare(`INSERT INTO activities (user_id,type,duration_min,intensity,steps,logged_at,note)
    VALUES (?,?,?,?,?,?,?)`).run(req.user.id, v.type, v.duration_min, v.intensity, v.steps, v.logged_at, v.note);
  res.status(201).json({ activity: db.prepare('SELECT * FROM activities WHERE id=?').get(r.lastInsertRowid) });
});
app.post('/api/activities/import', auth, (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length > 365) return res.status(400).json({ error: 'invalid_rows' });
  const ins = db.prepare(`INSERT INTO activities (user_id,type,duration_min,intensity,steps,logged_at,note)
    VALUES (?,'steps',0,'low',?,?,'csv import')`);
  let count = 0;
  for (const r of rows) {
    if (!isISODate(r.date)) continue;
    const steps = num(r.steps, 0, 200000);
    if (steps === null) continue;
    ins.run(req.user.id, steps, yangonLocalToISO(r.date, '12:00'));
    count++;
  }
  res.json({ imported: count });
});
app.delete('/api/activities/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM activities WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- weight & BP ----------------
app.get('/api/weight-bp', auth, (req, res) => {
  const from = req.query.from, to = req.query.to;
  let sql = 'SELECT * FROM weight_bp WHERE user_id=?';
  const p = [req.user.id];
  if (from) { sql += ' AND measured_at>=?'; p.push(from); }
  if (to) { sql += ' AND measured_at<?'; p.push(to); }
  sql += ' ORDER BY measured_at DESC LIMIT 1000';
  res.json({ records: db.prepare(sql).all(...p) });
});
app.post('/api/weight-bp', auth, (req, res) => {
  const b = req.body;
  const w = b.weight_kg == null || b.weight_kg === '' ? null : num(b.weight_kg, 20, 300);
  const sys = b.systolic == null || b.systolic === '' ? null : num(b.systolic, 50, 300);
  const dia = b.diastolic == null || b.diastolic === '' ? null : num(b.diastolic, 30, 200);
  const pulse = b.pulse == null || b.pulse === '' ? null : num(b.pulse, 30, 250);
  if ((b.weight_kg != null && b.weight_kg !== '' && w === null) ||
      (b.systolic != null && b.systolic !== '' && sys === null) ||
      (b.diastolic != null && b.diastolic !== '' && dia === null) ||
      (b.pulse != null && b.pulse !== '' && pulse === null))
    return res.status(400).json({ error: 'invalid_values' });
  if (w === null && sys === null && dia === null && pulse === null)
    return res.status(400).json({ error: 'empty_record' });
  const measured = b.measured_at ? new Date(b.measured_at) : new Date();
  if (Number.isNaN(measured.getTime())) return res.status(400).json({ error: 'invalid_time' });
  const r = db.prepare(`INSERT INTO weight_bp (user_id,weight_kg,systolic,diastolic,pulse,measured_at)
    VALUES (?,?,?,?,?,?)`).run(req.user.id, w, sys, dia, pulse, measured.toISOString());
  res.status(201).json({ record: db.prepare('SELECT * FROM weight_bp WHERE id=?').get(r.lastInsertRowid) });
});
app.delete('/api/weight-bp/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM weight_bp WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- labs ----------------
app.get('/api/labs', auth, (req, res) => {
  res.json({ labs: db.prepare('SELECT * FROM lab_results WHERE user_id=? ORDER BY tested_at DESC LIMIT 500').all(req.user.id) });
});
app.post('/api/labs', auth, (req, res) => {
  const b = req.body;
  const name = str(b.test_name, 80);
  const value = num(b.value, 0, 100000);
  const unit = str(b.unit, 20) || '';
  const note = str(b.note, 500) || '';
  if (!name || value === null || unit === null || note === null) return res.status(400).json({ error: 'invalid_lab' });
  const tested = b.tested_at ? new Date(b.tested_at) : new Date();
  if (Number.isNaN(tested.getTime())) return res.status(400).json({ error: 'invalid_time' });
  const r = db.prepare(`INSERT INTO lab_results (user_id,test_name,value,unit,tested_at,note)
    VALUES (?,?,?,?,?,?)`).run(req.user.id, name, value, unit, tested.toISOString(), note);
  res.status(201).json({ lab: db.prepare('SELECT * FROM lab_results WHERE id=?').get(r.lastInsertRowid) });
});
app.delete('/api/labs/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM lab_results WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- doctor visits ----------------
app.get('/api/visits', auth, (req, res) => {
  res.json({ visits: db.prepare('SELECT * FROM doctor_visits WHERE user_id=? ORDER BY visit_date DESC').all(req.user.id) });
});
function validateVisit(b) {
  const visit_date = str(b.visit_date, 10);
  if (!isISODate(visit_date)) return { error: 'invalid_date' };
  const doctor = str(b.doctor, 80) || '', clinic = str(b.clinic, 80) || '';
  const notes = str(b.notes, 2000) || '', questions = str(b.questions, 2000) || '';
  if ([doctor, clinic, notes, questions].includes(null)) return { error: 'invalid_visit' };
  const next_visit = b.next_visit ? str(b.next_visit, 10) : null;
  if (b.next_visit && !isISODate(next_visit)) return { error: 'invalid_date' };
  return { visit_date, doctor, clinic, notes, questions, next_visit };
}
app.post('/api/visits', auth, (req, res) => {
  const v = validateVisit(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const r = db.prepare(`INSERT INTO doctor_visits (user_id,visit_date,doctor,clinic,notes,questions,next_visit)
    VALUES (?,?,?,?,?,?,?)`).run(req.user.id, v.visit_date, v.doctor, v.clinic, v.notes, v.questions, v.next_visit);
  res.status(201).json({ visit: db.prepare('SELECT * FROM doctor_visits WHERE id=?').get(r.lastInsertRowid) });
});
app.put('/api/visits/:id', auth, (req, res) => {
  const v = validateVisit(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const r = db.prepare(`UPDATE doctor_visits SET visit_date=?,doctor=?,clinic=?,notes=?,questions=?,next_visit=?
    WHERE id=? AND user_id=?`).run(v.visit_date, v.doctor, v.clinic, v.notes, v.questions, v.next_visit, req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ visit: db.prepare('SELECT * FROM doctor_visits WHERE id=?').get(req.params.id) });
});
app.delete('/api/visits/:id', auth, (req, res) => {
  const r = db.prepare('DELETE FROM doctor_visits WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  if (!r.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

// ---------------- articles ----------------
app.get('/api/articles', auth, (req, res) => {
  res.json({ articles: db.prepare('SELECT id,title_my,title_en,category,sort FROM articles ORDER BY sort').all() });
});
app.get('/api/articles/:id', auth, (req, res) => {
  const a = db.prepare('SELECT * FROM articles WHERE id=?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'not_found' });
  res.json({ article: a });
});

// ---------------- dashboard ----------------
app.get('/api/dashboard', auth, (req, res) => {
  const date = isISODate(req.query.date) ? req.query.date : null;
  const from = yangonLocalToISO(date || '2000-01-01', '00:00');
  const dayFrom = date ? yangonLocalToISO(date, '00:00') : null;
  const dayTo = date ? yangonLocalToISO(addDays(date, 1), '00:00') : null;
  const u = req.user;
  const g = dayFrom
    ? db.prepare('SELECT value_mgdl,reading_type FROM glucose_readings WHERE user_id=? AND measured_at>=? AND measured_at<?').all(u.id, dayFrom, dayTo)
    : [];
  const stats = glucoseStats(g, u);
  const schedule = date ? medSchedule(u.id, date) : [];
  const due = schedule.filter(s => !s.taken && !s.skipped);
  const act = dayFrom
    ? db.prepare('SELECT COALESCE(SUM(duration_min),0) m, COALESCE(SUM(steps),0) s FROM activities WHERE user_id=? AND logged_at>=? AND logged_at<?').get(u.id, dayFrom, dayTo)
    : { m: 0, s: 0 };
  const carbs = dayFrom
    ? db.prepare('SELECT COALESCE(SUM(carbs_g),0) c FROM food_logs WHERE user_id=? AND logged_at>=? AND logged_at<?').get(u.id, dayFrom, dayTo).c
    : 0;
  // next upcoming appointment (Yangon today or later)
  const ygToday = new Date(Date.now() + YG_OFFSET_MS).toISOString().slice(0, 10);
  const upcoming = db.prepare(`SELECT * FROM doctor_visits WHERE user_id=? AND next_visit IS NOT NULL
    AND next_visit >= ? ORDER BY next_visit LIMIT 1`).get(u.id, ygToday);
  const lowStock = db.prepare(`SELECT name, stock_qty FROM medications WHERE user_id=? AND active=1
    AND stock_qty IS NOT NULL AND stock_qty <= 7`).all(u.id);
  res.json({
    date, glucose: stats,
    meds: { total: schedule.length, taken: schedule.filter(s => s.taken).length, due },
    activity: { minutes: act.m || 0, steps: act.s || 0 },
    carbsToday: Math.round(carbs * 10) / 10,
    nextVisit: upcoming || null, lowStock,
  });
});

// ---------------- report ----------------
app.get('/api/report', auth, (req, res) => {
  const period = req.query.period === 'month' ? 'month' : 'week';
  const ref = isISODate(req.query.ref) ? req.query.ref : new Date(Date.now() + YG_OFFSET_MS).toISOString().slice(0, 10);
  const days = period === 'month' ? 30 : 7;
  const fromDate = addDays(ref, -(days - 1));
  const from = yangonLocalToISO(fromDate, '00:00');
  const to = yangonLocalToISO(addDays(ref, 1), '00:00');
  const u = req.user;
  const gstats = glucoseStats(
    db.prepare('SELECT value_mgdl,reading_type FROM glucose_readings WHERE user_id=? AND measured_at>=? AND measured_at<?').all(u.id, from, to), u);
  const monthStr = ref.slice(0, 7);
  const adh = adherence(u.id, monthStr);
  const carbsByDay = db.prepare(`SELECT substr(logged_at,1,10) d, SUM(carbs_g) c FROM food_logs
    WHERE user_id=? AND logged_at>=? AND logged_at<? GROUP BY d`).all(u.id, from, to);
  const act = db.prepare(`SELECT COALESCE(SUM(duration_min),0) m, COALESCE(SUM(steps),0) s, COUNT(*) n
    FROM activities WHERE user_id=? AND logged_at>=? AND logged_at<?`).get(u.id, from, to);
  const wbp = db.prepare(`SELECT * FROM weight_bp WHERE user_id=? AND measured_at>=? AND measured_at<? ORDER BY measured_at DESC LIMIT 1`).get(u.id, from, to);
  const labs = db.prepare(`SELECT * FROM lab_results WHERE user_id=? AND tested_at>=? AND tested_at<? ORDER BY tested_at DESC`).all(u.id, from, to);
  res.json({
    period, from: fromDate, to: ref, user: { name: u.name, email: u.email },
    glucose: gstats, adherence: adh,
    carbsByDay, activity: { minutes: act.m, steps: act.s, sessions: act.n },
    latestWeightBp: wbp || null, labs,
  });
});

// ---------------- export ----------------
function csvCell(v) {
  const s = String(v == null ? '' : v).replace(/"/g, '""');
  return `"${s}"`;
}
app.get('/api/export', auth, (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const u = req.user;
  const tables = ['glucose_readings', 'food_logs', 'medications', 'medication_logs', 'activities', 'weight_bp', 'lab_results', 'doctor_visits'];
  if (format === 'json') {
    const data = { user: publicUser(u), exported_at: new Date().toISOString() };
    for (const t of tables) data[t] = db.prepare(`SELECT * FROM ${t} WHERE user_id=?`).all(u.id);
    data.foods_custom = db.prepare('SELECT * FROM foods WHERE user_id=?').all(u.id);
    res.setHeader('Content-Disposition', 'attachment; filename="diabetes-data.json"');
    return res.json(data);
  }
  const type = req.query.type || 'glucose';
  const defs = {
    glucose: ['glucose_readings', ['id', 'value_mgdl', 'reading_type', 'note', 'measured_at']],
    food: ['food_logs', ['id', 'custom_name', 'food_id', 'carbs_g', 'meal_type', 'logged_at']],
    activity: ['activities', ['id', 'type', 'duration_min', 'intensity', 'steps', 'logged_at', 'note']],
    weight: ['weight_bp', ['id', 'weight_kg', 'systolic', 'diastolic', 'pulse', 'measured_at']],
    labs: ['lab_results', ['id', 'test_name', 'value', 'unit', 'tested_at', 'note']],
    meds: ['medication_logs', ['id', 'medication_id', 'scheduled_for', 'taken_at', 'skipped']],
  };
  const def = defs[type];
  if (!def) return res.status(400).json({ error: 'invalid_type' });
  const rows = db.prepare(`SELECT ${def[1].join(',')} FROM ${def[0]} WHERE user_id=? ORDER BY 1`).all(u.id);
  const csv = def[1].join(',') + '\n' + rows.map(r => def[1].map(c => csvCell(r[c])).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="diabetes-${type}.csv"`);
  res.send('\uFEFF' + csv);
});

// ---------------- static + SPA fallback ----------------
app.use(express.static(path.join(__dirname, 'public')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`[app] listening on http://localhost:${PORT}`));
