// db.js — SQLite (node:sqlite) schema + seeds. No ORM, parameterized queries only.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'app.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'my',
  glucose_unit TEXT NOT NULL DEFAULT 'mgdl',
  diabetes_type TEXT NOT NULL DEFAULT 'unknown',
  diagnosed_year INTEGER,
  target_fasting_low INTEGER NOT NULL DEFAULT 80,
  target_fasting_high INTEGER NOT NULL DEFAULT 130,
  target_postmeal_high INTEGER NOT NULL DEFAULT 180,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS glucose_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_mgdl INTEGER NOT NULL,
  reading_type TEXT NOT NULL DEFAULT 'random',
  note TEXT NOT NULL DEFAULT '',
  measured_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_glucose_user_time ON glucose_readings(user_id, measured_at);
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_my TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  serving TEXT NOT NULL DEFAULT '',
  carbs_g REAL NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS food_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES foods(id) ON DELETE SET NULL,
  custom_name TEXT NOT NULL DEFAULT '',
  carbs_g REAL NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'snack',
  logged_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_foodlog_user_time ON food_logs(user_id, logged_at);
CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL DEFAULT '',
  times_json TEXT NOT NULL DEFAULT '[]',
  relation_to_meal TEXT NOT NULL DEFAULT 'any',
  start_date TEXT NOT NULL,
  end_date TEXT,
  stock_qty INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS medication_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_for TEXT NOT NULL,
  taken_at TEXT,
  skipped INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(medication_id, scheduled_for)
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'walk',
  duration_min INTEGER NOT NULL DEFAULT 0,
  intensity TEXT NOT NULL DEFAULT 'moderate',
  steps INTEGER,
  logged_at TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_activity_user_time ON activities(user_id, logged_at);
CREATE TABLE IF NOT EXISTS weight_bp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg REAL,
  systolic INTEGER,
  diastolic INTEGER,
  pulse INTEGER,
  measured_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS lab_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  tested_at TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS doctor_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_date TEXT NOT NULL,
  doctor TEXT NOT NULL DEFAULT '',
  clinic TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  questions TEXT NOT NULL DEFAULT '',
  next_visit TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_my TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  body_my TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  sort INTEGER NOT NULL DEFAULT 0
);
`);

// ---------- Seed: Myanmar foods (carb estimates, approximate) ----------
const FOOD_SEED = [
  ['ထမင်း', 'Steamed rice', '1 ပန်းကန်', 45],
  ['ကောက်ညှင်းထမင်း', 'Sticky rice', '1 ပန်းကန်', 50],
  ['မုန့်ဟင်းခါး', 'Mohinga', '1 ပွဲ', 50],
  ['ရှမ်းခေါက်ဆွဲ', 'Shan noodles', '1 ပွဲ', 55],
  ['မုန့်တီ', 'Mont ti (rice noodle salad)', '1 ပွဲ', 45],
  ['ငါးထမင်းနယ်', 'Fish rice mix', '1 ပွဲ', 48],
  ['ပဲပြုတ်ထမင်း', 'Rice with boiled peas', '1 ပွဲ', 52],
  ['အုန်းနို့ခေါက်ဆွဲ', 'Coconut chicken noodles', '1 ပွဲ', 55],
  ['နန်းကြီးသုပ်', 'Nan gyi thoke', '1 ပွဲ', 40],
  ['ရခိုင်မုန့်တီ', 'Rakhine mont ti', '1 ပွဲ', 45],
  ['စမူဆာ', 'Samosa', '1 ခု', 15],
  ['ပဲပလာတာ', 'Pe palata', '1 ချပ်', 30],
  ['ထမင်းကြော်', 'Fried rice', '1 ပန်းကန်', 50],
  ['ခေါက်ဆွဲကြော်', 'Fried noodles', '1 ပွဲ', 55],
  ['ကြာဇံကြော်', 'Fried vermicelli', '1 ပွဲ', 45],
  ['မုန့်လက်ဆောင်း', 'Mont let saung', '1 ပွဲ', 40],
  ['ရွှေရင်အေး', 'Shwe yin aye', '1 ခွက်', 45],
  ['ဒိန်ချဉ်', 'Plain yogurt', '1 ခွက်', 12],
  ['ငှက်ပျောသီး', 'Banana', '1 လုံး', 27],
  ['သရက်သီး', 'Mango', '1 လုံး (အလတ်)', 35],
];
{
  const n = db.prepare('SELECT COUNT(*) c FROM foods WHERE user_id IS NULL').get().c;
  if (n === 0) {
    const ins = db.prepare('INSERT INTO foods (name_my, name_en, serving, carbs_g, is_custom, user_id) VALUES (?,?,?,?,0,NULL)');
    for (const f of FOOD_SEED) ins.run(f[0], f[1], f[2], f[3]);
    console.log('[db] seeded', FOOD_SEED.length, 'Myanmar foods');
  }
}

// ---------- Seed: education articles (genuine Burmese content) ----------
const ARTICLE_SEED = [
  {
    title_my: 'ဆီးချိုရောဂါဆိုတာ ဘာလဲ',
    title_en: 'What is diabetes?',
    category: 'basics', sort: 1,
    body_my: `ဆီးချိုရောဂါဆိုတာ သွေးထဲမှာ သကြားဓာတ် (glucose) ပုံမှန်ထက် များနေတဲ့ အခြေအနေပါ။ အစားအစာကနေ ရတဲ့ သကြားဓာတ်ကို ဆဲလ်တွေထဲ ဝင်ရောက်အသုံးချဖို့ အင်ဆူလင် (insulin) ဆိုတဲ့ ဟော်မုန်း လိုအပ်ပါတယ်။ အင်ဆူလင် မလုံလောက်တာ ဒါမှမဟုတ် ခန္ဓာကိုယ်က အင်ဆူလင်ကို ကောင်းကောင်းအသုံးမချနိုင်တာကြောင့် သွေးသကြားဓာတ် တက်လာတာပါ။

အဓိက အမျိုးအစား ၃ မျိုး ရှိပါတယ်။ Type 1 က ခုခံအားစနစ်က အင်ဆူလင်ထုတ်တဲ့ ဆဲလ်တွေကို ဖျက်ဆီးလို့ အင်ဆူလင် လုံးဝမထွက်တာ ဖြစ်ပြီး၊ Type 2 က အဖြစ်အများဆုံးဖြစ်ကာ ခန္ဓာကိုယ်က အင်ဆူလင်ကို ခုခံတာ (insulin resistance) ဒါမှမဟုတ် လုံလောက်အောင် မထုတ်နိုင်တာပါ။ ကိုယ်ဝန်ဆောင်ဆီးချို (gestational) ကတော့ ကိုယ်ဝန်ဆောင်စဉ် ဖြစ်ပေါ်တာပါ။

သတိထားရမည့် လက္ခဏာတွေကတော့ ရေအလွန်ဆာခြင်း၊ ဆီးခဏခဏသွားခြင်း၊ အလွန်ဗိုက်ဆာခြင်း၊ ကိုယ်အလေးချိန်ကျဆင်းခြင်း၊ ပင်ပန်းနွမ်းနယ်ခြင်း၊ အမြင်ဝါးခြင်း၊ အနာကျက်နှေးခြင်းတို့ပါ။

ဆီးချိုရောဂါဟာ ကူးစက်ရောဂါ မဟုတ်ပါဘူး။ ကုသပျောက်ကင်းအောင် မလုပ်နိုင်သေးပေမယ့် ဆေး၊ အစားအသောက်၊ ကိုယ်လက်လှုပ်ရှားမှုတို့နဲ့ ထိန်းချုပ်ထားနိုင်ပါတယ်။ သွေးသကြားဓာတ် ထိန်းထားနိုင်ရင် နောက်ဆက်တွဲဆိုးကျိုးတွေ (မျက်စိ၊ ကျောက်ကပ်၊ နှလုံး၊ အာရုံကြော ထိခိုက်မှု) ကို ကာကွယ်နိုင်ပါတယ်။

ဒီ app ဟာ ကိုယ့်ဘာသာ မှတ်သားထိန်းသိမ်းဖို့ tool သက်သက်သာ ဖြစ်ပါတယ်။ ရောဂါအမည်တပ်တာ၊ ဆေးညွှန်းပေးတာ မလုပ်ပါ။ ကျန်းမာရေးနဲ့ ပတ်သက်တဲ့ ဆုံးဖြတ်ချက်တိုင်းကို ဆရာဝန်နဲ့ တိုင်ပင်ပါ။`,
    body_en: `Diabetes is a condition where blood sugar (glucose) is higher than normal. The body needs a hormone called insulin to move sugar from food into cells. When insulin is lacking or the body cannot use it well, blood sugar rises.

There are 3 main types. In Type 1, the immune system destroys insulin-producing cells. Type 2, the most common, is insulin resistance or insufficient insulin production. Gestational diabetes occurs during pregnancy.

Warning signs include excessive thirst, frequent urination, extreme hunger, weight loss, fatigue, blurred vision, and slow-healing wounds.

Diabetes is not contagious. It cannot be cured yet, but it can be controlled with medication, diet, and exercise. Good control prevents complications affecting the eyes, kidneys, heart, and nerves.

This app is a self-tracking tool only — it does not diagnose or prescribe. Always consult your doctor for medical decisions.`,
  },
  {
    title_my: 'ဆီးချိုသမားအတွက် အစားအသောက်လမ်းညွှန်',
    title_en: 'Diet guidance for people with diabetes',
    category: 'diet', sort: 2,
    body_my: `အစားအသောက်ဟာ သွေးသကြားဓာတ် ထိန်းချုပ်ရာမှာ အရေးအကြီးဆုံးအချက်တစ်ခု ဖြစ်ပါတယ်။ အဓိက နားလည်ရမှာက ကစီဓာတ် (carbohydrate) များတဲ့ အစားအစာတွေက သွေးသကြားကို အမြန်တက်စေတတ်တာပါ။ ထမင်း၊ ခေါက်ဆွဲ၊ မုန့်အမျိုးမျိုး၊ အချိုပွဲတွေမှာ ကစီဓာတ် များပါတယ်။

လွယ်ကူတဲ့ နည်းလမ်းတစ်ခုက "ပန်းကန်တစ်ဝက် နည်းလမ်း" ပါ — ထမင်းစားပန်းကန်ရဲ့ တစ်ဝက်ကို ဟင်းသီးဟင်းရွက်၊ ၄ ပုံ ၁ ပုံကို အသား/ငါး/ပဲ (ပရိုတိန်း)၊ ကျန် ၄ ပုံ ၁ ပုံကိုသာ ထမင်းလို ကစီဓာတ်စာ ထည့်ပါ။

မြန်မာအစားအစာနဲ့ ပတ်သက်ပြီး သတိထားရမှာတွေက — ထမင်းကို ပန်းကန်အပြည့်ထက် လျှော့စားပါ၊ အချိုရည် (soft drink) တွေ လုံးဝရှောင်ပါ၊ မုန့်ဟင်းခါး/ရှမ်းခေါက်ဆွဲလို အရည်များတဲ့အစားအစာတွေက ထင်တာထက် ကစီဓာတ်များတတ်ပါတယ်၊ အသီးအချို (သရက်၊ ငှက်ပျော) ကို ပမာဏထိန်းစားပါ၊ ကြော်ထားတာတွေထက် ပြုတ်/ကင်/ပေါင်းတာကို ရွေးပါ။

အစားကို အချိန်မှန်စားပါ၊ တစ်နပ်တည်း အများကြီး မစားဘဲ လိုအပ်ရင် အဆာပြေကို ကျန်းမာရေးနဲ့ညီတာရွေးစားပါ။ အမျှင်ဓာတ် (fiber) များတဲ့ ဟင်းသီးဟင်းရွက်၊ ပဲအမျိုးမျိုးက သကြားတက်နှုန်းကို နှေးစေပါတယ်။

ဒီအချက်တွေဟာ ယေဘုယျလမ်းညွှန်ချက်သာ ဖြစ်ပါတယ်။ ကိုယ့်အတွက် သင့်တော်တဲ့ အစားအသောက်အစီအစဉ်ကို ဆရာဝန် (သို့) အာဟာရပညာရှင်နဲ့ ဆွေးနွေးပါ။`,
    body_en: `Diet is one of the most important factors in blood sugar control. The key idea: carbohydrate-rich foods raise blood sugar fastest. Rice, noodles, breads, and sweets are high in carbs.

An easy method is the "half-plate" rule — fill half your plate with vegetables, a quarter with protein (meat/fish/beans), and only a quarter with starchy food like rice.

For Myanmar foods: reduce rice portions, avoid soft drinks entirely, note that mohinga and shan noodles carry more carbs than they appear, eat sweet fruits (mango, banana) in moderation, and prefer boiled/grilled/steamed dishes over fried ones.

Eat at regular times, avoid huge single meals, and choose fiber-rich vegetables and beans — fiber slows sugar absorption.

These are general guidelines only. Discuss a meal plan suited to you with your doctor or a nutritionist.`,
  },
  {
    title_my: 'သွေးသကြားဓာတ်ကျခြင်း — လက္ခဏာများနှင့် အရေးပေါ်လုပ်ဆောင်ရမည့်အဆင့်များ',
    title_en: 'Low blood sugar — symptoms and emergency steps',
    category: 'emergency', sort: 3,
    body_my: `သွေးသကြားဓာတ် ကျဆင်းခြင်း (hypoglycemia — 70 mg/dL အောက်) ဟာ အသက်အန္တရာယ်ရှိနိုင်တဲ့ အရေးပေါ်အခြေအနေ ဖြစ်ပါတယ်။ ဆေး (အထူးသဖြင့် အင်ဆူလင်) သောက်ပြီး အစားမစားတာ၊ အစားနောက်ကျတာ၊ ပြင်းပြင်းထန်ထန် လေ့ကျင့်ခန်းလုပ်တာတွေကြောင့် ဖြစ်တတ်ပါတယ်။

သတိထားရမည့် လက္ခဏာများ — ချွေးထွက်များခြင်း၊ လက်တုန်ယင်ခြင်း၊ နှလုံးခုန်မြန်ခြင်း၊ မူးဝေခြင်း၊ အလွန်ဗိုက်ဆာခြင်း၊ စိတ်တိုလွယ်ခြင်း၊ အမြင်ဝါးခြင်း၊ ပြင်းထန်ရင် သတိလစ်ခြင်း။

ခံစားရတာနဲ့ ချက်ချင်းလုပ်ရမှာက "15-15 စည်းမျဉ်း" ပါ —
၁။ သကြားဓာတ် 15 ဂရမ် ခန့် ချက်ချင်းစားပါ (သကြားလုံး ၃-၄ လုံး၊ အချိုရည် ခွက်တစ်ဝက်၊ ပျားရည် ထမင်းစားဇွန်း ၁ ဇွန်း)။
၂။ 15 မိနစ်စောင့်ပြီး သွေးသကြား ပြန်တိုင်းပါ။
၃။ 70 mg/dL အောက် ရှိနေသေးရင် နောက်ထပ် 15 ဂရမ် ထပ်စားပါ။

သတိလစ်သွားရင် ပါးစပ်ထဲ ဘာမှ မထည့်ပါနဲ့ — အရေးပေါ်ဆေးရုံ/ဆရာဝန်ထံ ချက်ချင်းဆက်သွယ်ပါ။

ကြိုတင်ကာကွယ်ဖို့ — ဆေးသောက်ပြီး အစားအချိန်မှန်စားပါ၊ ပြင်းထန်တဲ့ လေ့ကျင့်ခန်းမလုပ်ခင် သွေးသကြားတိုင်းပါ၊ အပြင်သွားတိုင်း သကြားလုံး (သို့) အချိုရည် ဆောင်ထားပါ။ သွေးသကြားကျဖူးတဲ့ အတွေ့အကြုံရှိရင် ဆရာဝန်ကို ပြောပြပါ။`,
    body_en: `Low blood sugar (hypoglycemia — below 70 mg/dL) can be a life-threatening emergency. It can happen after medication (especially insulin) without eating, delayed meals, or intense exercise.

Symptoms: heavy sweating, shaking, fast heartbeat, dizziness, extreme hunger, irritability, blurred vision, and in severe cases loss of consciousness.

Act immediately with the "15-15 rule":
1. Eat about 15g of fast sugar at once (3–4 candy pieces, half a cup of soft drink, 1 tablespoon of honey).
2. Wait 15 minutes and re-check blood sugar.
3. If still below 70 mg/dL, eat another 15g.

If the person loses consciousness, do not put anything in the mouth — get emergency medical help immediately.

Prevention: eat on time after medication, check sugar before intense exercise, and always carry candy or a soft drink when going out. Tell your doctor if you have experienced lows.`,
  },
  {
    title_my: 'ခြေထောက်ထိန်းသိမ်းစောင့်ရှောက်မှု',
    title_en: 'Foot care',
    category: 'care', sort: 4,
    body_my: `ဆီးချိုသမားတွေမှာ သွေးလည်ပတ်မှု အားနည်းခြင်းနဲ့ အာရုံကြောထိခိုက်မှုတို့ကြောင့် ခြေထောက်မှာ အနာဖြစ်ရင် သိဖို့ခက်ပြီး ကျက်ဖို့ နှေးတတ်ပါတယ်။ သေးငယ်တဲ့ အနာကနေ ပြင်းထန်တဲ့ ပိုးဝင်ခြင်းအထိ ဖြစ်နိုင်လို့ နေ့စဉ်ဂရုစိုက်ဖို့ လိုပါတယ်။

နေ့တိုင်း ခြေထောက်ကို စစ်ဆေးပါ — ခြေဖဝါး၊ ခြေချောင်းကြားအပါအဝင် အနာ၊ အရေပြားကွဲခြင်း၊ အနီစက်၊ အဖုအပိမ့်များ ရှိမရှိ ကြည့်ပါ။ ကိုယ်တိုင်မမြင်ရရင် မှန် (သို့) မိသားစုဝင်ကို အကူအညီတောင်းပါ။

ခြေထောက်ကို နေ့တိုင်း ရေနွေးနွေးနဲ့ ဆေး၊ သုတ်ခြောက်အောင် သုတ်ပါ (ခြေချောင်းကြားပါ)။ အသားပတ်ခြောက်ရင် လိမ်းဆေးလိမ်းပါ — ဒါပေမယ့် ခြေချောင်းကြားမှာ မလိမ်းပါနဲ့။ ခြေသည်းကို တည့်တည့်ညှပ်ပါ၊ ထောင့်တွေကို နက်နက်မညှပ်ပါနဲ့။

ခြေနင်းပြား (သို့) ဖိနပ်ကို အမြဲစီးပါ — ခြေဗလာနဲ့ လုံးဝမလှမ်းပါနဲ့။ ချောင်ချောင်ချိချိ၊ ခြေချောင်းထိပ်မှာ နေရာလုံလောက်တဲ့ ဖိနပ်ရွေးပါ။ ဖိနပ်မစီးခင် အထဲမှာ ခဲ/သဲ ရှိမရှိ ခါထုတ်ပါ။

အနာ၊ အရေပြားကွဲတာ၊ အနီရောင်ပြန့်လာတာ၊ ရောင်ရမ်းတာ တွေ့တာနဲ့ ဆရာဝန်ပြပါ — ကိုယ့်ဘာသာ ခွဲစိတ်တာ၊ အနာကို လျစ်လျူရှုတာ မလုပ်ပါနဲ့။`,
    body_en: `People with diabetes can develop poor circulation and nerve damage in the feet, so wounds may go unnoticed and heal slowly. A small cut can turn into a serious infection, so daily care matters.

Inspect your feet every day — soles and between toes — for cuts, cracks, red spots, or blisters. Use a mirror or ask a family member if you cannot see.

Wash feet daily with lukewarm water and dry thoroughly, including between toes. Moisturize dry skin but not between the toes. Trim nails straight across, not too deep at the corners.

Always wear sandals or shoes — never walk barefoot. Choose roomy footwear with enough toe space, and shake out shoes before wearing.

See a doctor promptly for any cut, spreading redness, or swelling — never cut it yourself or ignore it.`,
  },
  {
    title_my: 'ဆေးမှန်မှန်သောက်ဖို့ ဘာကြောင့်အရေးကြီးသလဲ',
    title_en: 'Why taking medication regularly matters',
    category: 'medication', sort: 5,
    body_my: `ဆီးချိုဆေးတွေဟာ သွေးသကြားဓာတ်ကို ထိန်းထားဖို့ နေ့တိုင်း၊ အချိန်မှန် သောက်ဖို့ လိုပါတယ်။ "ဒီနေ့ နေကောင်းတယ်၊ သွေးသကြားလည်း ကောင်းတယ်" ဆိုပြီး ဆေးရပ်လိုက်ရင် သကြားဓာတ် ပြန်တက်လာပြီး ရေရှည်မှာ မျက်စိ၊ ကျောက်ကပ်၊ နှလုံး ထိခိုက်နိုင်ပါတယ်။

ဆေးမေ့တာ၊ အချိန်လွဲတာ ဖြစ်တတ်ပါတယ်။ အဲဒါကို ကာကွယ်ဖို့ — ဆေးသောက်ချိန်ကို နေ့စဉ်လုပ်ရိုးလုပ်စဉ် (မနက်စာ၊ သွားတိုက်ချိန်) နဲ့ တွဲမှတ်ပါ၊ တစ်ပတ်စာ ဆေးဘူး (pill box) သုံးပါ၊ ဖုန်းမှာ သတိပေးချက် (alarm) ထားပါ၊ ဒီ app လို မှတ်တမ်းတင်တဲ့ tool သုံးပြီး ✓ အမှတ်အသားလုပ်ပါ။

ဆေးကုန်ခါနီးမှာ ကြိုဝယ်ထားပါ။ ခရီးသွားရင် လိုတာထက် ပိုဆောင်သွားပါ။

ဘေးထွက်ဆိုးကျိုး (ဗိုက်အောင့်၊ မူးဝေ စသည်) ခံစားရရင် ကိုယ့်ဘာသာ ဆေးရပ်တာ၊ ပမာဏလျှော့တာ မလုပ်ပါနဲ့ — ဆရာဝန်ကို ပြောပြပြီး ညွှန်ကြားချက်ယူပါ။ ဆရာဝန်မညွှန်ဘဲ တိုင်းရင်းဆေး/ဖြည့်စွက်စာတွေနဲ့ အစားထိုးတာလည်း အန္တရာယ်ရှိပါတယ်။

သွေးသကြားထိန်းထားနိုင်တာရဲ့ အဓိကသော့ချက်က ဆေးမှန်မှန်သောက်ခြင်းပါပဲ။`,
    body_en: `Diabetes medicines must be taken every day, on time, to keep blood sugar controlled. Stopping because "I feel fine today" lets sugar rise again and can damage eyes, kidneys, and heart over time.

To avoid missing doses: link dose times to daily routines (breakfast, brushing teeth), use a weekly pill box, set phone alarms, and track with a tool like this app.

Buy refills before running out, and carry extra when traveling.

If you feel side effects (stomach upset, dizziness), do not stop or reduce the dose yourself — tell your doctor and follow their advice. Replacing prescribed medicine with unproven supplements without medical guidance is risky.

Regular medication is the key to keeping blood sugar in check.`,
  },
  {
    title_my: 'ကိုယ်လက်လှုပ်ရှားမှုနှင့် ဆီးချို',
    title_en: 'Exercise and diabetes',
    category: 'activity', sort: 6,
    body_my: `ကိုယ်လက်လှုပ်ရှားမှုဟာ သွေးသကြားဓာတ် ကျစေပြီး၊ အင်ဆူလင်ကို ခန္ဓာကိုယ်က ပိုကောင်းအောင် အသုံးချနိုင်စေပါတယ်။ ဒါ့အပြင် ကိုယ်အလေးချိန်ထိန်း၊ သွေးပေါင်ချိန်ကျ၊ စိတ်ချမ်းသာစေပါတယ်။

ယေဘုယျလမ်းညွှန်ချက်အရ တစ်ပတ်မှာ အလယ်အလတ်ပြင်းထန်မှု (လမ်းမြန်မြန်လျှောက်သလောက်) မိနစ် 150 ခန့် ရအောင် လုပ်သင့်ပါတယ်။ တစ်ခါတည်း နာရီဝက်ထက် 10-15 မိနစ်စီ ခွဲလုပ်လို့ရပါတယ်။ အစာစားပြီး လမ်းလျှောက်တာဟာ သွေးသကြားတက်ခြင်းကို ထိန်းရာမှာ အထူးထိရောက်ပါတယ်။

သတိထားရမှာတွေ — မစဖူးရင် ဖြည်းဖြည်းချင်း စပါ၊ ပြင်းထန်တဲ့ လေ့ကျင့်ခန်းမလုပ်ခင် သွေးသကြားတိုင်းပါ (အရမ်းကျနေရင် မလုပ်ပါနဲ့)၊ သကြားလုံး/အချိုရည် ဆောင်ထားပါ၊ ရေများများသောက်ပါ၊ ခြေထောက်ကို သင့်တော်တဲ့ ဖိနပ်စီးပါ၊ ရင်ဘတ်အောင့်တာ၊ မူးဝေတာ ခံစားရရင် ချက်ချင်းရပ်ပါ။

အင်ဆူလင်ထိုးသူတွေ၊ နှလုံး/မျက်စိ နောက်ဆက်တွဲရှိသူတွေကတော့ လေ့ကျင့်ခန်းအစီအစဉ် မစခင် ဆရာဝန်နဲ့ တိုင်ပင်သင့်ပါတယ်။

ဒီအချက်တွေဟာ ယေဘုယျလမ်းညွှန်ချက်သာ ဖြစ်ပါတယ် — ကိုယ့်အခြေအနေနဲ့ ကိုက်ညီတဲ့ အစီအစဉ်ကို ဆရာဝန်နဲ့ ဆွေးနွေးပါ။`,
    body_en: `Exercise lowers blood sugar and helps the body use insulin better. It also controls weight and blood pressure and improves mood.

As a general guide, aim for about 150 minutes per week of moderate activity (like brisk walking). You can split it into 10–15 minute sessions. Walking after meals is especially effective against sugar spikes.

Precautions: start slowly if you are new to it, check blood sugar before intense exercise (skip it if very low), carry candy or a soft drink, drink plenty of water, wear proper footwear, and stop immediately if you feel chest pain or dizziness.

People on insulin or with heart/eye complications should consult their doctor before starting an exercise plan.

These are general guidelines only — discuss a plan suited to your condition with your doctor.`,
  },
];
{
  const n = db.prepare('SELECT COUNT(*) c FROM articles').get().c;
  if (n === 0) {
    const ins = db.prepare('INSERT INTO articles (title_my, title_en, body_my, body_en, category, sort) VALUES (?,?,?,?,?,?)');
    for (const a of ARTICLE_SEED) ins.run(a.title_my, a.title_en, a.body_my, a.body_en, a.category, a.sort);
    console.log('[db] seeded', ARTICLE_SEED.length, 'education articles');
  }
}

module.exports = db;
