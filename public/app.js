/* Diabetes Lifestyle Management — vanilla JS SPA. No frameworks, no CDN. */
'use strict';
const YG = 6.5 * 3600 * 1000;
const pad = n => String(n).padStart(2, '0');

/* ---------------- i18n ---------------- */
const I18N = {
my: {
  appName:'ဆီးချို Tracker', loading:'ဖွင့်နေသည်…',
  nav_dashboard:'ပင်မ', nav_glucose:'သွေးသကြား', nav_food:'အစားအသောက်', nav_meds:'ဆေး', nav_more:'နောက်ထပ်',
  save:'သိမ်းမည်', cancel:'မလုပ်တော့', delete:'ဖျက်မည်', edit:'ပြင်မည်', add:'ထည့်မည်', back:'နောက်သို့',
  close:'ပိတ်မည်', date:'နေ့စွဲ', time:'အချိန်', note:'မှတ်ချက်', search:'ရှာဖွေရန်', total:'စုစုပေါင်း',
  confirm_delete:'ဖျက်မှာ သေချာပါသလား?', actions:'လုပ်ဆောင်ချက်', from:'မှ', to:'ထိ', print:'Print ထုတ်မည်',
  optional:'မဖြစ်မနေမဟုတ်',
  login:'ဝင်မည်', signup:'အကောင့်ဖွင့်မည်', email:'အီးမေးလ်', password:'စကားဝှက်', name:'အမည်',
  logout:'ထွက်မည်', no_account:'အကောင့်မရှိသေးဘူးလား?', have_account:'အကောင့်ရှိပြီးသားလား?',
  login_fail:'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါတယ်', signup_fail:'အကောင့်ဖွင့်၍မရပါ',
  email_taken:'ဒီအီးမေးလ်နဲ့ အကောင့်ရှိပြီးသားပါ', password_length:'စကားဝှက်အနည်းဆုံး ၆ လုံး ရှိရပါမယ်',
  change_password:'စကားဝှက်ပြောင်းမည်', current_password:'လက်ရှိစကားဝှက်', new_password:'စကားဝှက်အသစ်',
  password_changed:'စကားဝှက် ပြောင်းပြီးပါပြီ', delete_account:'အကောင့်ဖျက်မည်',
  delete_account_warn:'အကောင့်ဖျက်လိုက်ရင် ဒေတာအားလုံး အပြီးတိုင် ပျက်သွားပါမယ်။',
  dash_today:'ယနေ့ အကျဉ်းချုပ်', readings:'တိုင်းတာမှု', avg:'ပျမ်းမျှ', meds_due:'သောက်ရန်ကျန်သော ဆေး',
  meds_taken:'သောက်ပြီး', steps:'ခြေလှမ်း', active_min:'လှုပ်ရှားမှု (မိနစ်)', carbs:'ကစီဓာတ် (g)',
  q_glucose:'သွေးသကြား', q_food:'အစားအသောက်', q_med:'ဆေးမှတ်တမ်း', q_activity:'လှုပ်ရှားမှု',
  trend7:'၇ ရက်တာ သွေးသကြားဓာတ်', reminders:'သတိပေးချက်များ', no_reminders:'သတိပေးချက် မရှိပါ',
  next_visit:'နောက်ဆေးခန်းရက်ချိန်း', low_stock:'ဆေးကုန်ခါနီးများ', due_now:'သောက်ချိန်ရောက်နေပါပြီ',
  enable_notify:'သတိပေးချက် (notification) ဖွင့်မည်',
  g_title:'သွေးတွင်းသကြားဓာတ်', g_add:'မှတ်တမ်းအသစ်ထည့်မည်', g_value:'တန်ဖိုး', g_type:'အမျိုးအစား',
  fasting:'အစာမစားခင်', postmeal:'အစာစားပြီး ၂ နာရီ', wakeup:'အိပ်ရာထ', bedtime:'အိပ်ရာဝင်ခါနီး', random:'ကျပန်း',
  g_measured:'တိုင်းတာသည့်အချိန်', g_history:'မှတ်တမ်းများ', g_stats:'စာရင်းအကျဉ်းချုပ်',
  min:'အနိမ့်ဆုံး', max:'အမြင့်ဆုံး', tir:'Target range ထဲမှာ', g_ref:'ယေဘုယျ reference (ADA): အစာမစားခင် 80–130 mg/dL · စားပြီး ၂ နာရီ <180 mg/dL — အသိပေးချက်သာ',
  p7:'၇ ရက်', p14:'၁၄ ရက်', p30:'ရက် ၃၀', p90:'ရက် ၉၀', no_data:'ဒေတာ မရှိသေးပါ',
  value_out_of_range:'တန်ဖိုးက 20–600 mg/dL အတွင်း ရှိရပါမယ်',
  f_title:'အစားအသောက်မှတ်တမ်း', f_search_ph:'ဥပမာ — ထမင်း, မုန့်ဟင်းခါး…', f_add_custom:'ကိုယ်ပိုင်အစားအစာ ထည့်မည်',
  f_custom_name:'အစားအစာအမည်', f_serving:'ပမာဏ (ဥပမာ — ၁ ပွဲ)', f_carbs:'ကစီဓာတ် (g)',
  f_meal:'အစာအမျိုးအစား', breakfast:'မနက်စာ', lunch:'နေ့လည်စာ', dinner:'ညစာ', snack:'အဆာပြေ',
  f_log:'မှတ်တမ်းတင်မည်', f_today:'ယနေ့ စားသုံးမှု', f_total:'ယနေ့ ကစီဓာတ်စုစုပေါင်း',
  f_warn:'⚠️ ကစီဓာတ်တန်ဖိုးများသည် ခန့်မှန်းခြေသာ ဖြစ်သည်', f_qty:'အချိုး', f_pick_meal:'ဘယ်အစာလဲ ရွေးပါ',
  m_title:'ဆေးဝါး', m_today:'ယနေ့ ဆေးဇယား', m_list:'ဆေးစာရင်း', m_add:'ဆေးအသစ်ထည့်မည်',
  m_name:'ဆေးအမည်', m_dose:'ပမာဏ (ဥပမာ — 500mg ၁ လုံး)', m_times:'သောက်ချိန်များ', m_add_time:'အချိန်ထပ်ထည့်မည်',
  m_meal_rel:'အစာနဲ့ ဆက်စပ်မှု', before:'အစာမစားခင်', with:'အစာနဲ့အတူ', after:'အစာစားပြီး', any:'သတ်မှတ်ချက်မရှိ',
  m_start:'စတင်သည့်နေ့', m_end:'ရပ်မည့်နေ့ (မရှိရင် ချန်ထား)', m_stock:'လက်ကျန်ပမာဏ', m_active:'အသုံးပြုနေဆဲ',
  mark_taken:'✓ သောက်ပြီး', mark_skipped:'ကျော်မည်', undo:'ပြန်ပြင်မည်', st_taken:'သောက်ပြီး', st_skipped:'ကျော်သွား', st_pending:'မသောက်ရသေး',
  adherence:'သောက်မှန်မှု', low_stock_warn:'ဆေးကုန်ခါနီးပါပြီ — ကြိုဝယ်ထားပါ', no_meds:'ဆေးစာရင်း မရှိသေးပါ',
  a_title:'ကိုယ်လက်လှုပ်ရှားမှု', a_add:'မှတ်တမ်းထည့်မည်', a_type:'အမျိုးအစား',
  walk:'လမ်းလျှောက်', run:'ပြေး', cycle:'စက်ဘီး', yoga:'ယောဂ', swim:'ရေကူး', other:'အခြား', steps_only:'ခြေလှမ်းသီးသန့်',
  a_duration:'ကြာချိန် (မိနစ်)', a_intensity:'ပြင်းထန်မှု', low:'ပေါ့', moderate:'အလယ်', high:'ပြင်း',
  a_steps:'ခြေလှမ်း', a_log_steps:'ခြေလှမ်းမှတ်မည်', a_import:'CSV ထည့်သွင်းမည်',
  a_csv_hint:'ဖုန်း health app က ထုတ်တဲ့ CSV (date,steps) ကို paste ချပါ — ဥပမာ:\n2026-09-27,8432\n2026-09-28,6105',
  a_imported:'ထည့်သွင်းပြီးပါပြီ', a_week:'၇ ရက်တာ စာရင်း', minutes:'မိနစ်', sessions:'အကြိမ်', no_activity:'မှတ်တမ်း မရှိသေးပါ',
  w_title:'ကိုယ်အလေးချိန် + သွေးပေါင်ချိန်', w_add:'မှတ်တမ်းထည့်မည်', weight_kg:'ကိုယ်အလေးချိန် (kg)',
  systolic:'အပေါ်သွေး (systolic)', diastolic:'အောက်သွေး (diastolic)', pulse:'သွေးခုန်နှုန်း (/မိနစ်)',
  w_trend:'အပြောင်းအလဲ', no_records:'မှတ်တမ်း မရှိသေးပါ',
  l_title:'ဓာတ်ခွဲစစ်ဆေးချက်များ', l_add:'ရလဒ်ထည့်မည်', l_test:'စစ်ဆေးချက်အမည်', l_value:'တန်ဖိုး',
  l_unit:'ယူနစ်', l_date:'စစ်ဆေးသည့်နေ့', l_hba1c:'HbA1c အပြောင်းအလဲ', l_ref:'ယေဘုယျ target: HbA1c <7% — အသိပေးချက်သာ',
  no_labs:'ရလဒ် မရှိသေးပါ',
  v_title:'ဆေးခန်းမှတ်တမ်း', v_add:'ရက်ချိန်းထည့်မည်', v_date:'ရက်စွဲ', v_doctor:'ဆရာဝန်အမည်', v_clinic:'ဆေးခန်း',
  v_notes:'မှတ်ချက်', v_questions:'မေးခွန်းများ (ဆရာဝန်ကိုမေးဖို့)', v_next:'နောက်တစ်ကြိမ် ရက်ချိန်း',
  v_upcoming:'လာမည့် ရက်ချိန်း', no_visits:'ရက်ချိန်း မရှိသေးပါ',
  r_title:'အစီရင်ခံစာ', r_period:'ကာလ', week:'အပတ်', month:'လ', r_for:'အစီရင်ခံစာ',
  r_glucose:'သွေးသကြားဓာတ် အကျဉ်းချုပ်', r_meds:'ဆေးသောက်မှန်မှု', r_diet:'အစားအသောက် အကျဉ်းချုပ်',
  r_activity:'လှုပ်ရှားမှု အကျဉ်းချုပ်', r_labs:'ဓာတ်ခွဲရလဒ်များ', r_print:'Print / PDF သိမ်းမည်',
  r_note:'ဒီအစီရင်ခံစာကို ဆရာဝန်ပြသနိုင်ပါတယ်။ Print နှိပ် → PDF အဖြစ် သိမ်းပါ။',
  r_carbs_day:'နေ့စဉ် ကစီဓာတ် (g)', r_latest:'နောက်ဆုံးတိုင်းတာချက်',
  e_title:'ဆီးချိုပညာပေး', e_read:'ဖတ်မည်', emergency:'အရေးပေါ်',
  s_title:'ဆက်တင်များ', s_profile:'ကိုယ်ရေးအချက်အလက်', s_language:'ဘာသာစကား',
  s_unit:'သွေးသကြားဓာတ် ယူနစ်', s_dtype:'ဆီးချိုအမျိုးအစား',
  type1:'Type 1', type2:'Type 2', gestational:'ကိုယ်ဝန်ဆောင်', unknown_type:'မသိပါ',
  s_dyear:'စတင်သိသည့်နှစ်', s_targets:'Target range (ဆရာဝန်နဲ့ညှိ၍ ပြင်နိုင်သည်)',
  s_fasting:'အစာမစားခင်', s_postmeal:'အစာစားပြီး အမြင့်ဆုံး', s_saved:'သိမ်းပြီးပါပြီ',
  s_security:'လုံခြုံရေး', s_export:'ဒေတာ ထုတ်ယူမည်', s_json:'JSON (အားလုံး)', s_csv:'CSV',
  s_danger:'အန္တရာယ်ရှိသောဇုန်', s_del_confirm:'အကောင့်ဖျက်ဖို့ စကားဝှက် ရိုက်ထည့်ပါ',
  s_disclaimer:'သတိပေးချက်',
  d_title:'ကြိုဆိုပါတယ်', d_understood:'နားလည်ပါပြီ',
  d_text:'ဒီ app ဟာ ဆီးချိုသမားတွေ ကိုယ့်ဘာသာ နေ့စဉ်ဘဝကို မှတ်သားထိန်းသိမ်းဖို့ tool သက်သက်သာ ဖြစ်ပါတယ်။ ရောဂါအမည်တပ်ခြင်း၊ ဆေးညွှန်းပေးခြင်း၊ ကုသမှုအကြံပြုခြင်း မလုပ်ပါ။ ပြထားသော target range များသည် ယေဘုယျ reference သာဖြစ်ပြီး ဆရာဝန်၏ ညွှန်ကြားချက်ကို အစားမထိုးပါ။ ကျန်းမာရေးဆိုင်ရာ ဆုံးဖြတ်ချက်တိုင်းကို ဆရာဝန်နဲ့ တိုင်ပင်ပါ။',
  err:'အမှားတစ်ခု ဖြစ်ပေါ်နေပါတယ်', retry:'ထပ်ကြိုးစားမည်',
  more_activity:'ကိုယ်လက်လှုပ်ရှားမှု', more_weight:'ကိုယ်အလေးချိန်/သွေးပေါင်ချိန်', more_labs:'ဓာတ်ခွဲစစ်ဆေးချက်',
  more_visits:'ဆေးခန်းမှတ်တမ်း', more_reports:'အစီရင်ခံစာ', more_edu:'ပညာပေး', more_settings:'ဆက်တင်များ',
},
en: {
  appName:'Diabetes Tracker', loading:'Loading…',
  nav_dashboard:'Home', nav_glucose:'Glucose', nav_food:'Food', nav_meds:'Meds', nav_more:'More',
  save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit', add:'Add', back:'Back',
  close:'Close', date:'Date', time:'Time', note:'Note', search:'Search', total:'Total',
  confirm_delete:'Are you sure you want to delete?', actions:'Actions', from:'From', to:'To', print:'Print',
  optional:'optional',
  login:'Log in', signup:'Sign up', email:'Email', password:'Password', name:'Name',
  logout:'Log out', no_account:"Don't have an account?", have_account:'Already have an account?',
  login_fail:'Wrong email or password', signup_fail:'Could not sign up',
  email_taken:'This email is already registered', password_length:'Password must be at least 6 characters',
  change_password:'Change password', current_password:'Current password', new_password:'New password',
  password_changed:'Password changed', delete_account:'Delete account',
  delete_account_warn:'Deleting your account permanently erases all your data.',
  dash_today:"Today's summary", readings:'Readings', avg:'Average', meds_due:'Meds still due',
  meds_taken:'Taken', steps:'Steps', active_min:'Active (min)', carbs:'Carbs (g)',
  q_glucose:'Glucose', q_food:'Food', q_med:'Med log', q_activity:'Activity',
  trend7:'7-day glucose trend', reminders:'Reminders', no_reminders:'No reminders',
  next_visit:'Next appointment', low_stock:'Low stock', due_now:'Due now',
  enable_notify:'Enable notifications',
  g_title:'Blood glucose', g_add:'Add reading', g_value:'Value', g_type:'Type',
  fasting:'Fasting', postmeal:'2h after meal', wakeup:'Wake up', bedtime:'Bedtime', random:'Random',
  g_measured:'Measured at', g_history:'History', g_stats:'Summary',
  min:'Min', max:'Max', tir:'In target range', g_ref:'General reference (ADA): fasting 80–130 mg/dL · <180 mg/dL 2h after meal — info only',
  p7:'7 days', p14:'14 days', p30:'30 days', p90:'90 days', no_data:'No data yet',
  value_out_of_range:'Value must be between 20–600 mg/dL',
  f_title:'Food diary', f_search_ph:'e.g. rice, mohinga…', f_add_custom:'Add custom food',
  f_custom_name:'Food name', f_serving:'Serving (e.g. 1 bowl)', f_carbs:'Carbs (g)',
  f_meal:'Meal', breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack',
  f_log:'Log food', f_today:"Today's intake", f_total:"Today's total carbs",
  f_warn:'⚠️ Carb values are estimates only', f_qty:'Portions', f_pick_meal:'Pick a meal',
  m_title:'Medications', m_today:"Today's schedule", m_list:'Medication list', m_add:'Add medication',
  m_name:'Medicine name', m_dose:'Dose (e.g. 500mg 1 tab)', m_times:'Times', m_add_time:'Add time',
  m_meal_rel:'Relation to meals', before:'Before meal', with:'With meal', after:'After meal', any:'No rule',
  m_start:'Start date', m_end:'End date (leave empty if ongoing)', m_stock:'Stock qty', m_active:'Active',
  mark_taken:'✓ Taken', mark_skipped:'Skip', undo:'Undo', st_taken:'Taken', st_skipped:'Skipped', st_pending:'Pending',
  adherence:'Adherence', low_stock_warn:'Running low — restock soon', no_meds:'No medications yet',
  a_title:'Physical activity', a_add:'Add record', a_type:'Type',
  walk:'Walk', run:'Run', cycle:'Cycling', yoga:'Yoga', swim:'Swim', other:'Other', steps_only:'Steps only',
  a_duration:'Duration (min)', a_intensity:'Intensity', low:'Low', moderate:'Moderate', high:'High',
  a_steps:'Steps', a_log_steps:'Log steps', a_import:'Import CSV',
  a_csv_hint:'Paste CSV from your phone health app (date,steps) — e.g.:\n2026-09-27,8432\n2026-09-28,6105',
  a_imported:'Imported', a_week:'Last 7 days', minutes:'min', sessions:'sessions', no_activity:'No records yet',
  w_title:'Weight + blood pressure', w_add:'Add record', weight_kg:'Weight (kg)',
  systolic:'Systolic (upper)', diastolic:'Diastolic (lower)', pulse:'Pulse (/min)',
  w_trend:'Trends', no_records:'No records yet',
  l_title:'Lab results', l_add:'Add result', l_test:'Test name', l_value:'Value',
  l_unit:'Unit', l_date:'Test date', l_hba1c:'HbA1c trend', l_ref:'General target: HbA1c <7% — info only',
  no_labs:'No results yet',
  v_title:'Doctor visits', v_add:'Add appointment', v_date:'Date', v_doctor:'Doctor', v_clinic:'Clinic',
  v_notes:'Notes', v_questions:'Questions (to ask the doctor)', v_next:'Next appointment',
  v_upcoming:'Upcoming', no_visits:'No appointments yet',
  r_title:'Reports', r_period:'Period', week:'Week', month:'Month', r_for:'Report',
  r_glucose:'Glucose summary', r_meds:'Medication adherence', r_diet:'Diet summary',
  r_activity:'Activity summary', r_labs:'Lab results', r_print:'Print / save PDF',
  r_note:'You can show this report to your doctor. Press Print → save as PDF.',
  r_carbs_day:'Daily carbs (g)', r_latest:'Latest measurement',
  e_title:'Diabetes education', e_read:'Read', emergency:'EMERGENCY',
  s_title:'Settings', s_profile:'Profile', s_language:'Language',
  s_unit:'Glucose unit', s_dtype:'Diabetes type',
  type1:'Type 1', type2:'Type 2', gestational:'Gestational', unknown_type:'Unknown',
  s_dyear:'Year diagnosed', s_targets:'Target ranges (adjust with your doctor)',
  s_fasting:'Fasting', s_postmeal:'After-meal max', s_saved:'Saved',
  s_security:'Security', s_export:'Export data', s_json:'JSON (everything)', s_csv:'CSV',
  s_danger:'Danger zone', s_del_confirm:'Type your password to delete the account',
  s_disclaimer:'Disclaimer',
  d_title:'Welcome', d_understood:'I understand',
  d_text:'This app is a self-tracking tool for people with diabetes to manage daily life. It does not diagnose, prescribe, or give treatment advice. Target ranges shown are general references only and do not replace your doctor\u2019s guidance. Consult your doctor for all medical decisions.',
  err:'Something went wrong', retry:'Retry',
  more_activity:'Physical activity', more_weight:'Weight / blood pressure', more_labs:'Lab results',
  more_visits:'Doctor visits', more_reports:'Reports', more_edu:'Education', more_settings:'Settings',
}};
const t = k => (I18N[S.lang] && I18N[S.lang][k]) || I18N.my[k] || k;

/* ---------------- state + helpers ---------------- */
let S = { user: null, lang: 'my' };
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function api(path, opts={}) {
  const r = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opts });
  let data = null; try { data = await r.json(); } catch(e){}
  if (!r.ok) { const err = new Error((data&&data.error)||'request_failed'); err.code = data&&data.error; err.status = r.status; throw err; }
  return data;
}
function ygNow(){ return new Date(Date.now()+YG); }
function todayStr(){ const d=ygNow(); return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate()); }
function monthStr(){ const d=ygNow(); return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1); }
function fmtDT(iso){ if(!iso) return '—'; const d=new Date(new Date(iso).getTime()+YG);
  return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes()); }
function fmtD(iso){ return fmtDT(iso).slice(0,10); }
function nowLocalInput(){ const d=ygNow(); return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes()); }
function inputToISO(local){ const [d,tm]=String(local).split('T'); const [Y,M,D]=d.split('-').map(Number);
  const [h,m]=String(tm||'00:00').split(':').map(Number);
  return new Date(Date.UTC(Y,M-1,D,h,m||0)-YG).toISOString(); }
function gVal(mgdl){ return S.user.glucose_unit==='mmol' ? (Math.round(mgdl/18*10)/10) : Math.round(mgdl); }
function gUnit(){ return S.user.glucose_unit==='mmol' ? 'mmol/L' : 'mg/dL'; }
function gInputToMgdl(v){ const n=Number(v); return S.user.glucose_unit==='mmol' ? Math.round(n*18) : Math.round(n); }

/* ---------------- inline SVG charts ---------------- */
function lineChart(points, opts={}) {
  // points: [{x:'label', y:number}]  opts: {band:{low,high}, color, unit}
  const W=640,H=250,P={l:46,r:12,t:14,b:34};
  if(!points.length) return `<div class="muted center" style="padding:20px">${esc(t('no_data'))}</div>`;
  const ys=points.map(p=>p.y);
  let mn=Math.min(...ys), mx=Math.max(...ys);
  if(opts.band){ mn=Math.min(mn,opts.band.low); mx=Math.max(mx,opts.band.high); }
  const span=(mx-mn)||1; mn-=span*0.15; mx+=span*0.15;
  const iw=W-P.l-P.r, ih=H-P.t-P.b;
  const X=i=>P.l+iw*(points.length===1?0.5:i/(points.length-1));
  const Y=v=>P.t+ih*(1-(v-mn)/(mx-mn));
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  if(opts.band){ s+=`<rect x="${P.l}" y="${Y(opts.band.high)}" width="${iw}" height="${Y(opts.band.low)-Y(opts.band.high)}" fill="#dcfce7" opacity="0.7"/>`; }
  for(let g=0; g<=4; g++){ const v=mn+(mx-mn)*g/4, y=Y(v);
    s+=`<line x1="${P.l}" y1="${y}" x2="${W-P.r}" y2="${y}" stroke="#e5e9f2"/><text x="${P.l-6}" y="${y+4}" text-anchor="end" font-size="11" fill="#6b7689">${Math.round(v)}</text>`; }
  const step=Math.max(1,Math.floor(points.length/8));
  points.forEach((p,i)=>{ if(i%step===0||i===points.length-1){
    s+=`<text x="${X(i)}" y="${H-10}" text-anchor="middle" font-size="10" fill="#6b7689">${esc(String(p.x).slice(5))}</text>`; }});
  const line=points.map((p,i)=>`${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  s+=`<polyline points="${line}" fill="none" stroke="${opts.color||'#2563eb'}" stroke-width="2.5"/>`;
  points.forEach((p,i)=>{ s+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5" fill="${opts.color||'#2563eb'}"><title>${esc(p.x)}: ${p.y}</title></circle>`; });
  return s+'</svg>';
}
function barChart(items, opts={}) {
  // items: [{x:'label', y:number}]
  const W=640,H=230,P={l:46,r:12,t:14,b:34};
  if(!items.length) return `<div class="muted center" style="padding:20px">${esc(t('no_data'))}</div>`;
  const mx=Math.max(...items.map(p=>p.y),1)*1.15;
  const iw=W-P.l-P.r, ih=H-P.t-P.b, n=items.length, bw=Math.min(46, iw/n*0.6);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  for(let g=0; g<=4; g++){ const v=mx*g/4, y=P.t+ih*(1-v/mx);
    s+=`<line x1="${P.l}" y1="${y}" x2="${W-P.r}" y2="${y}" stroke="#e5e9f2"/><text x="${P.l-6}" y="${y+4}" text-anchor="end" font-size="11" fill="#6b7689">${Math.round(v)}</text>`; }
  items.forEach((p,i)=>{ const cx=P.l+iw*(i+0.5)/n, h=ih*p.y/mx, y=P.t+ih-h;
    s+=`<rect x="${(cx-bw/2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="4" fill="${opts.color||'#0ea5e9'}"><title>${esc(p.x)}: ${p.y}</title></rect>`;
    if(n<=14) s+=`<text x="${cx.toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="10" fill="#6b7689">${esc(String(p.x).slice(5))}</text>`; });
  return s+'</svg>';
}

/* ---------------- modal ---------------- */
function showModal(html){ document.getElementById('modal-root').innerHTML=`<div class="modal-back"><div class="modal">${html}</div></div>`; }
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }
function showDisclaimer(){
  showModal(`<h2>⚠️ ${esc(t('d_title'))}</h2><p>${esc(t('d_text'))}</p>
    <button class="btn block" id="dis-ok">${esc(t('d_understood'))}</button>`);
  document.getElementById('dis-ok').onclick=()=>{
    try{ localStorage.setItem('dm_disclaimer_'+S.user.id,'1'); }catch(e){}
    closeModal();
  };
}

/* ---------------- nav / shell ---------------- */
const NAV=[['#/dashboard','🏠','nav_dashboard'],['#/glucose','🩸','nav_glucose'],['#/food','🍚','nav_food'],['#/meds','💊','nav_meds'],['#/more','⋯','nav_more']];
function renderNav(){
  const nav=document.getElementById('bottomnav');
  if(!S.user){ nav.hidden=true; return; }
  nav.hidden=false;
  const h=location.hash||'#/dashboard';
  nav.innerHTML=NAV.map(([href,e,k])=>`<a href="${href}" class="${h===href||(href==='#/more'&&!NAV.slice(0,4).some(n=>n[0]===h))?'active':''}"><span class="e">${e}</span>${esc(t(k))}</a>`).join('');
}
function setTopbar(){
  const r=document.getElementById('topbar-right');
  document.getElementById('brand-name').textContent=t('appName');
  r.innerHTML = S.user ? `<span class="muted" style="color:#dbeafe;font-size:13px">${esc(S.user.name||S.user.email)}</span>
    <button class="btn small ghost" id="tb-logout" style="background:rgba(255,255,255,.15);color:#fff">${esc(t('logout'))}</button>` : '';
  const b=document.getElementById('tb-logout');
  if(b) b.onclick=async()=>{ await api('/api/auth/logout',{method:'POST'}); S.user=null; location.hash='#/login'; render(); };
}

/* ---------------- router ---------------- */
const routes={
  '#/login':pageLogin, '#/signup':pageSignup, '#/dashboard':pageDashboard, '#/glucose':pageGlucose,
  '#/food':pageFood, '#/meds':pageMeds, '#/more':pageMore, '#/activity':pageActivity,
  '#/weight':pageWeight, '#/labs':pageLabs, '#/visits':pageVisits, '#/reports':pageReports,
  '#/education':pageEducation, '#/settings':pageSettings,
};
let notifyTimer=null;
async function render(){
  const app=document.getElementById('app');
  renderNav(); setTopbar();
  let h=location.hash||'#/dashboard';
  if(!S.user && h!=='#/login' && h!=='#/signup'){ location.hash='#/login'; return; }
  if(S.user && (h==='#/login'||h==='#/signup')){ location.hash='#/dashboard'; return; }
  const [base,arg]=h.split('?');
  const fn=routes[base.split('/').slice(0,3).join('/') ] || (base.startsWith('#/education/')?pageArticle:null) || pageDashboard;
  app.innerHTML=`<div class="loading">${esc(t('loading'))}</div>`;
  try{ await fn(app, arg); }
  catch(e){ console.error(e); app.innerHTML=`<div class="card center"><p class="mb">${esc(t('err'))}</p><button class="btn" onclick="render()">${esc(t('retry'))}</button></div>`; }
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', render);

/* ---------------- auth pages ---------------- */
async function pageLogin(app){
  app.innerHTML=`<div class="card" style="margin-top:30px"><h3>🔑 ${esc(t('login'))}</h3>
    <form id="f"><label>${esc(t('email'))}</label><input name="email" type="email" required autocomplete="email">
    <label>${esc(t('password'))}</label><input name="password" type="password" required autocomplete="current-password">
    <div class="alert bad mt" id="e" hidden></div>
    <button class="btn block">${esc(t('login'))}</button></form>
    <p class="center mt muted">${esc(t('no_account'))} <a href="#/signup">${esc(t('signup'))}</a></p></div>`;
  document.getElementById('f').onsubmit=async ev=>{
    ev.preventDefault();
    const fd=new FormData(ev.target);
    try{ const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})});
      S.user=d.user; S.lang=d.user.lang||'my'; afterLogin(); location.hash='#/dashboard'; render();
    }catch(e){ const el=document.getElementById('e'); el.hidden=false;
      el.textContent = e.code==='invalid_credentials'?t('login_fail'):t('err'); }
  };
}
async function pageSignup(app){
  app.innerHTML=`<div class="card" style="margin-top:30px"><h3>📝 ${esc(t('signup'))}</h3>
    <form id="f"><label>${esc(t('name'))}</label><input name="name" required maxlength="80">
    <label>${esc(t('email'))}</label><input name="email" type="email" required autocomplete="email">
    <label>${esc(t('password'))}</label><input name="password" type="password" required minlength="6" autocomplete="new-password">
    <div class="alert bad mt" id="e" hidden></div>
    <button class="btn block">${esc(t('signup'))}</button></form>
    <p class="center mt muted">${esc(t('have_account'))} <a href="#/login">${esc(t('login'))}</a></p></div>`;
  document.getElementById('f').onsubmit=async ev=>{
    ev.preventDefault();
    const fd=new FormData(ev.target);
    try{ const d=await api('/api/auth/signup',{method:'POST',body:JSON.stringify({name:fd.get('name'),email:fd.get('email'),password:fd.get('password')})});
      S.user=d.user; S.lang=d.user.lang||'my'; afterLogin(); location.hash='#/dashboard'; render();
    }catch(e){ const el=document.getElementById('e'); el.hidden=false;
      el.textContent = e.code==='email_taken'?t('email_taken'):e.code==='password_length'?t('password_length'):t('signup_fail'); }
  };
}
function afterLogin(){
  let seen=false; try{ seen=!!localStorage.getItem('dm_disclaimer_'+S.user.id); }catch(e){}
  if(!seen) setTimeout(showDisclaimer, 400);
  // optional med reminder notifications
  if(notifyTimer) clearInterval(notifyTimer);
  notifyTimer=setInterval(checkMedReminders, 60000);
}
async function checkMedReminders(){
  if(!S.user || !('Notification' in window) || Notification.permission!=='granted') return;
  try{
    const d=await api('/api/med-schedule?date='+todayStr());
    const nowH=ygNow().getUTCHours()*60+ygNow().getUTCMinutes();
    for(const s of d.schedule){
      if(s.taken||s.skipped) continue;
      const [h,m]=s.time.split(':').map(Number); const mins=h*60+m;
      if(mins<=nowH && nowH-mins<10 && !s._notified){ s._notified=true;
        new Notification('💊 '+s.name, {body:`${s.time} — ${s.dose}`}); }
    }
  }catch(e){}
}

/* ---------------- dashboard ---------------- */
async function pageDashboard(app){
  const today=todayStr();
  const d=await api('/api/dashboard?date='+today);
  const from7=new Date(Date.now()-6*864e5).toISOString();
  const gr=await api('/api/glucose?from='+from7);
  const byDay={};
  for(const r of gr.readings){ const day=fmtD(r.measured_at); (byDay[day]=byDay[day]||[]).push(r.value_mgdl); }
  const pts=Object.keys(byDay).sort().map(day=>({x:day, y:Math.round(byDay[day].reduce((a,b)=>a+b,0)/byDay[day].length)}));
  const band={low:S.user.target_fasting_low, high:S.user.target_fasting_high};
  const dueNow=d.meds.due.filter(s=>{ const [h,m]=s.time.split(':').map(Number);
    return (h*60+m) <= ygNow().getUTCHours()*60+ygNow().getUTCMinutes(); });
  let rem='';
  for(const s of dueNow) rem+=`<div class="item"><span>💊</span><div class="grow"><b>${esc(s.name)}</b><div class="sub">${esc(s.time)} · ${esc(s.dose)} — ${esc(t('due_now'))}</div></div><a class="btn small" href="#/meds">${esc(t('mark_taken'))}</a></div>`;
  for(const s of d.lowStock) rem+=`<div class="alert warn" style="margin:8px 0">⚠️ <b>${esc(s.name)}</b> — ${esc(t('low_stock_warn'))} (${s.stock_qty})</div>`;
  if(d.nextVisit) rem+=`<div class="item"><span>🏥</span><div class="grow"><b>${esc(t('next_visit'))}</b><div class="sub">${esc(d.nextVisit.visit_date)}${d.nextVisit.doctor?' · '+esc(d.nextVisit.doctor):''}${d.nextVisit.clinic?' · '+esc(d.nextVisit.clinic):''}</div></div><a class="linklike" href="#/visits">→</a></div>`;
  if(!rem) rem=`<p class="muted">${esc(t('no_reminders'))}</p>`;
  const gAvg = d.glucose.avg==null ? '—' : gVal(d.glucose.avg)+' '+gUnit();
  app.innerHTML=`
  <div class="pagehead"><h2>👋 ${esc(t('dash_today'))}</h2><span class="muted">${today}</span></div>
  <div class="grid2 mb">
    <div class="stat"><div class="v">${d.glucose.count}</div><div class="l">🩸 ${esc(t('readings'))}${d.glucose.avg!=null?' · '+esc(t('avg'))+' '+gAvg:''}</div></div>
    <div class="stat ${d.meds.due.length?'warn':'ok'}"><div class="v">${d.meds.taken}/${d.meds.total}</div><div class="l">💊 ${esc(t('meds_taken'))}</div></div>
    <div class="stat"><div class="v">${d.activity.steps.toLocaleString()}</div><div class="l">👣 ${esc(t('steps'))}</div></div>
    <div class="stat"><div class="v">${d.carbsToday}</div><div class="l">🍚 ${esc(t('carbs'))}</div></div>
  </div>
  <div class="quick">
    <button data-go="#/glucose"><span class="e">🩸</span>${esc(t('q_glucose'))}</button>
    <button data-go="#/food"><span class="e">🍚</span>${esc(t('q_food'))}</button>
    <button data-go="#/meds"><span class="e">💊</span>${esc(t('q_med'))}</button>
    <button data-go="#/activity"><span class="e">🏃</span>${esc(t('q_activity'))}</button>
  </div>
  <div class="card"><h3>📈 ${esc(t('trend7'))}</h3>${lineChart(pts,{band,color:'#dc2626'})}</div>
  <div class="card"><h3>🔔 ${esc(t('reminders'))}</h3>${rem}
    <button class="btn ghost small mt" id="notif">${esc(t('enable_notify'))}</button></div>`;
  app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
  document.getElementById('notif').onclick=async()=>{
    if('Notification' in window){ await Notification.requestPermission(); checkMedReminders(); }
  };
}

/* ---------------- glucose ---------------- */
const RTYPES=['fasting','postmeal','wakeup','bedtime','random'];
let gPeriod=7;
async function pageGlucose(app){
  const to=new Date().toISOString();
  const from=new Date(Date.now()-(gPeriod-1)*864e5).toISOString();
  const [st,gr]=await Promise.all([api(`/api/glucose/stats?from=${from}&to=${to}`), api(`/api/glucose?from=${from}&to=${to}`)]);
  const byDay={};
  for(const r of [...gr.readings].reverse()){ const day=fmtD(r.measured_at); (byDay[day]=byDay[day]||[]).push(r.value_mgdl); }
  const pts=Object.keys(byDay).sort().map(day=>({x:day, y:Math.round(byDay[day].reduce((a,b)=>a+b,0)/byDay[day].length)}));
  const band={low:S.user.target_fasting_low, high:S.user.target_fasting_high};
  const typeName={fasting:t('fasting'),postmeal:t('postmeal'),wakeup:t('wakeup'),bedtime:t('bedtime'),random:t('random')};
  let hist=gr.readings.map(r=>`<div class="item"><span style="font-size:20px">🩸</span>
    <div class="grow"><b>${gVal(r.value_mgdl)} ${gUnit()}</b> <span class="badge">${esc(typeName[r.reading_type]||r.reading_type)}</span>
    <div class="sub">${fmtDT(r.measured_at)}${r.note?' · '+esc(r.note):''}</div></div>
    <button class="linklike" data-del="${r.id}">✕</button></div>`).join('');
  if(!hist) hist=`<p class="muted">${esc(t('no_data'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>🩸 ${esc(t('g_title'))}</h2></div>
  <div class="card"><h3>➕ ${esc(t('g_add'))}</h3>
    <form id="gf"><div class="row">
      <div><label>${esc(t('g_value'))} (${gUnit()})</label><input name="value" type="number" step="any" required min="1"></div>
      <div><label>${esc(t('g_type'))}</label><select name="reading_type">${RTYPES.map(x=>`<option value="${x}">${esc(typeName[x])}</option>`).join('')}</select></div>
    </div>
    <label>${esc(t('g_measured'))}</label><input name="measured_at" type="datetime-local" value="${nowLocalInput()}">
    <label>${esc(t('note'))}</label><input name="note" maxlength="500">
    <div class="alert bad mt" id="ge" hidden></div>
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="tabs">${[7,14,30,90].map(p=>`<button data-p="${p}" class="${gPeriod===p?'active':''}">${esc(t('p'+p))}</button>`).join('')}</div>
  <div class="grid3 mb">
    <div class="stat"><div class="v">${st.avg==null?'—':gVal(st.avg)}</div><div class="l">${esc(t('avg'))} ${gUnit()}</div></div>
    <div class="stat"><div class="v">${st.min==null?'—':gVal(st.min)}–${st.max==null?'—':gVal(st.max)}</div><div class="l">${esc(t('min'))}–${esc(t('max'))}</div></div>
    <div class="stat ${st.tirPct==null?'':st.tirPct>=70?'ok':'warn'}"><div class="v">${st.tirPct==null?'—':st.tirPct+'%'}</div><div class="l">${esc(t('tir'))}</div></div>
  </div>
  <div class="card"><h3>📈 ${esc(t('g_stats'))}</h3>${lineChart(pts,{band,color:'#dc2626'})}
    <p class="muted mt" style="font-size:12px">${esc(t('g_ref'))}</p></div>
  <div class="card"><h3>📋 ${esc(t('g_history'))}</h3>${hist}</div>`;
  app.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ gPeriod=+b.dataset.p; render(); });
  document.getElementById('gf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    try{
      await api('/api/glucose',{method:'POST',body:JSON.stringify({
        value:fd.get('value'), unit:S.user.glucose_unit, reading_type:fd.get('reading_type'),
        note:fd.get('note'), measured_at:inputToISO(fd.get('measured_at')) })});
      render();
    }catch(e){ const el=document.getElementById('ge'); el.hidden=false;
      el.textContent=e.code==='value_out_of_range'?t('value_out_of_range'):t('err'); }
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/glucose/'+b.dataset.del,{method:'DELETE'}); render();
  });
}

/* ---------------- food ---------------- */
let fDate=null, fHits=[];
async function pageFood(app){
  fDate=fDate||todayStr();
  const d=await api('/api/food-logs?date='+fDate);
  const mealName={breakfast:t('breakfast'),lunch:t('lunch'),dinner:t('dinner'),snack:t('snack')};
  let logs=d.logs.map(l=>`<div class="item"><span style="font-size:20px">🍚</span>
    <div class="grow"><b>${esc(l.food_id?(l.name_my||l.name_en):l.custom_name)}</b>
    <div class="sub">${esc(mealName[l.meal_type]||l.meal_type)} · ${l.carbs_g}g carb · ${fmtDT(l.logged_at).slice(11)}</div></div>
    <button class="linklike" data-del="${l.id}">✕</button></div>`).join('');
  if(!logs) logs=`<p class="muted">${esc(t('no_data'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>🍚 ${esc(t('f_title'))}</h2><input type="date" id="fdate" value="${fDate}" style="width:auto"></div>
  <div class="alert info">${esc(t('f_warn'))}</div>
  <div class="card"><h3>🔍 ${esc(t('search'))}</h3>
    <div class="searchbar"><input id="fq" placeholder="${esc(t('f_search_ph'))}" autocomplete="off"></div>
    <div id="fhits" class="mt"></div></div>
  <div class="card"><h3>➕ ${esc(t('f_add_custom'))}</h3>
    <form id="ff"><div class="row"><div><label>${esc(t('f_custom_name'))}</label><input name="custom_name" required maxlength="80"></div>
    <div><label>${esc(t('f_carbs'))}</label><input name="carbs_g" type="number" step="any" required min="0" max="500"></div></div>
    <label>${esc(t('f_serving'))}</label><input name="serving" maxlength="40">
    <div class="row"><div><label>${esc(t('f_meal'))}</label><select name="meal_type">
      ${['breakfast','lunch','dinner','snack'].map(m=>`<option value="${m}">${esc(mealName[m])}</option>`).join('')}</select></div>
    <div><label>${esc(t('date'))}</label><input name="logged_at" type="datetime-local" value="${nowLocalInput()}"></div></div>
    <button class="btn block">${esc(t('f_log'))}</button></form></div>
  <div class="card"><h3>📋 ${esc(t('f_today'))} — ${esc(t('f_total'))}: <b>${d.totalCarbs}g</b></h3>${logs}</div>`;
  document.getElementById('fdate').onchange=e=>{ fDate=e.target.value; render(); };
  const fq=document.getElementById('fq'), hits=document.getElementById('fhits');
  let deb=null;
  fq.oninput=()=>{ clearTimeout(deb); deb=setTimeout(async()=>{
    const q=fq.value.trim(); if(q.length<1){ hits.innerHTML=''; return; }
    const r=await api('/api/foods?q='+encodeURIComponent(q)); fHits=r.foods;
    hits.innerHTML=r.foods.map((f,i)=>`<div class="food-hit" data-i="${i}"><b>${esc(f.name_my)}</b>
      <span class="muted">${esc(f.name_en)}</span><div class="sub">${esc(f.serving)} · ${f.carbs_g}g carb</div></div>`).join('')
      || `<p class="muted">${esc(t('no_data'))}</p>`;
    hits.querySelectorAll('.food-hit').forEach(el=>el.onclick=()=>pickFood(fHits[+el.dataset.i]));
  },250); };
  function pickFood(f){
    showModal(`<h2>${esc(f.name_my)}</h2><p class="muted">${esc(f.serving)} · ${f.carbs_g}g carb / 1 ${esc(t('f_qty'))}</p>
      <form id="pf"><label>${esc(t('f_qty'))}</label><input name="qty" type="number" step="0.5" min="0.5" max="20" value="1" required>
      <label>${esc(t('f_meal'))}</label><select name="meal_type">${['breakfast','lunch','dinner','snack'].map(m=>`<option value="${m}">${esc(mealName[m])}</option>`).join('')}</select>
      <div class="row mt"><button type="submit" class="btn">${esc(t('f_log'))}</button>
      <button type="button" class="btn ghost" id="pc">${esc(t('cancel'))}</button></div></form>`);
    document.getElementById('pc').onclick=closeModal;
    document.getElementById('pf').onsubmit=async ev=>{
      ev.preventDefault(); const fd=new FormData(ev.target);
      const qty=Number(fd.get('qty'))||1;
      await api('/api/food-logs',{method:'POST',body:JSON.stringify({
        food_id:f.id, carbs_g:Math.round(f.carbs_g*qty*10)/10, meal_type:fd.get('meal_type'), logged_at:new Date().toISOString() })});
      closeModal(); render();
    };
  }
  document.getElementById('ff').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    await api('/api/foods',{method:'POST',body:JSON.stringify({name_my:fd.get('custom_name'),serving:fd.get('serving'),carbs_g:fd.get('carbs_g')})});
    await api('/api/food-logs',{method:'POST',body:JSON.stringify({custom_name:fd.get('custom_name'),
      carbs_g:fd.get('carbs_g'), meal_type:fd.get('meal_type'), logged_at:inputToISO(fd.get('logged_at'))})});
    render();
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/food-logs/'+b.dataset.del,{method:'DELETE'}); render();
  });
}

/* ---------------- medications ---------------- */
let medTab='schedule', medDate=null;
async function pageMeds(app){
  medDate=medDate||todayStr();
  const [sched, meds, adh]=await Promise.all([
    api('/api/med-schedule?date='+medDate),
    api('/api/medications'),
    api('/api/adherence?month='+medDate.slice(0,7)),
  ]);
  const relName={before:t('before'),with:t('with'),after:t('after'),any:t('any')};
  let body='';
  if(medTab==='schedule'){
    let rows=sched.schedule.map(s=>{
      const cls=s.taken?'ok':s.skipped?'warn':'';
      const badge=s.taken?`<span class="badge ok">${esc(t('st_taken'))}</span>`:s.skipped?`<span class="badge warn">${esc(t('st_skipped'))}</span>`:`<span class="badge">${esc(t('st_pending'))}</span>`;
      const btns=s.taken||s.skipped
        ? `<button class="linklike" data-undo="${esc(s.scheduled_for)}|${s.medication_id}">${esc(t('undo'))}</button>`
        : `<button class="btn small" data-taken="${esc(s.scheduled_for)}|${s.medication_id}">${esc(t('mark_taken'))}</button>
           <button class="linklike" data-skip="${esc(s.scheduled_for)}|${s.medication_id}">${esc(t('mark_skipped'))}</button>`;
      return `<div class="item"><span style="font-size:20px">💊</span><div class="grow"><b>${esc(s.time)} — ${esc(s.name)}</b>
        <div class="sub">${esc(s.dose)} ${badge}</div></div>${btns}</div>`;
    }).join('');
    if(!rows) rows=`<p class="muted">${esc(t('no_meds'))}</p>`;
    body=`<div class="card"><div class="pagehead"><h3>📅 ${esc(t('m_today'))}</h3>
      <input type="date" id="mdate" value="${medDate}" style="width:auto"></div>${rows}</div>
      <div class="card"><h3>📊 ${esc(t('adherence'))} (${medDate.slice(0,7)})</h3>
      <div class="stat ${adh.pct==null?'':adh.pct>=80?'ok':'warn'}"><div class="v">${adh.pct==null?'—':adh.pct+'%'}</div>
      <div class="l">${adh.taken}/${adh.scheduled}</div></div></div>`;
  } else {
    let rows=meds.medications.map(m=>{
      let times=[]; try{times=JSON.parse(m.times_json);}catch(e){}
      return `<div class="item"><span style="font-size:20px">💊</span><div class="grow"><b>${esc(m.name)}</b>
        ${m.active?'':'<span class="badge warn">off</span>'}
        <div class="sub">${esc(m.dose)} · ${times.join(', ')} · ${esc(relName[m.relation_to_meal]||'')}
        ${m.stock_qty!=null?` · 📦 ${m.stock_qty}`:''}</div></div>
        <button class="linklike" data-edit="${m.id}">${esc(t('edit'))}</button>
        <button class="linklike" data-del="${m.id}">✕</button></div>`;
    }).join('');
    if(!rows) rows=`<p class="muted">${esc(t('no_meds'))}</p>`;
    body=`<div class="card"><h3>💊 ${esc(t('m_list'))}</h3>${rows}
      <button class="btn block" id="madd">➕ ${esc(t('m_add'))}</button></div>`;
  }
  app.innerHTML=`<div class="pagehead"><h2>💊 ${esc(t('m_title'))}</h2></div>
    <div class="tabs"><button data-tab="schedule" class="${medTab==='schedule'?'active':''}">📅 ${esc(t('m_today'))}</button>
    <button data-tab="list" class="${medTab==='list'?'active':''}">📋 ${esc(t('m_list'))}</button></div>${body}`;
  app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ medTab=b.dataset.tab; render(); });
  const md=document.getElementById('mdate'); if(md) md.onchange=e=>{ medDate=e.target.value; render(); };
  async function mark(action, key){
    const [sf,mid]=key.split('|');
    await api('/api/med-logs',{method:'POST',body:JSON.stringify({medication_id:+mid, scheduled_for:sf, action})});
    render();
  }
  app.querySelectorAll('[data-taken]').forEach(b=>b.onclick=()=>mark('taken',b.dataset.taken));
  app.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>mark('skipped',b.dataset.skip));
  app.querySelectorAll('[data-undo]').forEach(b=>b.onclick=()=>mark('untaken',b.dataset.undo));
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/medications/'+b.dataset.del,{method:'DELETE'}); render();
  });
  app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>medForm(+b.dataset.edit));
  const madd=document.getElementById('madd'); if(madd) madd.onclick=()=>medForm(null);

  function medForm(id){
    const m=id?meds.medications.find(x=>x.id===id):null;
    let times=m?JSON.parse(m.times_json):['08:00'];
    const timeInputs=()=>times.map((x,i)=>`<div class="row mb"><input type="time" data-ti="${i}" value="${esc(x)}" required>
      <button type="button" class="btn ghost small" data-rm="${i}" style="flex:0 0 44px">✕</button></div>`).join('');
    showModal(`<h2>${id?esc(t('edit')):'➕'} ${esc(t('m_add'))}</h2><form id="mf">
      <label>${esc(t('m_name'))}</label><input name="name" required maxlength="100" value="${esc(m?m.name:'')}">
      <label>${esc(t('m_dose'))}</label><input name="dose" maxlength="60" value="${esc(m?m.dose:'')}">
      <label>${esc(t('m_times'))}</label><div id="times">${timeInputs()}</div>
      <button type="button" class="btn ghost small" id="maddt">+ ${esc(t('m_add_time'))}</button>
      <label>${esc(t('m_meal_rel'))}</label><select name="relation_to_meal">
        ${['before','with','after','any'].map(r=>`<option value="${r}" ${m&&m.relation_to_meal===r?'selected':''}>${esc(relName[r])}</option>`).join('')}</select>
      <div class="row"><div><label>${esc(t('m_start'))}</label><input name="start_date" type="date" required value="${m?esc(m.start_date):todayStr()}"></div>
      <div><label>${esc(t('m_end'))}</label><input name="end_date" type="date" value="${m&&m.end_date?esc(m.end_date):''}"></div></div>
      <div class="row"><div><label>${esc(t('m_stock'))} (${esc(t('optional'))})</label><input name="stock_qty" type="number" min="0" value="${m&&m.stock_qty!=null?m.stock_qty:''}"></div>
      <div><label>${esc(t('m_active'))}</label><select name="active"><option value="1" ${!m||m.active?'selected':''}>✓</option><option value="0" ${m&&!m.active?'selected':''}>✕</option></select></div></div>
      <div class="alert bad mt" id="me" hidden></div>
      <div class="row mt"><button class="btn">${esc(t('save'))}</button>
      <button type="button" class="btn ghost" id="mc">${esc(t('cancel'))}</button></div></form>`);
    document.getElementById('mc').onclick=closeModal;
    const rerender=()=>{ document.getElementById('times').innerHTML=timeInputs(); bindTimes(); };
    function bindTimes(){
      document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ times.splice(+b.dataset.rm,1); if(!times.length) times=['08:00']; rerender(); });
      document.querySelectorAll('[data-ti]').forEach(inp=>inp.onchange=()=>{ times[+inp.dataset.ti]=inp.value; });
    }
    bindTimes();
    document.getElementById('maddt').onclick=()=>{ if(times.length<12){ times.push('20:00'); rerender(); } };
    document.getElementById('mf').onsubmit=async ev=>{
      ev.preventDefault(); const fd=new FormData(ev.target);
      try{
        const payload={name:fd.get('name'),dose:fd.get('dose'),times,relation_to_meal:fd.get('relation_to_meal'),
          start_date:fd.get('start_date'),end_date:fd.get('end_date')||null,
          stock_qty:fd.get('stock_qty')===''?null:+fd.get('stock_qty'),active:+fd.get('active')};
        if(id) await api('/api/medications/'+id,{method:'PUT',body:JSON.stringify(payload)});
        else await api('/api/medications',{method:'POST',body:JSON.stringify(payload)});
        closeModal(); render();
      }catch(e){ const el=document.getElementById('me'); el.hidden=false; el.textContent=t('err'); }
    };
  }
}

/* ---------------- activity ---------------- */
let aFrom=null;
async function pageActivity(app){
  const to=new Date().toISOString();
  aFrom=aFrom||new Date(Date.now()-6*864e5).toISOString();
  const [acts,stats]=await Promise.all([api(`/api/activities?from=${aFrom}&to=${to}`), api(`/api/activity/stats?from=${aFrom}&to=${to}`)]);
  const byDay={};
  for(const r of acts.activities){ const day=fmtD(r.logged_at); byDay[day]=byDay[day]||{m:0,s:0};
    byDay[day].m+=r.duration_min||0; byDay[day].s+=r.steps||0; }
  const days=Object.keys(byDay).sort();
  const typeName={walk:t('walk'),run:t('run'),cycle:t('cycle'),yoga:t('yoga'),swim:t('swim'),other:t('other'),steps:t('steps_only')};
  const intName={low:t('low'),moderate:t('moderate'),high:t('high')};
  let hist=acts.activities.map(r=>`<div class="item"><span style="font-size:20px">🏃</span>
    <div class="grow"><b>${esc(typeName[r.type]||r.type)}</b>
    <div class="sub">${r.duration_min?r.duration_min+' '+esc(t('minutes'))+' · ':''}${esc(intName[r.intensity]||'')}${r.steps?' · 👣 '+r.steps.toLocaleString():''} · ${fmtDT(r.logged_at)}${r.note?' · '+esc(r.note):''}</div></div>
    <button class="linklike" data-del="${r.id}">✕</button></div>`).join('');
  if(!hist) hist=`<p class="muted">${esc(t('no_activity'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>🏃 ${esc(t('a_title'))}</h2></div>
  <div class="grid3 mb">
    <div class="stat"><div class="v">${stats.minutes}</div><div class="l">${esc(t('minutes'))}</div></div>
    <div class="stat"><div class="v">${stats.steps.toLocaleString()}</div><div class="l">👣 ${esc(t('steps'))}</div></div>
    <div class="stat"><div class="v">${stats.sessions}</div><div class="l">${esc(t('sessions'))}</div></div>
  </div>
  <div class="card"><h3>📊 ${esc(t('a_week'))} — ${esc(t('minutes'))}</h3>${barChart(days.map(x=>({x,y:byDay[x].m})))}</div>
  <div class="card"><h3>👣 ${esc(t('a_week'))} — ${esc(t('steps'))}</h3>${barChart(days.map(x=>({x,y:byDay[x].s})),{color:'#16a34a'})}
    <p class="muted mt" style="font-size:12px">${esc(t('a_csv_hint')).replace(/\n/g,'<br>')}</p></div>
  <div class="card"><h3>➕ ${esc(t('a_add'))}</h3>
    <form id="af"><div class="row">
      <div><label>${esc(t('a_type'))}</label><select name="type">${['walk','run','cycle','yoga','swim','other'].map(x=>`<option value="${x}">${esc(typeName[x])}</option>`).join('')}</select></div>
      <div><label>${esc(t('a_duration'))}</label><input name="duration_min" type="number" min="0" max="1440" value="30"></div></div>
    <div class="row"><div><label>${esc(t('a_intensity'))}</label><select name="intensity">
      ${['low','moderate','high'].map(x=>`<option value="${x}">${esc(intName[x])}</option>`).join('')}</select></div>
      <div><label>${esc(t('a_steps'))} (${esc(t('optional'))})</label><input name="steps" type="number" min="0" max="200000"></div></div>
    <label>${esc(t('date'))}</label><input name="logged_at" type="datetime-local" value="${nowLocalInput()}">
    <label>${esc(t('note'))}</label><input name="note" maxlength="500">
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="card"><h3>👣 ${esc(t('a_log_steps'))}</h3>
    <form id="sf"><div class="row"><div><label>${esc(t('a_steps'))}</label><input name="steps" type="number" required min="0" max="200000"></div>
    <div><label>${esc(t('date'))}</label><input name="date" type="date" required value="${todayStr()}"></div></div>
    <button class="btn block">${esc(t('a_log_steps'))}</button></form></div>
  <div class="card"><h3>📥 ${esc(t('a_import'))}</h3>
    <textarea id="csv" rows="4" placeholder="2026-09-27,8432&#10;2026-09-28,6105"></textarea>
    <button class="btn block" id="imp">${esc(t('a_import'))}</button>
    <p class="muted mt" id="imsg"></p></div>
  <div class="card"><h3>📋 ${esc(t('a_week'))}</h3>${hist}</div>`;
  document.getElementById('af').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    await api('/api/activities',{method:'POST',body:JSON.stringify({type:fd.get('type'),duration_min:+fd.get('duration_min'),
      intensity:fd.get('intensity'),steps:fd.get('steps')||null,logged_at:inputToISO(fd.get('logged_at')),note:fd.get('note')})});
    render();
  };
  document.getElementById('sf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    await api('/api/activities/import',{method:'POST',body:JSON.stringify({rows:[{date:fd.get('date'),steps:+fd.get('steps')}]})});
    render();
  };
  document.getElementById('imp').onclick=async()=>{
    const txt=document.getElementById('csv').value.trim(); const rows=[];
    for(const line of txt.split('\n')){ const [d,s]=line.trim().split(','); if(d&&s) rows.push({date:d.trim(),steps:+s.trim()}); }
    if(!rows.length) return;
    const r=await api('/api/activities/import',{method:'POST',body:JSON.stringify({rows})});
    document.getElementById('imsg').textContent=t('a_imported')+': '+r.imported;
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/activities/'+b.dataset.del,{method:'DELETE'}); render();
  });
}

/* ---------------- weight & BP ---------------- */
async function pageWeight(app){
  const from=new Date(Date.now()-90*864e5).toISOString();
  const r=await api('/api/weight-bp?from='+from);
  const recs=[...r.records].reverse();
  const wPts=recs.filter(x=>x.weight_kg!=null).map(x=>({x:fmtD(x.measured_at),y:x.weight_kg}));
  const sPts=recs.filter(x=>x.systolic!=null).map(x=>({x:fmtD(x.measured_at),y:x.systolic}));
  const dPts=recs.filter(x=>x.diastolic!=null).map(x=>({x:fmtD(x.measured_at),y:x.diastolic}));
  let hist=r.records.map(x=>`<div class="item"><span style="font-size:20px">⚖️</span><div class="grow"><b>${[
    x.weight_kg!=null?x.weight_kg+' kg':'', x.systolic!=null?x.systolic+'/'+x.diastolic:'', x.pulse!=null?'♥ '+x.pulse:''
  ].filter(Boolean).join(' · ')}</b><div class="sub">${fmtDT(x.measured_at)}</div></div>
  <button class="linklike" data-del="${x.id}">✕</button></div>`).join('');
  if(!hist) hist=`<p class="muted">${esc(t('no_records'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>⚖️ ${esc(t('w_title'))}</h2></div>
  <div class="card"><h3>➕ ${esc(t('w_add'))}</h3><form id="wf">
    <div class="row"><div><label>${esc(t('weight_kg'))}</label><input name="weight_kg" type="number" step="0.1" min="20" max="300"></div>
    <div><label>${esc(t('pulse'))}</label><input name="pulse" type="number" min="30" max="250"></div></div>
    <div class="row"><div><label>${esc(t('systolic'))}</label><input name="systolic" type="number" min="50" max="300"></div>
    <div><label>${esc(t('diastolic'))}</label><input name="diastolic" type="number" min="30" max="200"></div></div>
    <label>${esc(t('date'))}</label><input name="measured_at" type="datetime-local" value="${nowLocalInput()}">
    <div class="alert bad mt" id="we" hidden></div>
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="card"><h3>📈 ${esc(t('weight_kg'))}</h3>${lineChart(wPts,{color:'#0ea5e9'})}</div>
  <div class="card"><h3>📈 ${esc(t('systolic'))}/${esc(t('diastolic'))}</h3>${lineChart(sPts,{color:'#dc2626'})}</div>
  <div class="card"><h3>📋</h3>${hist}</div>`;
  void dPts;
  document.getElementById('wf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    try{
      await api('/api/weight-bp',{method:'POST',body:JSON.stringify({weight_kg:fd.get('weight_kg')||null,
        systolic:fd.get('systolic')||null,diastolic:fd.get('diastolic')||null,pulse:fd.get('pulse')||null,
        measured_at:inputToISO(fd.get('measured_at'))})});
      render();
    }catch(e){ const el=document.getElementById('we'); el.hidden=false; el.textContent=t('err'); }
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/weight-bp/'+b.dataset.del,{method:'DELETE'}); render();
  });
}

/* ---------------- labs ---------------- */
const COMMON_TESTS=['HbA1c','Fasting glucose','Total cholesterol','LDL','HDL','Triglycerides','Creatinine','Urine albumin'];
async function pageLabs(app){
  const r=await api('/api/labs');
  const hba=[...r.labs].filter(l=>/hba1c/i.test(l.test_name)).reverse()
    .map(l=>({x:fmtD(l.tested_at),y:l.value}));
  let hist=r.labs.map(l=>`<div class="item"><span style="font-size:20px">🧪</span>
    <div class="grow"><b>${esc(l.test_name)}: ${l.value} ${esc(l.unit)}</b>
    <div class="sub">${fmtD(l.tested_at)}${l.note?' · '+esc(l.note):''}</div></div>
    <button class="linklike" data-del="${l.id}">✕</button></div>`).join('');
  if(!hist) hist=`<p class="muted">${esc(t('no_labs'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>🧪 ${esc(t('l_title'))}</h2></div>
  <div class="card"><h3>➕ ${esc(t('l_add'))}</h3><form id="lf">
    <label>${esc(t('l_test'))}</label><input name="test_name" list="ctests" required maxlength="80"><datalist id="ctests">
    ${COMMON_TESTS.map(x=>`<option value="${x}">`).join('')}</datalist>
    <div class="row"><div><label>${esc(t('l_value'))}</label><input name="value" type="number" step="any" required></div>
    <div><label>${esc(t('l_unit'))}</label><input name="unit" maxlength="20" placeholder="%, mg/dL…"></div></div>
    <label>${esc(t('l_date'))}</label><input name="tested_at" type="date" value="${todayStr()}">
    <label>${esc(t('note'))}</label><input name="note" maxlength="500">
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="card"><h3>📈 ${esc(t('l_hba1c'))}</h3>${lineChart(hba,{color:'#7c3aed'})}
    <p class="muted mt" style="font-size:12px">${esc(t('l_ref'))}</p></div>
  <div class="card"><h3>📋</h3>${hist}</div>`;
  document.getElementById('lf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    await api('/api/labs',{method:'POST',body:JSON.stringify({test_name:fd.get('test_name'),value:fd.get('value'),
      unit:fd.get('unit'),tested_at:inputToISO(fd.get('tested_at')+'T12:00'),note:fd.get('note')})});
    render();
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/labs/'+b.dataset.del,{method:'DELETE'}); render();
  });
}

/* ---------------- doctor visits ---------------- */
async function pageVisits(app){
  const r=await api('/api/visits');
  const today=todayStr();
  const upcoming=r.visits.filter(v=>v.next_visit&&v.next_visit>=today).sort((a,b)=>a.next_visit<b.next_visit?-1:1)[0];
  let hist=r.visits.map(v=>`<div class="item"><span style="font-size:20px">🏥</span>
    <div class="grow"><b>${esc(v.visit_date)}</b>${v.doctor?' · '+esc(v.doctor):''}${v.clinic?' · '+esc(v.clinic):''}
    <div class="sub">${esc(v.notes||'').slice(0,80)}${v.next_visit?'<br>↪ '+esc(t('v_next'))+': '+esc(v.next_visit):''}</div></div>
    <button class="linklike" data-edit="${v.id}">${esc(t('edit'))}</button>
    <button class="linklike" data-del="${v.id}">✕</button></div>`).join('');
  if(!hist) hist=`<p class="muted">${esc(t('no_visits'))}</p>`;
  app.innerHTML=`
  <div class="pagehead"><h2>🏥 ${esc(t('v_title'))}</h2></div>
  ${upcoming?`<div class="alert info">📅 <b>${esc(t('v_upcoming'))}:</b> ${esc(upcoming.next_visit)}${upcoming.doctor?' · '+esc(upcoming.doctor):''}${upcoming.clinic?' · '+esc(upcoming.clinic):''}</div>`:''}
  <div class="card"><h3>➕ ${esc(t('v_add'))}</h3><form id="vf">
    <div class="row"><div><label>${esc(t('v_date'))}</label><input name="visit_date" type="date" required value="${today}"></div>
    <div><label>${esc(t('v_next'))}</label><input name="next_visit" type="date"></div></div>
    <div class="row"><div><label>${esc(t('v_doctor'))}</label><input name="doctor" maxlength="80"></div>
    <div><label>${esc(t('v_clinic'))}</label><input name="clinic" maxlength="80"></div></div>
    <label>${esc(t('v_notes'))}</label><textarea name="notes" maxlength="2000"></textarea>
    <label>${esc(t('v_questions'))}</label><textarea name="questions" maxlength="2000"></textarea>
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="card"><h3>📋</h3>${hist}</div>`;
  document.getElementById('vf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    await api('/api/visits',{method:'POST',body:JSON.stringify({visit_date:fd.get('visit_date'),doctor:fd.get('doctor'),
      clinic:fd.get('clinic'),notes:fd.get('notes'),questions:fd.get('questions'),next_visit:fd.get('next_visit')||null})});
    render();
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm(t('confirm_delete'))) return;
    await api('/api/visits/'+b.dataset.del,{method:'DELETE'}); render();
  });
  app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
    const v=r.visits.find(x=>x.id===+b.dataset.edit);
    showModal(`<h2>${esc(t('edit'))}</h2><form id="vef">
      <div class="row"><div><label>${esc(t('v_date'))}</label><input name="visit_date" type="date" required value="${esc(v.visit_date)}"></div>
      <div><label>${esc(t('v_next'))}</label><input name="next_visit" type="date" value="${esc(v.next_visit||'')}"></div></div>
      <div class="row"><div><label>${esc(t('v_doctor'))}</label><input name="doctor" maxlength="80" value="${esc(v.doctor)}"></div>
      <div><label>${esc(t('v_clinic'))}</label><input name="clinic" maxlength="80" value="${esc(v.clinic)}"></div></div>
      <label>${esc(t('v_notes'))}</label><textarea name="notes" maxlength="2000">${esc(v.notes)}</textarea>
      <label>${esc(t('v_questions'))}</label><textarea name="questions" maxlength="2000">${esc(v.questions)}</textarea>
      <div class="row mt"><button class="btn">${esc(t('save'))}</button>
      <button type="button" class="btn ghost" id="vec">${esc(t('cancel'))}</button></div></form>`);
    document.getElementById('vec').onclick=closeModal;
    document.getElementById('vef').onsubmit=async ev=>{
      ev.preventDefault(); const fd=new FormData(ev.target);
      await api('/api/visits/'+v.id,{method:'PUT',body:JSON.stringify({visit_date:fd.get('visit_date'),doctor:fd.get('doctor'),
        clinic:fd.get('clinic'),notes:fd.get('notes'),questions:fd.get('questions'),next_visit:fd.get('next_visit')||null})});
      closeModal(); render();
    };
  });
}

/* ---------------- reports ---------------- */
let repPeriod='week', repRef=null;
async function pageReports(app){
  repRef=repRef||todayStr();
  const d=await api(`/api/report?period=${repPeriod}&ref=${repRef}`);
  const g=d.glucose;
  const carbRows=d.carbsByDay.map(c=>`<tr><td>${esc(c.d.slice(5))}</td><td>${Math.round(c.c*10)/10} g</td></tr>`).join('');
  const labRows=d.labs.map(l=>`<tr><td>${esc(l.test_name)}</td><td>${l.value} ${esc(l.unit)}</td><td>${fmtD(l.tested_at)}</td></tr>`).join('');
  app.innerHTML=`
  <div class="pagehead"><h2>📊 ${esc(t('r_title'))}</h2></div>
  <div class="card"><div class="row">
    <div><label>${esc(t('r_period'))}</label><select id="rp">
      <option value="week" ${repPeriod==='week'?'selected':''}>${esc(t('week'))} (7)</option>
      <option value="month" ${repPeriod==='month'?'selected':''}>${esc(t('month'))} (30)</option></select></div>
    <div><label>${esc(t('to'))}</label><input type="date" id="rd" value="${repRef}"></div></div>
    <button class="btn block" id="rgen">${esc(t('r_for'))}</button></div>
  <div class="card"><h3>🩸 ${esc(t('r_glucose'))} (${d.from} → ${d.to})</h3>
    <div class="grid3">
      <div class="stat"><div class="v">${g.avg==null?'—':gVal(g.avg)}</div><div class="l">${esc(t('avg'))} ${gUnit()}</div></div>
      <div class="stat"><div class="v">${g.min==null?'—':gVal(g.min)}–${g.max==null?'—':gVal(g.max)}</div><div class="l">${esc(t('min'))}–${esc(t('max'))}</div></div>
      <div class="stat ${g.tirPct==null?'':g.tirPct>=70?'ok':'warn'}"><div class="v">${g.tirPct==null?'—':g.tirPct+'%'}</div><div class="l">${esc(t('tir'))}</div></div>
    </div><p class="muted mt">${esc(t('readings'))}: ${g.count}</p></div>
  <div class="card"><h3>💊 ${esc(t('r_meds'))} (${d.to.slice(0,7)})</h3>
    <div class="kv"><span class="k">${esc(t('adherence'))}</span><b>${d.adherence.pct==null?'—':d.adherence.pct+'%'}</b></div>
    <div class="kv"><span class="k">${esc(t('meds_taken'))}</span><span>${d.adherence.taken}/${d.adherence.scheduled}</span></div></div>
  <div class="card"><h3>🍚 ${esc(t('r_diet'))}</h3>
    ${carbRows?`<table class="rep"><tr><th>${esc(t('date'))}</th><th>${esc(t('r_carbs_day'))}</th></tr>${carbRows}</table>`:`<p class="muted">${esc(t('no_data'))}</p>`}</div>
  <div class="card"><h3>🏃 ${esc(t('r_activity'))}</h3>
    <div class="kv"><span class="k">${esc(t('minutes'))}</span><b>${d.activity.minutes}</b></div>
    <div class="kv"><span class="k">👣 ${esc(t('steps'))}</span><b>${d.activity.steps.toLocaleString()}</b></div>
    <div class="kv"><span class="k">${esc(t('sessions'))}</span><span>${d.activity.sessions}</span></div></div>
  ${d.latestWeightBp?`<div class="card"><h3>⚖️ ${esc(t('r_latest'))}</h3><div class="kv"><span class="k">${esc(t('weight_kg'))}</span><b>${d.latestWeightBp.weight_kg??'—'}</b></div>
    <div class="kv"><span class="k">BP</span><b>${d.latestWeightBp.systolic??'—'}/${d.latestWeightBp.diastolic??'—'}</b></div></div>`:''}
  <div class="card"><h3>🧪 ${esc(t('r_labs'))}</h3>
    ${labRows?`<table class="rep"><tr><th>${esc(t('l_test'))}</th><th>${esc(t('l_value'))}</th><th>${esc(t('date'))}</th></tr>${labRows}</table>`:`<p class="muted">${esc(t('no_data'))}</p>`}</div>
  <p class="muted mb">${esc(t('r_note'))}</p>
  <button class="btn block noprint" id="rprint">🖨️ ${esc(t('r_print'))}</button>
  <div id="print-area"></div>`;
  document.getElementById('rp').onchange=e=>{ repPeriod=e.target.value; };
  document.getElementById('rd').onchange=e=>{ repRef=e.target.value; };
  document.getElementById('rgen').onclick=()=>render();
  document.getElementById('rprint').onclick=()=>{
    const pa=document.getElementById('print-area');
    pa.innerHTML=`<h1 style="text-align:center">🩸 ${esc(t('r_for'))} — ${esc(S.user.name||'')}</h1>
      <p style="text-align:center;color:#666">${d.from} → ${d.to} · ${esc(t('appName'))}</p><hr><br>
      <h3>🩸 ${esc(t('r_glucose'))}</h3>
      <table class="rep"><tr><th>${esc(t('readings'))}</th><th>${esc(t('avg'))}</th><th>${esc(t('min'))}–${esc(t('max'))}</th><th>${esc(t('tir'))}</th></tr>
      <tr><td>${g.count}</td><td>${g.avg==null?'—':gVal(g.avg)+' '+gUnit()}</td><td>${g.min==null?'—':gVal(g.min)+'–'+gVal(g.max)}</td><td>${g.tirPct==null?'—':g.tirPct+'%'}</td></tr></table><br>
      <h3>💊 ${esc(t('r_meds'))}</h3><p>${esc(t('adherence'))}: <b>${d.adherence.pct==null?'—':d.adherence.pct+'%'}</b> (${d.adherence.taken}/${d.adherence.scheduled})</p><br>
      <h3>🍚 ${esc(t('r_diet'))}</h3>${carbRows?`<table class="rep"><tr><th>${esc(t('date'))}</th><th>${esc(t('r_carbs_day'))}</th></tr>${carbRows}</table>`:'—'}<br>
      <h3>🏃 ${esc(t('r_activity'))}</h3><p>${esc(t('minutes'))}: ${d.activity.minutes} · 👣 ${d.activity.steps.toLocaleString()} · ${esc(t('sessions'))}: ${d.activity.sessions}</p><br>
      ${labRows?`<h3>🧪 ${esc(t('r_labs'))}</h3><table class="rep"><tr><th>${esc(t('l_test'))}</th><th>${esc(t('l_value'))}</th><th>${esc(t('date'))}</th></tr>${labRows}</table><br>`:''}
      <p style="color:#666;font-size:12px">${esc(t('d_text'))}</p>`;
    window.print();
  };
}

/* ---------------- education ---------------- */
async function pageEducation(app){
  const r=await api('/api/articles');
  app.innerHTML=`<div class="pagehead"><h2>📚 ${esc(t('e_title'))}</h2></div>
  <div class="menu">${r.articles.map(a=>`<a href="#/education/${a.id}">
    <span class="e">${a.category==='emergency'?'🚨':'📄'}</span>
    <span>${a.category==='emergency'?`<span class="badge emg">${esc(t('emergency'))}</span><br>`:''}${esc(S.lang==='en'&&a.title_en?a.title_en:a.title_my)}</span>
  </a>`).join('')}</div>`;
}
async function pageArticle(app){
  const id=location.hash.split('/')[2];
  const r=await api('/api/articles/'+id);
  const a=r.article;
  const body=(S.lang==='en'&&a.body_en?a.body_en:a.body_my).split('\n').map(p=>`<p>${esc(p.trim())}</p>`).join('');
  app.innerHTML=`<div class="pagehead"><h2>${a.category==='emergency'?'🚨 ':''}${esc(S.lang==='en'&&a.title_en?a.title_en:a.title_my)}</h2>
    <a class="btn small ghost" href="#/education">${esc(t('back'))}</a></div>
  ${a.category==='emergency'?`<div class="alert bad"><b>${esc(t('emergency'))}</b></div>`:''}
  <div class="card" style="line-height:1.9;font-size:15px">${body}</div>`;
}

/* ---------------- settings ---------------- */
async function pageSettings(app){
  const u=S.user;
  const dtypes=['type1','type2','gestational','unknown'];
  app.innerHTML=`
  <div class="pagehead"><h2>⚙️ ${esc(t('s_title'))}</h2></div>
  <div class="card"><h3>👤 ${esc(t('s_profile'))}</h3><form id="sf">
    <label>${esc(t('name'))}</label><input name="name" maxlength="80" value="${esc(u.name||'')}">
    <div class="row"><div><label>${esc(t('s_language'))}</label><select name="lang">
      <option value="my" ${u.lang==='my'?'selected':''}>မြန်မာ</option><option value="en" ${u.lang==='en'?'selected':''}>English</option></select></div>
      <div><label>${esc(t('s_unit'))}</label><select name="glucose_unit">
      <option value="mgdl" ${u.glucose_unit==='mgdl'?'selected':''}>mg/dL</option><option value="mmol" ${u.glucose_unit==='mmol'?'selected':''}>mmol/L</option></select></div></div>
    <div class="row"><div><label>${esc(t('s_dtype'))}</label><select name="diabetes_type">
      ${dtypes.map(x=>`<option value="${x}" ${u.diabetes_type===x?'selected':''}>${esc(t(x))}</option>`).join('')}</select></div>
      <div><label>${esc(t('s_dyear'))}</label><input name="diagnosed_year" type="number" min="1900" max="2100" value="${u.diagnosed_year||''}"></div></div>
    <h3 class="mt">🎯 ${esc(t('s_targets'))}</h3>
    <div class="row"><div><label>${esc(t('s_fasting'))} (mg/dL)</label><input name="target_fasting_low" type="number" required value="${u.target_fasting_low}"></div>
    <div><label>→</label><input name="target_fasting_high" type="number" required value="${u.target_fasting_high}"></div>
    <div><label>${esc(t('s_postmeal'))} (mg/dL)</label><input name="target_postmeal_high" type="number" required value="${u.target_postmeal_high}"></div></div>
    <p class="muted mt" id="smsg"></p>
    <button class="btn block">${esc(t('save'))}</button></form></div>
  <div class="card"><h3>🔐 ${esc(t('s_security'))}</h3><form id="pf">
    <label>${esc(t('current_password'))}</label><input name="currentPassword" type="password" required>
    <label>${esc(t('new_password'))}</label><input name="newPassword" type="password" required minlength="6">
    <p class="muted mt" id="pmsg"></p><button class="btn block">${esc(t('change_password'))}</button></form></div>
  <div class="card"><h3>📦 ${esc(t('s_export'))}</h3>
    <div class="row"><button class="btn ghost" id="xjson">${esc(t('s_json'))}</button>
    <button class="btn ghost" id="xcsv">${esc(t('s_csv'))} — glucose</button></div></div>
  <div class="card"><h3>⚠️ ${esc(t('s_disclaimer'))}</h3><p style="font-size:14px;line-height:1.7;color:#334155">${esc(t('d_text'))}</p></div>
  <div class="card"><h3 style="color:var(--bad)">☢️ ${esc(t('s_danger'))}</h3>
    <p class="muted mb">${esc(t('delete_account_warn'))}</p>
    <form id="df"><label>${esc(t('s_del_confirm'))}</label><input name="password" type="password" required>
    <button class="btn danger block">${esc(t('delete_account'))}</button></form></div>`;
  document.getElementById('sf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    try{
      const d=await api('/api/me/settings',{method:'PUT',body:JSON.stringify({
        name:fd.get('name'),lang:fd.get('lang'),glucose_unit:fd.get('glucose_unit'),diabetes_type:fd.get('diabetes_type'),
        diagnosed_year:fd.get('diagnosed_year')||null,target_fasting_low:+fd.get('target_fasting_low'),
        target_fasting_high:+fd.get('target_fasting_high'),target_postmeal_high:+fd.get('target_postmeal_high')})});
      S.user=d.user; S.lang=d.user.lang; document.getElementById('smsg').textContent=t('s_saved'); renderNav(); setTopbar();
    }catch(e){ document.getElementById('smsg').textContent=t('err'); }
  };
  document.getElementById('pf').onsubmit=async ev=>{
    ev.preventDefault(); const fd=new FormData(ev.target);
    try{ await api('/api/auth/password',{method:'POST',body:JSON.stringify({currentPassword:fd.get('currentPassword'),newPassword:fd.get('newPassword')})});
      document.getElementById('pmsg').textContent=t('password_changed'); ev.target.reset();
    }catch(e){ document.getElementById('pmsg').textContent=t('login_fail'); }
  };
  document.getElementById('xjson').onclick=()=>{ window.location='/api/export?format=json'; };
  document.getElementById('xcsv').onclick=()=>{ window.location='/api/export?format=csv&type=glucose'; };
  document.getElementById('df').onsubmit=async ev=>{
    ev.preventDefault();
    if(!confirm(t('confirm_delete'))) return;
    try{ await api('/api/auth/account',{method:'DELETE',body:JSON.stringify({password:new FormData(ev.target).get('password')})});
      S.user=null; location.hash='#/login'; render();
    }catch(e){ alert(t('login_fail')); }
  };
}

/* ---------------- more menu ---------------- */
function pageMore(app){
  const items=[
    ['#/activity','🏃','more_activity'],['#/weight','⚖️','more_weight'],['#/labs','🧪','more_labs'],
    ['#/visits','🏥','more_visits'],['#/reports','📊','more_reports'],['#/education','📚','more_edu'],
    ['#/settings','⚙️','more_settings'],
  ];
  app.innerHTML=`<div class="pagehead"><h2>⋯ ${esc(t('nav_more'))}</h2></div>
  <div class="menu">${items.map(([h,e,k])=>`<a href="${h}"><span class="e">${e}</span><span>${esc(t(k))}</span></a>`).join('')}</div>`;
}

/* ---------------- boot ---------------- */
(async function boot(){
  try{ const d=await api('/api/auth/me'); S.user=d.user; S.lang=d.user.lang||'my'; afterLogin(); }
  catch(e){ S.user=null; }
  if(!location.hash) location.hash = S.user ? '#/dashboard' : '#/login';
  render();
})();
