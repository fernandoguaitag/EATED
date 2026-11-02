/* EATED — app personal de calorías y macros (PWA, datos locales) */
(() => {
"use strict";

/* ================= Utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const r0 = n => Math.round(n || 0);
const r1 = n => Math.round((n || 0) * 10) / 10;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pad = n => String(n).padStart(2, "0");
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const todayStr = () => ds(new Date());
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const diffDays = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const fmt = n => r0(n).toLocaleString("es-CL");
const num = v => { const n = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(n) ? n : 0; };
const DOW = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const dowIdx = d => (d.getDay() + 6) % 7;

const MEALS = {
  desayuno: { n: "Desayuno", e: "☕" }, almuerzo: { n: "Almuerzo", e: "🍽️" }, once: { n: "Once", e: "🫖" },
  cena: { n: "Cena", e: "🌙" }, snack1: { n: "Snack 1", e: "🍎" }, snack2: { n: "Snack 2", e: "🥜" },
};
const MEAL_ORDER = ["desayuno", "almuerzo", "snack1", "once", "cena", "snack2"];
const GROUPS = { pecho: ["Pecho", "🫁"], espalda: ["Espalda", "🦾"], brazos: ["Brazos", "💪"], piernas: ["Piernas", "🦵"] };
const DIETS = {
  recomendada: ["✨", "Recomendada", "Mezcla equilibrada de proteínas, carbos y grasas"],
  alta_proteina: ["🍗", "Alta en proteína", "Más proteína, menos carbos y grasas"],
  baja_carbos: ["🥑", "Baja en carbohidratos", "Menos carbos, más grasas"],
  keto: ["🧈", "Keto", "Muy baja en carbos, alta en grasas"],
  baja_grasa: ["🥔", "Baja en grasas", "Menos grasas, más carbos"],
};
const SPEEDS = { lose: { lento: .004, normal: .007, rapido: .01 }, gain: { lento: .001, normal: .002, rapido: .0035 } };

const IC = {
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="4"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 20V12M12 20V5M18 20v-9"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 8v8M11 8v8M14 8v8M17 8v8"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>',
  heartOn: '<svg viewBox="0 0 24 24" fill="#ff6b8b" stroke="#ff6b8b" stroke-width="2"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  plusc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/></svg>',
};

/* ================= Estado ================= */
const KEY = "eated_v1";
const DEFAULT = () => ({
  v: 1, profile: null, targets: null, plan: null,
  days: {}, weights: {}, custom: [], favs: {}, recents: [], savedMeals: [],
  settings: { accent: "lila", usdaKey: "", lastExport: null },
  adapt: { last: null, pending: null, history: [] },
});
let S;
try { S = Object.assign(DEFAULT(), JSON.parse(localStorage.getItem(KEY) || "null") || {}); } catch { S = DEFAULT(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("⚠️ No se pudo guardar"); } };
const UI = { tab: "hoy", date: todayStr(), sheets: [], ob: null, dismissCopy: {}, calMonth: null };

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ================= Cálculos nutricionales ================= */
function bmrOf(p, w) { return 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === "m" ? 5 : -161); }
function sessionKcal(p, w) { return (p.workMin || 90) / 60 * w * (p.strength ? 2.5 : 4); }
function tdeeOf(p, w = p.weight, sessionsPerWeek = p.trainDays) {
  const bmr = bmrOf(p, w);
  const steps = (p.steps || 0) * 0.00045 * w;
  const ex = sessionsPerWeek * sessionKcal(p, w) / 7;
  return { bmr, steps, ex, tdee: (bmr * 1.1 + steps + ex) * 1.1 };
}
function goalDelta(p, w, tdee) {
  if (p.goal === "maintain") return 0;
  if (p.goal === "lose") {
    if (p.targetWeight && w <= p.targetWeight) return 0;
    const rate = SPEEDS.lose[p.speed || "normal"] * w;
    return -Math.min(rate * 7700 / 7, tdee * 0.30);
  }
  if (p.targetWeight && w >= p.targetWeight) return 0;
  const rate = SPEEDS.gain[p.speed || "normal"] * w;
  return Math.min(rate * 7700 / 7, tdee * 0.15);
}
function kcalTarget(p, tdee, w) {
  const k = tdee + goalDelta(p, w, tdee);
  return Math.round(Math.max(k, p.sex === "m" ? 1500 : 1200) / 10) * 10;
}
function macrosFor(kcal, p, w) {
  const refW = Math.min(w, 25 * (p.height / 100) ** 2);
  let P, F, C;
  const d = p.diet || "recomendada";
  if (d === "alta_proteina") { P = 2.4 * refW; F = kcal * .25 / 9; }
  else if (d === "baja_carbos") { P = 2.0 * refW; C = kcal * .25 / 4; F = (kcal - P * 4 - C * 4) / 9; }
  else if (d === "keto") { P = 1.8 * refW; C = 30; F = (kcal - P * 4 - C * 4) / 9; }
  else if (d === "baja_grasa") { P = 2.0 * refW; F = kcal * .18 / 9; }
  else { P = (p.strength ? 2.0 : 1.6) * refW; F = kcal * .27 / 9; }
  if (C === undefined) C = (kcal - P * 4 - F * 9) / 4;
  if (C < 0) { F = Math.max(30, F + C * 4 / 9); C = Math.max(0, (kcal - P * 4 - F * 9) / 4); }
  return { p: r0(P), c: r0(C), f: r0(F) };
}
function buildPlan(p, w = p.weight, sessions = p.trainDays) {
  const t = tdeeOf(p, w, sessions);
  const kcal = kcalTarget(p, t.tdee, w);
  return { plan: { bmr: r0(t.bmr), tdee: r0(t.tdee), steps: r0(t.steps), ex: r0(t.ex) }, targets: { kcal, ...macrosFor(kcal, p, w) } };
}

/* ================= Días y alimentos ================= */
const getDay = (d, create) => { if (!S.days[d] && create) S.days[d] = { entries: [] }; return S.days[d] || { entries: [] }; };
const nutr = (food, g) => { const k = g / 100, n = food.per100; return { kcal: n.kcal * k, p: n.p * k, c: n.c * k, f: n.f * k }; };
const entryN = e => nutr(e.food, e.grams);
function sumEntries(list) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  list.forEach(e => { const n = entryN(e); t.kcal += n.kcal; t.p += n.p; t.c += n.c; t.f += n.f; });
  return t;
}
const dayTotals = d => sumEntries(getDay(d).entries || []);
const dayTarget = d => (S.days[d] && S.days[d].target) || S.targets;
const dayHasData = d => (getDay(d).entries || []).length > 0;
function statusOf(kcal, target) {
  const diff = kcal - target;
  if (Math.abs(diff) <= 200) return "green";
  if (Math.abs(diff) <= 400) return "yellow";
  return diff < 0 ? "blue" : "red";
}
function dayStatus(d) {
  if (!dayHasData(d)) return null;
  const day = getDay(d);
  if (!day.closed && d >= todayStr()) return null;
  return statusOf(dayTotals(d).kcal, dayTarget(d).kcal);
}
const STATUS_TXT = { green: "Dentro de la meta", yellow: "Cerca de la meta", blue: "Bajo la meta", red: "Sobre la meta" };
const unitBase = f => f.liquid ? "ml" : "g";
function servingsOf(f) { return [...(f.servings || []).filter(s => s.g > 0), { n: unitBase(f), g: 1 }]; }
function gramsOf(f, qty, unit) { const s = servingsOf(f).find(x => x.n === unit) || { g: 1 }; return qty * s.g; }
function qtyLabel(e) {
  const b = unitBase(e.food);
  if (e.unit === b) return `${r1(e.qty)} ${b}`;
  return `${r1(e.qty)} ${e.unit} (${r0(e.grams)} ${b})`;
}
const snap = f => ({ id: f.id, name: f.name, brand: f.brand || "", emoji: f.emoji || "🍽️", per100: { ...f.per100 }, servings: (f.servings || []).map(s => ({ ...s })), liquid: !!f.liquid, source: f.source || "custom", barcode: f.barcode || "" });
function pushRecent(f, qty, unit) {
  S.recents = S.recents.filter(r => r.food.id !== f.id);
  S.recents.unshift({ food: snap(f), qty, unit });
  S.recents = S.recents.slice(0, 40);
}
function addEntry(date, meal, food, qty, unit) {
  const day = getDay(date, true);
  day.entries.push({ id: uid(), meal, food: snap(food), qty, unit, grams: gramsOf(food, qty, unit) });
  pushRecent(food, qty, unit);
  save();
}
const enabledMeals = () => MEAL_ORDER.filter(m => (S.profile.meals || []).includes(m));
function mealByHour() {
  const h = new Date().getHours(), en = enabledMeals();
  const pref = h < 11 ? ["desayuno"] : h < 16 ? ["almuerzo", "snack1"] : h < 20 ? ["once", "snack1", "snack2", "cena"] : ["cena", "snack2"];
  return pref.find(m => en.includes(m)) || en[0];
}

/* ================= Peso ================= */
function weightSeries() { return Object.entries(S.weights).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([d, w]) => ({ d, w })); }
function trendSeries() {
  const s = weightSeries(); let t = null, prev = null;
  return s.map(({ d, w }) => {
    if (t === null) t = w; else { const a = 1 - Math.pow(0.9, Math.max(1, diffDays(prev, d))); t = t + a * (w - t); }
    prev = d; return { d, w, t };
  });
}
function currentWeight() { const t = trendSeries(); return t.length ? t[t.length - 1].t : S.profile.weight; }

/* ================= Ajuste adaptativo ================= */
function computeAdjust(force) {
  const p = S.profile, today = todayStr();
  const since = diffDays(p.createdAt, today);
  if (!force && since < 14) return null;
  const span = Math.min(21, Math.max(since, 1));
  const start = addDays(today, -span), reasons = [];
  let sessions = 0, intake = [], days = 0;
  for (let i = 1; i <= span; i++) {
    const d = addDays(today, -i); days++;
    const day = getDay(d);
    if ((day.workout || []).length) sessions++;
    const k = dayTotals(d).kcal;
    if (k >= 800) intake.push(k);
  }
  const perWeek = sessions / days * 7;
  const w = currentWeight();
  const formula = tdeeOf(p, w, perWeek).tdee;
  if (Math.abs(perWeek - p.trainDays) >= 0.75)
    reasons.push(`Entrenaste ${r1(perWeek)} veces por semana en promedio (tu plan decía ${r1(p.trainDays)}).`);
  let est = formula;
  const ws = weightSeries().filter(x => x.d >= addDays(start, -7));
  if (intake.length >= 10 && ws.length >= 3 && diffDays(ws[0].d, ws[ws.length - 1].d) >= 10) {
    const x0 = pd(ws[0].d), xs = ws.map(o => (pd(o.d) - x0) / 864e5), ys = ws.map(o => o.w);
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
    const avg = intake.reduce((a, b) => a + b) / intake.length;
    const obs = avg - slope * 7700;
    const wt = Math.min(1, intake.length / 21) * 0.7;
    est = obs * wt + formula * (1 - wt);
    reasons.push(`Comiste ${fmt(avg)} kcal/día en promedio y tu peso cambió ${slope >= 0 ? "+" : ""}${r1(slope * 7)} kg/semana → tu gasto real estimado es ~${fmt(obs)} kcal.`);
  }
  const prev = (S.plan && S.plan.tdee) || formula;
  const tdee = prev + clamp(est - prev, -200, 200);
  const kcal = kcalTarget(p, tdee, w);
  if (p.goal === "lose" && p.targetWeight && w <= p.targetWeight) reasons.push("¡Llegaste a tu peso meta! Te paso a mantención.");
  if (p.goal === "gain" && p.targetWeight && w >= p.targetWeight) reasons.push("¡Llegaste a tu peso meta! Te paso a mantención.");
  return { kcal, tdee: r0(tdee), from: S.targets.kcal, reasons, perWeek: r1(perWeek), w: r1(w) };
}
function checkAdaptive() {
  if (!S.profile || S.adapt.pending) return;
  const last = S.adapt.last || S.profile.createdAt;
  if (diffDays(last, todayStr()) < 7) return;
  const a = computeAdjust(false);
  S.adapt.last = todayStr();
  if (a && Math.abs(a.kcal - S.targets.kcal) >= 50) S.adapt.pending = a;
  else if (a && S.plan) S.plan.tdee = a.tdee;
  save();
}
function applyAdjust() {
  const a = S.adapt.pending; if (!a) return;
  const w = currentWeight();
  S.targets = { kcal: a.kcal, ...macrosFor(a.kcal, S.profile, w) };
  S.plan = { ...(S.plan || {}), tdee: a.tdee };
  S.adapt.history.push({ d: todayStr(), from: a.from, to: a.kcal });
  S.adapt.pending = null; save(); render(); toast("Meta actualizada");
}

/* ================= APIs de alimentos ================= */
const OFF_FIELDS = "code,product_name,product_name_es,brands,nutriments,serving_size,serving_quantity,quantity";
function offToFood(p) {
  const n = p.nutriments || {};
  let kcal = n["energy-kcal_100g"];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;
  if (kcal == null) return null;
  const name = (p.product_name_es || p.product_name || "").trim();
  if (!name) return null;
  const servings = [];
  const sq = parseFloat(p.serving_quantity);
  if (sq > 0) servings.push({ n: "porción", g: sq });
  const isLiquid = /ml|cl|\bl\b|litro/i.test(String(p.quantity || "") + String(p.serving_size || ""));
  return {
    id: "off_" + p.code, name, brand: (p.brands || "").split(",")[0].trim(), emoji: "🛒", barcode: p.code,
    per100: { kcal: r1(kcal), p: r1(n.proteins_100g), c: r1(n.carbohydrates_100g), f: r1(n.fat_100g) },
    servings, liquid: isLiquid, source: "off",
  };
}
async function fetchJSON(url, signal) {
  const r = await fetch(url, { signal }); if (!r.ok) throw new Error(r.status); return r.json();
}
async function searchOFF(q, signal) {
  const enc = encodeURIComponent(q);
  const url = host => `https://${host}.openfoodfacts.org/cgi/search.pl?search_terms=${enc}&search_simple=1&action=process&json=1&page_size=30&fields=${OFF_FIELDS}`;
  let out = [];
  try { out = (await fetchJSON(url("cl"), signal)).products || []; } catch (e) { if (e.name === "AbortError") throw e; }
  if (out.length < 6) { try { out = out.concat((await fetchJSON(url("world"), signal)).products || []); } catch (e) { if (e.name === "AbortError") throw e; } }
  const seen = new Set();
  return out.map(offToFood).filter(f => f && !seen.has(f.id) && seen.add(f.id));
}
async function lookupBarcode(code) {
  const j = await fetchJSON(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`);
  if (j.status !== 1 || !j.product) return null;
  j.product.code = j.product.code || code;
  return offToFood(j.product);
}
async function searchUSDA(q) {
  const key = S.settings.usdaKey || "DEMO_KEY";
  const j = await fetchJSON(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${key}&query=${encodeURIComponent(q)}&pageSize=25&dataType=Foundation,SR%20Legacy`);
  return (j.foods || []).map(f => {
    const get = (...nums) => { for (const k of nums) { const x = (f.foodNutrients || []).find(n => n.nutrientNumber === k); if (x && x.value != null) return x.value; } return null; };
    const p = get("203") || 0, c = get("205") || 0, fat = get("204") || 0;
    let kcal = get("208", "957", "958"); if (kcal == null) kcal = p * 4 + c * 4 + fat * 9;
    return { id: "usda_" + f.fdcId, name: f.description.charAt(0) + f.description.slice(1).toLowerCase(), brand: "USDA", emoji: "🇺🇸", per100: { kcal: r1(kcal), p: r1(p), c: r1(c), f: r1(fat) }, servings: [], source: "usda" };
  });
}
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function localSearch(q) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  const all = [...S.custom, ...BASE_FOODS];
  return all.filter(f => { const h = norm(f.name + " " + f.brand); return words.every(w => h.includes(w)); }).slice(0, 30);
}

/* ================= Formato "Pegar de Claude" ================= */
const CLAUDE_PROMPT = `Eres mi asistente de nutrición para mi app EATED. Cuando te describa una comida (ingredientes, receta casera, foto de una etiqueta o plato), estima sus macros y al final respóndeme con un bloque de código con este formato exacto (valores POR 100 g, o por 100 ml si es líquido):

EATED {"eated":1,"alimentos":[{"nombre":"Ñoquis con salsa (casero)","marca":"Casero","emoji":"🍝","por100g":{"kcal":160,"p":6,"c":24,"g":4.5},"porciones":[{"nombre":"plato","g":350}],"registrar":{"comida":"cena","cantidad":1,"porcion":"plato"}}]}

Reglas: "g" son grasas. "liquido":true si es bebida. "porciones" son unidades caseras con sus gramos. Incluye "registrar" solo si te digo que me lo comí (comida: desayuno, almuerzo, once, cena, snack1 o snack2; "fecha":"AAAA-MM-DD" opcional). Puedes poner varios alimentos en la lista.`;
function parseClaude(text) {
  let t = String(text || "").replace(/```(json)?/gi, "");
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i < 0 || j < i) throw new Error("No encontré un bloque { … } en el texto.");
  const obj = JSON.parse(t.slice(i, j + 1));
  let list = Array.isArray(obj) ? obj : obj.alimentos || obj.foods || [obj];
  return list.map(a => {
    const n = a.por100g || a.por100 || a.per100 || a.nutrientes || {};
    const g = v => num(v);
    const food = {
      id: "cl_" + uid(), name: String(a.nombre || a.name || "Sin nombre").slice(0, 80), brand: a.marca || a.brand || "Claude",
      emoji: a.emoji || "✨", liquid: !!(a.liquido || a.liquid), source: "claude",
      per100: { kcal: r1(g(n.kcal ?? n.calorias)), p: r1(g(n.p ?? n.proteina ?? n.proteinas)), c: r1(g(n.c ?? n.carbos ?? n.carbohidratos)), f: r1(g(n.g ?? n.f ?? n.grasa ?? n.grasas)) },
      servings: (a.porciones || a.servings || []).map(s => ({ n: String(s.nombre || s.n || "porción"), g: g(s.g ?? s.gramos) })).filter(s => s.g > 0),
    };
    if (!food.per100.kcal && (food.per100.p || food.per100.c || food.per100.f)) food.per100.kcal = r1(food.per100.p * 4 + food.per100.c * 4 + food.per100.f * 9);
    return { food, reg: a.registrar || a.log || null };
  });
}

/* ================= Render principal ================= */
function render() {
  document.documentElement.dataset.accent = S.settings.accent || "lila";
  const app = $("#app"), bar = $("#tabbar");
  if (!S.profile || UI.ob) { bar.classList.add("hidden"); app.innerHTML = renderOnboarding(); return; }
  bar.classList.remove("hidden");
  bar.innerHTML = [["hoy", "Hoy", IC.today], ["buscar", "Agregar", IC.search], ["progreso", "Progreso", IC.chart], ["ajustes", "Ajustes", IC.gear]]
    .map(([k, n, i]) => `<button class="tab ${UI.tab === k ? "active" : ""}" data-a="tab" data-k="${k}">${i}<span>${n}</span></button>`).join("");
  app.innerHTML = UI.tab === "progreso" ? renderProgress() : UI.tab === "ajustes" ? renderSettings() : renderToday();
}

/* ---------- Hoy ---------- */
function renderWeek() {
  const sel = pd(UI.date), mon = new Date(sel); mon.setDate(sel.getDate() - dowIdx(sel));
  let cells = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i); const k = ds(d);
    const st = dayStatus(k);
    const dotCls = st ? "col-" + st : (k === todayStr() && dayHasData(k) ? "" : "");
    cells += `<button class="d ${k === UI.date ? "sel" : ""}" data-a="pickDay" data-d="${k}">
      <span class="dl">${DOW[i]}</span><span class="dn">${d.getDate()}</span><span class="dot ${dotCls}" ${!st && dayHasData(k) ? 'style="background:var(--acc)"' : ""}></span></button>`;
  }
  const isToday = UI.date === todayStr();
  const title = isToday ? "Hoy" : sel.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  return `<div class="card" style="padding:12px 10px 10px">
    <div class="weekhead"><button class="iconbtn" data-a="weekNav" data-n="-7">${IC.back}</button>
      <button class="title" data-a="goToday">${esc(title)}${isToday ? "" : " · volver a hoy"}</button>
      <button class="iconbtn" data-a="weekNav" data-n="7">${IC.fwd}</button></div>
    <div class="week">${cells}</div></div>`;
}
function gaugeSVG(kcal, target, color) {
  const max = target + 600, f = v => clamp(v / max, 0, 1);
  const pt = t => { const a = Math.PI * (1 - t); return [180 + 160 * Math.cos(a), 100 - 160 * Math.sin(a) * 0.55]; };
  const arc = (a, b) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A160 88 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  const lo = f(target - 200), hi = f(target + 200), v = f(kcal);
  const [lx, ly] = pt(lo), [hx, hy] = pt(hi), [vx, vy] = pt(v);
  const col = color ? `var(--${color})` : "var(--acc)";
  return `<svg class="gauge" viewBox="0 0 360 114">
    <path d="${arc(0, 1)}" stroke="#333338" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="${arc(lo, hi)}" stroke="rgba(52,199,89,.28)" stroke-width="10" fill="none"/>
    ${v > 0.002 ? `<path d="${arc(0, v)}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>` : ""}
    <line x1="${lx}" y1="${ly - 11}" x2="${lx}" y2="${ly + 11}" stroke="#ddd" stroke-width="3" stroke-linecap="round"/>
    <line x1="${hx}" y1="${hy - 11}" x2="${hx}" y2="${hy + 11}" stroke="#ddd" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${vx}" cy="${vy}" r="9" fill="${col}" stroke="#1a1a1c" stroke-width="3"/>
  </svg>`;
}
function renderSummary() {
  const d = UI.date, day = getDay(d), T = dayTarget(d), t = dayTotals(d);
  const st = dayStatus(d);
  const liveCol = !st && t.kcal > T.kcal + 200 ? statusOf(t.kcal, T.kcal) : null;
  const left = T.kcal - t.kcal;
  const mac = (lbl, v, goal, colVar) => {
    const pc = goal ? v / goal : 0; const over = pc > 1.12;
    return `<div class="macro"><div class="lbl">${lbl}</div><div class="val">${r0(v)} <span class="muted">/ ${goal} g</span></div>
      <div class="bar"><i style="width:${clamp(pc * 100, 0, 100)}%;background:${over ? "var(--yellow)" : `var(${colVar})`}"></i></div></div>`;
  };
  let line;
  if (st) line = `<div class="statusline tx-${st}">● ${STATUS_TXT[st]} · ${left >= 0 ? "faltaron" : "sobraron"} ${fmt(Math.abs(left))} kcal</div>`;
  else line = `<div class="statusline muted">${left >= 0 ? `Te quedan <b style="color:var(--text)">${fmt(left)}</b> kcal` : `Te pasaste por <b class="tx-red">${fmt(-left)}</b> kcal`} · rango verde ${fmt(T.kcal - 200)}–${fmt(T.kcal + 200)}</div>`;
  const closedBtn = day.closed
    ? `<button class="endday closed" data-a="reopenDay">Día terminado ✓ · tocar para reabrir</button>`
    : `<button class="endday" data-a="endDay">Terminar día</button>`;
  return `<div class="card summary">
    <div class="muted" style="font-weight:600">kcal</div>
    <div class="big">${fmt(t.kcal)} <small>/ ${fmt(T.kcal)}</small></div>
    ${gaugeSVG(t.kcal, T.kcal, st || liveCol)}
    ${line}
    <div class="macros">${mac("Proteína", t.p, T.p, "--p")}${mac("Carbos", t.c, T.c, "--c")}${mac("Grasas", t.f, T.f, "--f")}</div>
    ${dayHasData(d) ? closedBtn : ""}
  </div>`;
}
function renderMeal(m) {
  const d = UI.date, items = getDay(d).entries.filter(e => e.meal === m), t = sumEntries(items);
  const prevItems = getDay(addDays(d, -1)).entries.filter(e => e.meal === m);
  const copy = !items.length && prevItems.length && !UI.dismissCopy[d + m]
    ? `<div class="copyrow"><span>📋</span><div class="grow"><b>¿Copiar del día anterior?</b><span class="muted">${prevItems.length} ${prevItems.length === 1 ? "alimento" : "alimentos"} · ${fmt(sumEntries(prevItems).kcal)} kcal</span></div>
       <button class="tx-green" data-a="copyPrev" data-m="${m}">${IC.check.replace("<svg", '<svg width="22" height="22"')}</button>
       <button class="muted" data-a="dismissCopy" data-m="${m}">${IC.x.replace("<svg", '<svg width="20" height="20"')}</button></div>` : "";
  return `<div class="card">
    <div class="mealhead"><div><h2>${MEALS[m].n}</h2>
      <div class="mealmeta">🔥 <b>${fmt(t.kcal)} kcal</b> · ${r0(t.p)} P | ${r0(t.c)} C | ${r0(t.f)} G</div></div>
      ${items.length ? `<button class="iconbtn" data-a="mealMenu" data-m="${m}">${IC.dots}</button>` : ""}</div>
    ${items.map(e => { const n = entryN(e); return `<div class="item" data-a="editEntry" data-id="${e.id}">
      <div class="emoji">${esc(e.food.emoji)}</div>
      <div class="grow"><div class="nm ellipsis">${esc(e.food.name)}</div><div class="br ellipsis">${esc(e.food.brand)}</div></div>
      <div class="q"><div>${esc(qtyLabel(e))}</div><div class="k">${fmt(n.kcal)} kcal</div></div></div>`; }).join("")}
    ${copy}
    <button class="addbtn" data-a="openSearch" data-m="${m}">+</button>
  </div>`;
}
function renderToday() {
  const d = UI.date, day = getDay(d), on = !!day.creatine, wk = day.workout || [];
  const w = S.weights[d];
  let banner = "";
  const lastExp = S.settings.lastExport;
  if (Object.keys(S.days).length >= 5 && (!lastExp || diffDays(lastExp, todayStr()) >= 14))
    banner = `<div class="banner">💾<div class="grow">${lastExp ? `Último respaldo hace <b>${diffDays(lastExp, todayStr())} días</b>.` : "Aún no has hecho un respaldo."} Expórtalo para no perder tus datos.</div><button class="chip on" data-a="exportData">Exportar</button></div>`;
  if (S.adapt.pending) banner += `<div class="banner">🧠<div class="grow">Tengo un <b>ajuste semanal</b> de calorías para ti.</div><button class="chip on" data-a="tab" data-k="progreso">Ver</button></div>`;
  return `${renderWeek()}${banner}${renderSummary()}
    ${enabledMeals().map(renderMeal).join("")}
    <div class="card"><div class="checkcard" data-a="toggleCreatine">
      <div class="emoji">💊</div><div class="grow"><h3>Creatina</h3><div class="sub">${on ? "Tomada hoy ✓" : "¿La tomaste hoy?"}</div></div>
      <div class="check ${on ? "on" : ""}">${on ? IC.check : ""}</div></div></div>
    <div class="card"><div class="row between"><div><h2>Entreno</h2><div class="sub">${wk.length ? `${wk.map(g => GROUPS[g][0]).join(" + ")} · ${day.workMin || S.profile.workMin || 90} min` : "Marca lo que entrenaste"}</div></div>
      ${wk.length ? `<button class="chip" data-a="editWorkMin">⏱ ${day.workMin || S.profile.workMin || 90} min</button>` : ""}</div>
      <div class="groups">${Object.entries(GROUPS).map(([k, [n, e]]) => `<button class="group ${wk.includes(k) ? "on" : ""}" data-a="toggleGroup" data-g="${k}"><span class="e">${e}</span>${n}</button>`).join("")}</div></div>
    <div class="card"><div class="row between"><div><h2>Peso</h2><div class="sub">${w ? `Registrado: <b style="color:var(--text)">${r1(w)} kg</b>` : `Tendencia actual: ${r1(currentWeight())} kg`}</div></div>
      <button class="chip on" data-a="logWeight">${w ? "Editar" : "+ Registrar"}</button></div></div>`;
}

/* ---------- Onboarding ---------- */
const OB_STEPS = ["hola", "objetivo", "sobre", "actividad", "dieta", "comidas", "meta", "resultado"];
function obData() {
  if (!UI.ob) UI.ob = { step: 0, d: S.profile ? { ...S.profile } : { name: "", goal: "", sex: "m", age: "", height: "", weight: "", trainDays: 3.5, strength: true, steps: 4500, workMin: 90, diet: "recomendada", meals: ["desayuno", "almuerzo", "once", "cena"], targetWeight: "", speed: "normal" } };
  return UI.ob;
}
function renderOnboarding() {
  const ob = obData(), d = ob.d, step = OB_STEPS[ob.step];
  const head = (ic, t, p) => `<div class="ob-hero"><div class="ic">${ic}</div><h1>${t}</h1>${p ? `<p>${p}</p>` : ""}</div>`;
  const top = ob.step > 0 ? `<div class="ob-top"><button class="iconbtn" data-a="obBack">${IC.back}</button><div class="progress"><i style="width:${ob.step / (OB_STEPS.length - 1) * 100}%"></i></div></div>` : "";
  const opt = (field, val, e, t, sub, multi) => {
    const on = multi ? (d[field] || []).includes(val) : d[field] === val;
    return `<button class="opt ${on ? "on" : ""}" data-a="obSet" data-f="${field}" data-v="${val}" ${multi ? 'data-multi="1"' : ""}><span class="e">${e}</span><div class="grow"><b>${t}</b>${sub ? `<span>${sub}</span>` : ""}</div>${on ? `<div class="check on">${IC.check}</div>` : ""}</button>`;
  };
  let body = "", ok = true;
  if (step === "hola") {
    body = `<div class="ob-hero" style="margin-top:14vh"><div class="logo">EAT<span>ED</span></div><p style="margin-top:10px">Tu tracker personal de calorías y macros.</p></div>
      <div class="field"><label>¿Cómo te llamas?</label><input data-in="obField" data-f="name" value="${esc(d.name)}" placeholder="Tu nombre" autocomplete="given-name"></div>`;
    ok = !!String(d.name).trim();
  } else if (step === "objetivo") {
    body = head("🎯", "¿Cuál es tu objetivo?", "Calcularemos tus calorías para lograrlo") +
      `<div class="ob-body">${opt("goal", "lose", "🔥", "Perder grasa", "Déficit calórico conservando músculo")}${opt("goal", "gain", "💪", "Ganar músculo", "Superávit para un bulk limpio")}${opt("goal", "maintain", "⚖️", "Mantener peso", "Recomposición corporal")}</div>`;
    ok = !!d.goal;
  } else if (step === "sobre") {
    body = head("📋", "Sobre ti", "Para calcular tu gasto calórico") +
      `<div class="field"><label>Sexo</label><div class="seg"><button class="${d.sex === "m" ? "on" : ""}" data-a="obSet" data-f="sex" data-v="m">Hombre</button><button class="${d.sex === "f" ? "on" : ""}" data-a="obSet" data-f="sex" data-v="f">Mujer</button></div></div>
      <div class="grid2"><div class="field"><label>Edad</label><input inputmode="numeric" data-in="obField" data-f="age" value="${esc(d.age)}" placeholder="años"></div>
      <div class="field"><label>Altura (cm)</label><input inputmode="numeric" data-in="obField" data-f="height" value="${esc(d.height)}" placeholder="cm"></div></div>
      <div class="field"><label>Peso actual (kg)</label><input inputmode="decimal" data-in="obField" data-f="weight" value="${esc(d.weight)}" placeholder="kg"></div>`;
    ok = num(d.age) > 10 && num(d.height) > 100 && num(d.weight) > 30;
  } else if (step === "actividad") {
    const days = [[0, "0"], [1.5, "1-2"], [3.5, "3-4"], [5.5, "5-6"], [7, "7"]];
    body = head("🏋️", "Tu actividad", "Luego la app se ajusta según lo que realmente registres") +
      `<div class="field"><label>Días de entreno por semana</label><div class="seg">${days.map(([v, l]) => `<button class="${d.trainDays == v ? "on" : ""}" data-a="obSet" data-f="trainDays" data-v="${v}" data-num="1">${l}</button>`).join("")}</div></div>
      <div class="field"><label>¿Entrenas fuerza (pesas)?</label><div class="seg"><button class="${d.strength ? "on" : ""}" data-a="obSet" data-f="strength" data-v="1" data-bool="1">Sí</button><button class="${!d.strength ? "on" : ""}" data-a="obSet" data-f="strength" data-v="0" data-bool="1">No</button></div></div>
      <div class="grid2"><div class="field"><label>Duración entreno (min)</label><input inputmode="numeric" data-in="obField" data-f="workMin" value="${esc(d.workMin)}"></div>
      <div class="field"><label>Pasos diarios promedio</label><input inputmode="numeric" data-in="obField" data-f="steps" value="${esc(d.steps)}"></div></div>
      <p class="muted small">Los pasos quedan fijos; los puedes cambiar en Ajustes cuando quieras.</p>`;
    ok = num(d.steps) >= 0;
  } else if (step === "dieta") {
    body = head("🥣", "¿Qué tipo de dieta prefieres?", "Define cómo se reparten tus macros") +
      `<div class="ob-body">${Object.entries(DIETS).map(([k, [e, t, s]]) => opt("diet", k, e, t, s)).join("")}</div>`;
  } else if (step === "comidas") {
    body = head("🍱", "¿Qué comidas haces al día?", "Puedes cambiarlo después") +
      `<div class="ob-body">${MEAL_ORDER.map(m => opt("meals", m, MEALS[m].e, MEALS[m].n, "", true)).join("")}</div>`;
    ok = (d.meals || []).length > 0;
  } else if (step === "meta") {
    const g = d.goal;
    body = head("📈", "Personaliza tu objetivo", g === "maintain" ? "Mantendremos tu peso actual" : "Último paso para tus calorías y macros");
    if (g !== "maintain") {
      const sp = g === "lose" ? { lento: "Lento · 0,4%/sem", normal: "Normal · 0,7%/sem", rapido: "Rápido · 1%/sem" } : { lento: "Lento · 0,1%/sem", normal: "Normal · 0,2%/sem", rapido: "Rápido · 0,35%/sem" };
      body += `<div class="field"><label>Peso meta (kg)</label><input inputmode="decimal" data-in="obField" data-f="targetWeight" value="${esc(d.targetWeight)}" placeholder="kg"></div>
        <div class="field"><label>Velocidad</label><div class="ob-body" style="gap:10px">${Object.entries(sp).map(([k, l]) => opt("speed", k, k === "rapido" ? "🐇" : k === "normal" ? "🚶" : "🐢", l, "")).join("")}</div></div>`;
      ok = num(d.targetWeight) > 30 && (g === "lose" ? num(d.targetWeight) < num(d.weight) : num(d.targetWeight) > num(d.weight));
      if (num(d.targetWeight) > 30 && !ok) body += `<p class="tx-yellow small">El peso meta debe ser ${g === "lose" ? "menor" : "mayor"} que tu peso actual.</p>`;
    } else body += `<p class="muted center">Tu peso actual: ${esc(d.weight)} kg</p>`;
  } else if (step === "resultado") {
    const p = normProfile(d), { plan, targets } = buildPlan(p);
    if (!ob.t) ob.t = targets;
    const T = ob.t;
    const diff = T.kcal - plan.tdee;
    body = `<div class="ob-hero"><div class="ic">✅</div><h1>¡Listo${p.name ? ", " + esc(p.name) : ""}! Tu meta diaria</h1><p>Puedes ajustar los números si quieres</p></div>
      <div class="card summary"><div class="big">${fmt(T.kcal)} <small>kcal</small></div>
      <div class="muted small" style="margin-top:6px">Gasto estimado ${fmt(plan.tdee)} kcal · ${diff < 0 ? "déficit" : diff > 0 ? "superávit" : "diferencia"} ${fmt(Math.abs(diff))} kcal</div>
      <div class="grid4" style="margin-top:18px">
        <div><label class="small muted">kcal</label><input inputmode="numeric" data-in="obT" data-k="kcal" value="${T.kcal}"></div>
        <div><label class="small muted">Prot (g)</label><input inputmode="numeric" data-in="obT" data-k="p" value="${T.p}"></div>
        <div><label class="small muted">Carb (g)</label><input inputmode="numeric" data-in="obT" data-k="c" value="${T.c}"></div>
        <div><label class="small muted">Grasa (g)</label><input inputmode="numeric" data-in="obT" data-k="f" value="${T.f}"></div></div>
      <div class="muted small" style="margin-top:12px">Metabolismo basal ${fmt(plan.bmr)} · pasos +${fmt(plan.steps)} · entreno +${fmt(plan.ex)} (prom. diario)</div></div>
      <p class="muted small center">Cada semana EATED revisa tu peso, lo que comiste y cuánto entrenaste, y te propone ajustes.</p>`;
  }
  const last = ob.step === OB_STEPS.length - 1;
  return `<div class="ob">${top}<div class="grow" style="display:flex;flex-direction:column">${body}</div>
    <div class="ob-foot"><button class="btn" data-a="${last ? "obFinish" : "obNext"}" ${ok ? "" : "disabled"}>${last ? (S.profile ? "Guardar cambios" : "Empezar") : "Continuar"}</button>
    ${S.profile && ob.step === 0 ? `<button class="btn secondary" style="margin-top:10px" data-a="obCancel">Cancelar</button>` : ""}</div></div>`;
}
function normProfile(d) {
  return {
    name: String(d.name || "").trim(), goal: d.goal || "maintain", sex: d.sex || "m", age: num(d.age), height: num(d.height), weight: num(d.weight),
    trainDays: num(d.trainDays), strength: !!d.strength, steps: num(d.steps), workMin: num(d.workMin) || 90, diet: d.diet || "recomendada",
    meals: d.meals && d.meals.length ? d.meals : ["almuerzo", "cena"], targetWeight: num(d.targetWeight) || null, speed: d.speed || "normal",
    createdAt: d.createdAt || todayStr(),
  };
}

/* ---------- Progreso ---------- */
function renderProgress() {
  const p = S.profile, ts = trendSeries(), cw = currentWeight();
  let goal = "";
  if (p.goal !== "maintain" && p.targetWeight) {
    const start = p.weight, total = Math.abs(start - p.targetWeight), done = clamp(Math.abs(start - cw) * Math.sign((start - cw) * (p.goal === "lose" ? 1 : -1)), 0, total);
    const rate = SPEEDS[p.goal === "lose" ? "lose" : "gain"][p.speed] * cw;
    const weeks = Math.ceil(Math.abs(cw - p.targetWeight) / rate);
    goal = `<div class="card"><div class="row"><span style="font-size:24px">${p.goal === "lose" ? "🔥" : "💪"}</span><h2>${p.goal === "lose" ? "Perder grasa" : "Ganar músculo"}</h2></div>
      <div class="row between" style="margin-top:14px"><div style="font-size:22px;font-weight:700">${r1(cw)} kg <span class="muted" style="font-size:16px">(${cw - start >= 0 ? "+" : ""}${r1(cw - start)} kg)</span></div><div style="font-size:20px;font-weight:700">🎯 ${r1(p.targetWeight)} kg</div></div>
      <div class="bar" style="margin:12px 0"><i style="width:${total ? done / total * 100 : 0}%"></i></div>
      <div class="row between muted"><span>📅 Tiempo estimado</span><span>${weeks > 0 ? `${weeks} semanas` : "¡Meta lograda!"}</span></div></div>`;
  }
  let adj = "";
  if (S.adapt.pending) {
    const a = S.adapt.pending;
    adj = `<div class="card adjust"><h3>🧠 Ajuste semanal sugerido</h3>
      <div style="font-size:24px;font-weight:800;margin:10px 0">${fmt(a.from)} → <span style="color:var(--acc)">${fmt(a.kcal)}</span> kcal</div>
      ${a.reasons.length ? a.reasons.map(r => `<p class="muted small" style="margin:6px 0">• ${esc(r)}</p>`).join("") : `<p class="muted small">Recalculado con tu peso actual (${a.w} kg) y tus entrenos registrados.</p>`}
      <div class="grid2" style="margin-top:12px"><button class="btn secondary" data-a="ignoreAdjust">Ignorar</button><button class="btn" data-a="applyAdjust">Aplicar</button></div></div>`;
  }
  // semana
  const last7 = [...Array(7)].map((_, i) => addDays(todayStr(), -i));
  const logged = last7.filter(d => dayTotals(d).kcal >= 300);
  const avg = k => logged.length ? logged.reduce((a, d) => a + dayTotals(d)[k], 0) / logged.length : 0;
  const workouts = last7.filter(d => (getDay(d).workout || []).length).length;
  const creat = last7.filter(d => getDay(d).creatine).length;
  return `<div class="section-title" style="margin-top:8px">Progreso</div>${adj}${goal}
    ${renderCalendar()}
    <div class="card"><div class="row between"><h2>Peso</h2><button class="chip on" data-a="logWeight">+ Registrar</button></div>
      <div class="sub">Tendencia: <b style="color:var(--text)">${r1(cw)} kg</b> · ${ts.length} registros</div>${weightChart(ts)}</div>
    <div class="section-title">Últimos 7 días</div>
    <div class="stats">
      <div class="stat"><div class="t">⚡ Calorías prom.</div><div class="v">${fmt(avg("kcal"))} <small>kcal</small></div><div class="muted small">meta ${fmt(S.targets.kcal)}</div></div>
      <div class="stat"><div class="t">🥩 Proteína prom.</div><div class="v">${r0(avg("p"))} <small>g</small></div><div class="muted small">meta ${S.targets.p} g</div></div>
      <div class="stat"><div class="t">🏋️ Entrenos</div><div class="v">${workouts} <small>días</small></div><div class="muted small">plan ${r1(p.trainDays)}/sem</div></div>
      <div class="stat"><div class="t">💊 Creatina</div><div class="v">${creat}<small>/7</small></div><div class="muted small">días tomada</div></div>
    </div>`;
}
function renderCalendar() {
  if (!UI.calMonth) UI.calMonth = todayStr().slice(0, 7);
  const [y, m] = UI.calMonth.split("-").map(Number), first = new Date(y, m - 1, 1), nd = new Date(y, m, 0).getDate();
  let cells = DOW.map(d => `<div class="h">${d}</div>`).join("") + `<div class="c empty"></div>`.repeat(dowIdx(first));
  let counts = { green: 0, yellow: 0, blue: 0, red: 0 };
  for (let i = 1; i <= nd; i++) {
    const k = `${y}-${pad(m)}-${pad(i)}`, st = dayStatus(k), day = getDay(k);
    if (st) counts[st]++;
    cells += `<button class="c ${st ? "col-" + st : ""} ${k === todayStr() ? "today" : ""}" data-a="calDay" data-d="${k}">${i}${day.creatine ? '<span class="cr"></span>' : ""}${(day.workout || []).length ? '<span class="wk">🏋️</span>' : ""}</button>`;
  }
  return `<div class="card"><div class="row between"><button class="iconbtn" data-a="calNav" data-n="-1">${IC.back}</button>
    <h3 style="text-transform:capitalize">${MONTHS[m - 1]} ${y}</h3><button class="iconbtn" data-a="calNav" data-n="1">${IC.fwd}</button></div>
    <div class="cal">${cells}</div>
    <div class="legend2"><span><i class="col-green"></i>En meta ${counts.green}</span><span><i class="col-yellow"></i>Cerca ${counts.yellow}</span><span><i class="col-blue"></i>Bajo ${counts.blue}</span><span><i class="col-red"></i>Sobre ${counts.red}</span><span><i style="background:var(--acc)"></i>Creatina</span><span>🏋️ Entreno</span></div></div>`;
}
function weightChart(ts) {
  const pts = ts.filter(x => x.d >= addDays(todayStr(), -90));
  if (pts.length < 2) return `<p class="muted small" style="margin-top:14px">Registra tu peso algunos días (aunque te saltes varios) y aquí verás tu tendencia.</p>`;
  const W = 340, H = 160, x0 = pd(pts[0].d), span = Math.max(1, diffDays(pts[0].d, pts[pts.length - 1].d));
  const vals = pts.flatMap(p => [p.w, p.t]); let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi - lo < 2) { lo -= 1; hi += 1; }
  const X = d => 16 + (pd(d) - x0) / 864e5 / span * (W - 32), Y = v => 12 + (hi - v) / (hi - lo) * (H - 36);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${X(p.d).toFixed(1)} ${Y(p.t).toFixed(1)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <text x="${W - 4}" y="${Y(hi) + 4}" fill="#8e8e93" font-size="11" text-anchor="end">${r1(hi)}</text>
    <text x="${W - 4}" y="${Y(lo) + 4}" fill="#8e8e93" font-size="11" text-anchor="end">${r1(lo)}</text>
    ${pts.map(p => `<circle cx="${X(p.d).toFixed(1)}" cy="${Y(p.w).toFixed(1)}" r="3" fill="#55555c"/>`).join("")}
    <path d="${line}" stroke="var(--acc)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="16" y="${H - 4}" fill="#8e8e93" font-size="11">${pd(pts[0].d).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</text>
    <text x="${W - 16}" y="${H - 4}" fill="#8e8e93" font-size="11" text-anchor="end">${pd(pts[pts.length - 1].d).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</text></svg>`;
}

/* ---------- Ajustes ---------- */
function renderSettings() {
  const p = S.profile, T = S.targets;
  const goalTxt = { lose: "Perder grasa", gain: "Ganar músculo", maintain: "Mantener" }[p.goal];
  return `<div class="section-title" style="margin-top:8px">Ajustes</div>
  <div class="card">
    <div class="setrow"><div><b>${esc(p.name)}</b><div class="muted small">${goalTxt} · ${p.age} años · ${p.height} cm · ${r1(currentWeight())} kg</div></div><button class="chip on" data-a="editProfile">Editar</button></div>
    <div class="setrow"><span>Meta diaria</span><button class="chip" data-a="editTargets">${fmt(T.kcal)} kcal · ${T.p}P ${T.c}C ${T.f}G ✎</button></div>
    <div class="setrow"><span>Pasos diarios</span><button class="chip" data-a="editSteps">${fmt(p.steps)} ✎</button></div>
    <div class="setrow"><span>Recalcular ahora</span><button class="chip" data-a="forceAdjust">🧠 Revisar</button></div>
  </div>
  <div class="card"><h3>Comidas del día</h3><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:12px">
    ${MEAL_ORDER.map(m => `<button class="chip ${p.meals.includes(m) ? "on" : ""}" data-a="toggleMeal" data-m="${m}">${MEALS[m].e} ${MEALS[m].n}</button>`).join("")}</div></div>
  <div class="card"><h3>Color de acento</h3><div class="seg" style="margin-top:12px">
    <button class="${S.settings.accent === "lila" ? "on" : ""}" data-a="accent" data-v="lila">💜 Lila</button><button class="${S.settings.accent === "celeste" ? "on" : ""}" data-a="accent" data-v="celeste">🩵 Celeste</button></div></div>
  <div class="card"><h3>✨ Claude</h3><p class="muted small">Para platos caseros: pégale este texto a Claude una vez (o úsalo en un proyecto) y después pega su respuesta en <b>Agregar → Pegar de Claude</b>.</p>
    <button class="btn secondary" data-a="copyPrompt">Copiar instrucciones para Claude</button></div>
  <div class="card"><h3>💾 Respaldo</h3><p class="muted small">Tus datos viven solo en este iPhone. Exporta un respaldo de vez en cuando (y siempre antes de cambiar de teléfono o borrar la app).${S.settings.lastExport ? ` Último: ${S.settings.lastExport}.` : ""}</p>
    <div class="grid2"><button class="btn" data-a="exportData">Exportar</button><button class="btn secondary" data-a="importData">Importar</button></div>
    <input type="file" id="importFile" accept="application/json,.json" class="hidden"></div>
  <div class="card"><h3>Base genérica USDA (opcional)</h3><p class="muted small">Funciona sin clave con límite bajo. Puedes pedir una clave gratis en api.data.gov y pegarla aquí.</p>
    <input placeholder="API key (opcional)" data-ch="usdaKey" value="${esc(S.settings.usdaKey)}"></div>
  <div class="card"><button class="btn danger" data-a="resetAll">Borrar todos los datos</button></div>
  <p class="muted small center">EATED v1 · ${S.custom.length} alimentos propios · ${Object.keys(S.days).length} días registrados</p>`;
}

/* ================= Sheets ================= */
function openSheet(s) { UI.sheets.push(s); renderSheet(); }
function replaceSheet(s) { UI.sheets[UI.sheets.length - 1] = s; renderSheet(); }
function closeSheet(all) {
  const top = UI.sheets[UI.sheets.length - 1];
  if (top && top.type === "scan") stopScan();
  if (all) { UI.sheets.forEach(s => s.type === "scan" && stopScan()); UI.sheets = []; } else UI.sheets.pop();
  renderSheet(); render();
}
function renderSheet() {
  const root = $("#sheet-root"), s = UI.sheets[UI.sheets.length - 1];
  if (!s) { root.innerHTML = ""; document.body.style.overflow = ""; return; }
  document.body.style.overflow = "hidden";
  const R = { search: sheetSearch, food: sheetFood, create: sheetCreate, paste: sheetPaste, scan: sheetScan, mealMenu: sheetMealMenu, input: sheetInput, targets: sheetTargets }[s.type];
  root.innerHTML = `<div class="overlay" data-a="closeSheet"></div><div class="sheet ${s.full ? "full" : ""}">${s.full ? "" : '<div class="grabber"></div>'}${R(s)}</div>`;
  if (s.type === "search") { renderResults(); const inp = $("#q"); if (inp && s.focus) { inp.focus(); s.focus = false; } }
  if (s.type === "scan") startScan();
  if (s.type === "input") setTimeout(() => { const i = $("#sheetInput"); i && i.focus(); }, 50);
}
const sheetHead = (title, back = true) => `<div class="sheethead">${back && UI.sheets.length > 1 ? `<button class="iconbtn" data-a="closeSheet">${IC.back}</button>` : ""}<h2>${title}</h2><button class="iconbtn" data-a="closeAll">${IC.x}</button></div>`;

/* --- Buscar --- */
function sheetSearch(s) {
  const tabs = [["todo", "Todo"], ["recientes", "Recientes"], ["favoritos", "❤️ Favoritos"], ["mios", "✎ Míos"], ["guardadas", "🍱 Comidas"]];
  return `<div class="sheethead"><select data-ch="searchMeal" style="width:auto;padding:8px 12px;border-radius:999px;font-weight:700">${enabledMeals().map(m => `<option value="${m}" ${m === s.meal ? "selected" : ""}>${MEALS[m].n}</option>`).join("")}</select><div class="grow"></div><button class="iconbtn" data-a="closeAll">${IC.x}</button></div>
    <div class="searchbar">${IC.search.replace("<svg", '<svg width="20" height="20" style="color:var(--muted)"')}<input id="q" placeholder="Buscar alimento o marca" value="${esc(s.q)}" data-in="searchQ" autocomplete="off" enterkeyhint="search"></div>
    <div class="actions"><button class="action" data-a="openScan">${IC.scan}Escanear</button><button class="action" data-a="openPaste">${IC.sparkle}Pegar de Claude</button><button class="action" data-a="openCreate">${IC.plusc}Crear</button></div>
    <div class="tabs">${tabs.map(([k, n]) => `<button class="chip ${s.tab === k ? "on" : ""}" data-a="searchTab" data-k="${k}">${n}</button>`).join("")}</div>
    <div id="results"></div>`;
}
function resultRow(f, extra = "") {
  const sv = (f.servings || [])[0];
  const q = sv ? `${sv.n} (${r0(sv.g)} ${unitBase(f)})` : `100 ${unitBase(f)}`;
  const k = sv ? f.per100.kcal * sv.g / 100 : f.per100.kcal;
  return `<div class="result" data-a="pickFood" data-fid="${esc(f.id)}"><div class="emoji">${esc(f.emoji || "🍽️")}</div>
    <div class="grow"><div class="nm ellipsis">${esc(f.name)}</div><div class="br ellipsis">${esc(f.brand || "")}${extra}</div></div>
    <div class="q"><b>${fmt(k)} kcal</b>${esc(q)}</div></div>`;
}
const FOOD_CACHE = new Map();
const cacheFoods = list => { list.forEach(f => FOOD_CACHE.set(f.id, f)); return list; };
let searchCtl = null, searchTimer = null;
function renderResults() {
  const s = UI.sheets[UI.sheets.length - 1]; if (!s || s.type !== "search") return;
  const box = $("#results"); if (!box) return;
  const q = s.q.trim();
  if (s.tab === "guardadas") {
    const list = S.savedMeals.filter(m => !q || norm(m.name).includes(norm(q)));
    box.innerHTML = list.length ? list.map(m => { const t = sumEntries(m.items); return `<div class="result" data-a="addSaved" data-id="${m.id}"><div class="emoji">🍱</div>
      <div class="grow"><div class="nm ellipsis">${esc(m.name)}</div><div class="br ellipsis">${m.items.map(i => esc(i.food.name)).join(" · ")}</div></div>
      <div class="q"><b>${fmt(t.kcal)} kcal</b>${m.items.length} alimentos</div><button class="iconbtn" style="margin-left:6px" data-a="delSaved" data-id="${m.id}">${IC.trash}</button></div>`; }).join("")
      : `<p class="muted center small" style="margin-top:30px">Aún no tienes comidas guardadas.<br>En una comida con alimentos toca <b>⋯ → Guardar como comida</b>.</p>`;
    return;
  }
  if (s.tab === "recientes" || (s.tab === "todo" && !q)) {
    const rec = cacheFoods(S.recents.map(r => r.food));
    const lbl = s.tab === "todo" ? `<div class="listlabel">Recientes</div>` : "";
    box.innerHTML = rec.length ? lbl + rec.map(f => resultRow(f)).join("") : `<p class="muted center small" style="margin-top:30px">Busca un alimento, escanea un código de barras o pega lo que te calculó Claude.</p>`;
    return;
  }
  if (s.tab === "favoritos" || s.tab === "mios") {
    let list = s.tab === "favoritos" ? Object.values(S.favs) : S.custom;
    if (q) list = list.filter(f => norm(f.name + " " + f.brand).includes(norm(q)));
    cacheFoods(list);
    box.innerHTML = list.length ? list.map(f => resultRow(f)).join("") : `<p class="muted center small" style="margin-top:30px">${s.tab === "favoritos" ? "Toca ♡ en un alimento para guardarlo aquí." : "Aquí aparecen los alimentos que creas o pegas de Claude."}</p>`;
    return;
  }
  // todo + query
  const local = cacheFoods(localSearch(q));
  const remote = s.remote && s.remote.q === q ? s.remote : null;
  let html = local.length ? `<div class="listlabel">Mis alimentos y genéricos</div>` + local.map(f => resultRow(f)).join("") : "";
  html += `<div class="listlabel">Productos (Open Food Facts)</div>`;
  if (!remote || remote.loading) html += `<div class="spinner"></div>`;
  else if (remote.error) html += `<p class="muted small">No se pudo conectar. Revisa tu internet.</p>`;
  else if (!remote.list.length) html += `<p class="muted small">Sin resultados de productos.</p>`;
  else html += cacheFoods(remote.list).map(f => resultRow(f)).join("");
  if (s.usda && s.usda.q === q) {
    html += `<div class="listlabel">USDA (genéricos, en inglés)</div>`;
    if (s.usda.loading) html += `<div class="spinner"></div>`;
    else if (s.usda.error) html += `<p class="muted small">USDA no respondió (límite de la clave DEMO). Agrega tu clave en Ajustes.</p>`;
    else html += cacheFoods(s.usda.list).map(f => resultRow(f)).join("") || `<p class="muted small">Sin resultados.</p>`;
  } else html += `<button class="btn secondary" style="margin-top:14px" data-a="searchUSDA">Buscar también en USDA (escribe en inglés)</button>`;
  html += `<p class="muted small center" style="margin-top:18px">¿No está? <b data-a="openCreate" style="color:var(--acc)">Créalo</b> o pídeselo a Claude.</p>`;
  box.innerHTML = html;
  if (!remote) runRemote(q);
}
function runRemote(q) {
  const s = UI.sheets[UI.sheets.length - 1];
  clearTimeout(searchTimer); if (searchCtl) searchCtl.abort();
  if (q.length < 2) { s.remote = { q, list: [] }; return; }
  s.remote = { q, loading: true };
  searchTimer = setTimeout(async () => {
    searchCtl = new AbortController();
    try { const list = await searchOFF(q, searchCtl.signal); if (s.q.trim() === q) { s.remote = { q, list }; renderResults(); } }
    catch (e) { if (e.name !== "AbortError" && s.q.trim() === q) { s.remote = { q, error: true }; renderResults(); } }
  }, 450);
}

/* --- Ficha de alimento --- */
function foodNums(s) {
  const f = s.food, g = gramsOf(f, num(s.qty), s.unit), n = nutr(f, g);
  const cal = n.p * 4 + n.c * 4 + n.f * 9 || 1;
  return `<div class="center muted small" style="margin-top:12px">Para ${esc(r1(num(s.qty)))} ${esc(s.unit)}${s.unit !== unitBase(f) ? ` (${r0(g)} ${unitBase(f)})` : ""}</div>
    <div class="boxes"><div class="box"><b>${fmt(n.kcal)}</b><span>kcal</span></div><div class="box"><b>${r1(n.p)} g</b><span>proteína</span></div><div class="box"><b>${r1(n.c)} g</b><span>carbos</span></div><div class="box"><b>${r1(n.f)} g</b><span>grasas</span></div></div>
    <div class="split"><i style="flex:${n.p * 4};background:var(--p)"></i><i style="flex:${n.c * 4};background:var(--c)"></i><i style="flex:${n.f * 9};background:var(--f)"></i></div>
    <div class="legend"><span><i style="background:var(--p)"></i>Proteína ${r0(n.p * 4 / cal * 100)}%</span><span><i style="background:var(--c)"></i>Carbos ${r0(n.c * 4 / cal * 100)}%</span><span><i style="background:var(--f)"></i>Grasas ${r0(n.f * 9 / cal * 100)}%</span></div>`;
}
function sheetFood(s) {
  const f = s.food, sv = servingsOf(f);
  const fav = !!S.favs[f.id];
  const editing = !!s.entryId;
  return `<div class="sheethead">${UI.sheets.length > 1 ? `<button class="iconbtn" data-a="closeSheet">${IC.back}</button>` : ""}<div class="grow"></div>
      <button class="iconbtn" data-a="toggleFav">${fav ? IC.heartOn : IC.heart}</button>
      ${f.source === "custom" || f.source === "claude" ? `<button class="iconbtn" data-a="editFood">${IC.pencil}</button>` : ""}
      <button class="iconbtn" data-a="closeAll">${IC.x}</button></div>
    <div class="fd-head"><div class="emoji">${esc(f.emoji || "🍽️")}</div><h2>${esc(f.name)}</h2><div class="muted">${esc(f.brand || "")}</div></div>
    <div id="fdnums">${foodNums(s)}</div>
    <div class="qtyrow"><div><label>Cantidad</label><input id="fqty" inputmode="decimal" value="${esc(s.qty)}" data-in="foodQty"></div>
      <div><label>Porción</label><select data-ch="foodUnit">${sv.map(x => `<option value="${esc(x.n)}" ${x.n === s.unit ? "selected" : ""}>${esc(x.n)}${x.g !== 1 ? ` (${r1(x.g)} ${unitBase(f)})` : ""}</option>`).join("")}</select></div></div>
    <div class="field"><label>Comida</label><select data-ch="foodMeal">${enabledMeals().map(m => `<option value="${m}" ${m === s.meal ? "selected" : ""}>${MEALS[m].n}</option>`).join("")}</select></div>
    <button class="btn" id="fdAdd" data-a="${editing ? "saveEntry" : "addFood"}" ${num(s.qty) > 0 ? "" : "disabled"}>${editing ? "Guardar cambios" : `Agregar a ${MEALS[s.meal].n}`}</button>
    ${editing ? `<button class="btn danger" style="margin-top:10px" data-a="deleteEntry">Eliminar</button>` : ""}
    <p class="muted small center" style="margin-top:14px">Por 100 ${unitBase(f)}: ${fmt(f.per100.kcal)} kcal · ${r1(f.per100.p)} P · ${r1(f.per100.c)} C · ${r1(f.per100.f)} G</p>`;
}
function openFood(food, meal, entry) {
  const last = S.recents.find(r => r.food.id === food.id);
  let qty, unit;
  if (entry) { qty = entry.qty; unit = entry.unit; }
  else if (last && servingsOf(food).some(x => x.n === last.unit)) { qty = last.qty; unit = last.unit; }
  else if (food.servings && food.servings.length) { qty = 1; unit = food.servings[0].n; }
  else { qty = 100; unit = unitBase(food); }
  openSheet({ type: "food", food, meal: meal || mealByHour(), qty: String(qty), unit, entryId: entry && entry.id });
}
function refreshFoodNumbers() {
  const s = top(); const box = $("#fdnums"); if (box) box.innerHTML = foodNums(s);
  const b = $("#fdAdd"); if (b) b.disabled = !(num(s.qty) > 0);
}

/* --- Crear / editar alimento --- */
function sheetCreate(s) {
  const d = s.d;
  return `${sheetHead(s.editId ? "Editar alimento" : "Crear alimento")}
    <div class="grid2" style="grid-template-columns:70px 1fr"><div class="field"><label>Emoji</label><input data-in="cf" data-f="emoji" value="${esc(d.emoji)}" maxlength="4" style="text-align:center"></div>
    <div class="field"><label>Nombre</label><input data-in="cf" data-f="name" value="${esc(d.name)}" placeholder="Ej: Completo italiano"></div></div>
    <div class="field"><label>Marca (opcional)</label><input data-in="cf" data-f="brand" value="${esc(d.brand)}" placeholder="Ej: Casero, Líder…"></div>
    <div class="field"><label>Los valores de la etiqueta son…</label><div class="seg"><button class="${d.mode === "100" ? "on" : ""}" data-a="cfMode" data-v="100">Por 100 ${d.liquid ? "ml" : "g"}</button><button class="${d.mode === "porc" ? "on" : ""}" data-a="cfMode" data-v="porc">Por porción</button></div></div>
    <div class="grid2"><div class="field"><label>Nombre porción</label><input data-in="cf" data-f="sname" value="${esc(d.sname)}" placeholder="unidad, rebanada, taza…"></div>
    <div class="field"><label>Gramos por porción</label><input inputmode="decimal" data-in="cf" data-f="sg" value="${esc(d.sg)}" placeholder="g"></div></div>
    <div class="grid4"><div class="field"><label>kcal</label><input inputmode="decimal" data-in="cf" data-f="kcal" value="${esc(d.kcal)}"></div>
      <div class="field"><label>Prot</label><input inputmode="decimal" data-in="cf" data-f="p" value="${esc(d.p)}"></div>
      <div class="field"><label>Carb</label><input inputmode="decimal" data-in="cf" data-f="c" value="${esc(d.c)}"></div>
      <div class="field"><label>Grasa</label><input inputmode="decimal" data-in="cf" data-f="f" value="${esc(d.f)}"></div></div>
    <div class="row" style="margin-bottom:14px" data-a="cfLiquid"><div class="check ${d.liquid ? "on" : ""}">${d.liquid ? IC.check : ""}</div><span>Es líquido (se mide en ml)</span></div>
    ${d.barcode ? `<p class="muted small">Código de barras: ${esc(d.barcode)}</p>` : ""}
    <button class="btn" data-a="saveCreate">Guardar</button>
    ${s.editId ? `<button class="btn danger" style="margin-top:10px" data-a="deleteFood">Eliminar alimento</button>` : ""}
    <p class="muted small center" style="margin-top:12px">Tip: sácale una foto a la etiqueta y mándasela a Claude; te devuelve el bloque para "Pegar de Claude".</p>`;
}
function openCreate(pref = {}, editId) {
  openSheet({ type: "create", editId, d: Object.assign({ emoji: "🍽️", name: "", brand: "", mode: "100", sname: "", sg: "", kcal: "", p: "", c: "", f: "", liquid: false, barcode: "" }, pref) });
}

/* --- Pegar de Claude --- */
function sheetPaste(s) {
  return `${sheetHead("✨ Pegar de Claude")}
    <p class="muted small" style="margin-top:0">Pídele a Claude que calcule tu plato (ingredientes, foto, receta) y pega aquí el bloque <b>EATED {…}</b> que te responde.</p>
    <textarea id="pasteTxt" rows="7" placeholder='EATED {"eated":1,"alimentos":[…]}'>${esc(s.txt || "")}</textarea>
    <div class="grid2" style="margin-top:10px"><button class="btn secondary" data-a="pasteClip">📋 Pegar</button><button class="btn" data-a="pasteImport">Importar</button></div>
    ${s.err ? `<p class="tx-red small">${esc(s.err)}</p>` : ""}
    <button class="btn secondary" style="margin-top:18px" data-a="copyPrompt">Copiar instrucciones para Claude</button>`;
}

/* --- Escáner --- */
let scanCtl = null, scanStream = null, scanBusy = false;
function sheetScan(s) {
  return `${sheetHead("Escanear código de barras")}
    <div class="scanbox"><video id="scanVideo" playsinline muted autoplay></video><div class="scanframe"></div></div>
    <p class="center muted small" id="scanMsg">${esc(s.msg || "Apunta al código de barras del producto")}</p>
    <div class="row"><input id="manualCode" inputmode="numeric" placeholder="o escribe el código" class="grow"><button class="chip on" data-a="manualCode">Buscar</button></div>`;
}
async function startScan() {
  const video = $("#scanVideo"); if (!video || scanStream || scanCtl) return;
  scanBusy = false;
  const onCode = code => { if (scanBusy) return; scanBusy = true; if (navigator.vibrate) navigator.vibrate(60); handleBarcode(code); };
  try {
    if ("BarcodeDetector" in window) {
      const det = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = scanStream; await video.play();
      const loop = async () => {
        if (!scanStream) return;
        try { const r = await det.detect(video); if (r[0]) return onCode(r[0].rawValue); } catch {}
        requestAnimationFrame(loop);
      }; loop();
    } else {
      if (!window.ZXingBrowser) await new Promise((ok, ko) => { const sc = document.createElement("script"); sc.src = "vendor/zxing-browser.min.js"; sc.onload = ok; sc.onerror = ko; document.head.appendChild(sc); });
      const reader = new ZXingBrowser.BrowserMultiFormatReader();
      scanCtl = await reader.decodeFromConstraints({ video: { facingMode: "environment" } }, video, (res) => { if (res) onCode(res.getText()); });
    }
  } catch (e) {
    const m = $("#scanMsg"); if (m) m.textContent = "No pude abrir la cámara. Revisa los permisos o escribe el código abajo.";
  }
}
function stopScan() {
  try { scanCtl && scanCtl.stop(); } catch {} scanCtl = null;
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
}
async function handleBarcode(code) {
  code = String(code).trim();
  const m = $("#scanMsg"); if (m) m.textContent = `Buscando ${code}…`;
  const meal = (UI.sheets.find(x => x.type === "search") || {}).meal || mealByHour();
  const mine = S.custom.find(f => f.barcode === code);
  stopScan();
  if (mine) { UI.sheets.pop(); openFood(mine, meal); return; }
  try {
    const f = await lookupBarcode(code);
    UI.sheets.pop();
    if (f) { FOOD_CACHE.set(f.id, f); openFood(f, meal); }
    else { toast("No está en la base. Créalo 👇"); openCreate({ barcode: code }); }
  } catch {
    UI.sheets.pop(); toast("Sin conexión. Puedes crearlo a mano."); openCreate({ barcode: code });
  }
}

/* --- Menú de comida, inputs, metas --- */
function sheetMealMenu(s) {
  return `${sheetHead(MEALS[s.meal].n)}
    <button class="btn secondary" data-a="saveMealAs" data-m="${s.meal}">🍱 Guardar como comida guardada</button>
    <button class="btn secondary" style="margin-top:10px" data-a="copyMealTomorrow" data-m="${s.meal}">📋 Copiar a mañana</button>
    <button class="btn danger" style="margin-top:10px" data-a="clearMeal" data-m="${s.meal}">Vaciar ${MEALS[s.meal].n.toLowerCase()}</button>`;
}
function sheetInput(s) {
  return `${sheetHead(s.title)}${s.hint ? `<p class="muted small" style="margin-top:0">${s.hint}</p>` : ""}
    <input id="sheetInput" ${s.numeric ? 'inputmode="decimal"' : ""} value="${esc(s.value ?? "")}" placeholder="${esc(s.placeholder || "")}" enterkeyhint="done">
    <button class="btn" style="margin-top:14px" data-a="inputOk">${s.ok || "Guardar"}</button>
    ${s.del ? `<button class="btn danger" style="margin-top:10px" data-a="inputDel">${s.del}</button>` : ""}`;
}
function askInput(opts) { openSheet(Object.assign({ type: "input" }, opts)); }
function sheetTargets(s) {
  const T = s.t;
  const kc = T.p * 4 + T.c * 4 + T.f * 9;
  return `${sheetHead("Meta diaria")}
    <div class="grid4"><div class="field"><label>kcal</label><input inputmode="numeric" data-in="tgt" data-k="kcal" value="${T.kcal}"></div>
    <div class="field"><label>Prot</label><input inputmode="numeric" data-in="tgt" data-k="p" value="${T.p}"></div>
    <div class="field"><label>Carb</label><input inputmode="numeric" data-in="tgt" data-k="c" value="${T.c}"></div>
    <div class="field"><label>Grasa</label><input inputmode="numeric" data-in="tgt" data-k="f" value="${T.f}"></div></div>
    <p class="muted small" id="tgtInfo">Los macros suman ${fmt(kc)} kcal.</p>
    <button class="btn secondary" data-a="tgtAuto">Repartir macros automáticamente</button>
    <button class="btn" style="margin-top:10px" data-a="tgtSave">Guardar</button>`;
}

/* ================= Acciones ================= */
const top = () => UI.sheets[UI.sheets.length - 1];
const A = {
  tab(el) {
    const k = el.dataset.k;
    if (k === "buscar") { openSheet({ type: "search", meal: mealByHour(), q: "", tab: "todo", focus: true }); return; }
    UI.tab = k; closeSheet(true); window.scrollTo(0, 0);
  },
  pickDay(el) { UI.date = el.dataset.d; render(); },
  weekNav(el) { UI.date = addDays(UI.date, +el.dataset.n); render(); },
  goToday() { UI.date = todayStr(); render(); },
  calNav(el) { const [y, m] = UI.calMonth.split("-").map(Number); const d = new Date(y, m - 1 + +el.dataset.n, 1); UI.calMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; render(); },
  calDay(el) { UI.date = el.dataset.d; UI.tab = "hoy"; render(); window.scrollTo(0, 0); },
  endDay() {
    const day = getDay(UI.date, true); day.closed = true; day.target = { ...S.targets }; save(); render();
    const st = dayStatus(UI.date); toast(`${{ green: "🟢", yellow: "🟡", blue: "🔵", red: "🔴" }[st]} ${STATUS_TXT[st]}`);
  },
  reopenDay() { const day = getDay(UI.date, true); day.closed = false; delete day.target; save(); render(); },
  toggleCreatine() { const day = getDay(UI.date, true); day.creatine = !day.creatine; save(); render(); },
  toggleGroup(el) {
    const day = getDay(UI.date, true), g = el.dataset.g; day.workout = day.workout || [];
    day.workout = day.workout.includes(g) ? day.workout.filter(x => x !== g) : [...day.workout, g];
    save(); render();
  },
  editWorkMin() {
    const day = getDay(UI.date, true);
    askInput({ title: "Duración del entreno", hint: "Minutos (por defecto se usa el de tu perfil)", numeric: true, value: day.workMin || S.profile.workMin || 90, onOk: v => { day.workMin = num(v) || undefined; save(); } });
  },
  logWeight() {
    const d = UI.tab === "hoy" ? UI.date : todayStr();
    askInput({ title: `Peso · ${d === todayStr() ? "hoy" : pd(d).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`, hint: "Idealmente en la mañana, en ayunas. No importa si te saltas días: la app usa la tendencia.", numeric: true, value: S.weights[d] || "", placeholder: "kg",
      del: S.weights[d] ? "Borrar registro" : null,
      onOk: v => { const w = num(v); if (w > 30 && w < 300) { S.weights[d] = r1(w); save(); toast("Peso guardado"); } },
      onDel: () => { delete S.weights[d]; save(); } });
  },
  openSearch(el) { openSheet({ type: "search", meal: el.dataset.m, q: "", tab: "todo", focus: false }); },
  searchTab(el) { const s = top(); s.tab = el.dataset.k; renderSheet(); },
  searchUSDA() {
    const s = top(), q = s.q.trim(); if (!q) return;
    s.usda = { q, loading: true }; renderResults();
    searchUSDA(q).then(list => { s.usda = { q, list }; renderResults(); }).catch(() => { s.usda = { q, error: true }; renderResults(); });
  },
  pickFood(el) {
    const f = FOOD_CACHE.get(el.dataset.fid) || BASE_FOODS.find(x => x.id === el.dataset.fid) || S.custom.find(x => x.id === el.dataset.fid);
    if (f) openFood(f, (top() || {}).meal);
  },
  addFood() {
    const s = top(); addEntry(UI.date, s.meal, s.food, num(s.qty), s.unit);
    UI.tab = "hoy"; closeSheet(true); toast(`Agregado a ${MEALS[s.meal].n}`);
  },
  editEntry(el) {
    const e = getDay(UI.date).entries.find(x => x.id === el.dataset.id); if (!e) return;
    const f = S.custom.find(x => x.id === e.food.id) || e.food;
    openFood(f, e.meal, e);
  },
  saveEntry() {
    const s = top(), e = getDay(UI.date).entries.find(x => x.id === s.entryId);
    if (e) { e.qty = num(s.qty); e.unit = s.unit; e.meal = s.meal; e.food = snap(s.food); e.grams = gramsOf(s.food, e.qty, e.unit); save(); }
    closeSheet(true);
  },
  deleteEntry() { const s = top(), day = getDay(UI.date, true); day.entries = day.entries.filter(x => x.id !== s.entryId); save(); closeSheet(true); toast("Eliminado"); },
  toggleFav() { const f = top().food; if (S.favs[f.id]) delete S.favs[f.id]; else S.favs[f.id] = snap(f); save(); renderSheet(); },
  editFood() {
    const f = S.custom.find(x => x.id === top().food.id) || top().food; const sv = (f.servings || [])[0] || {};
    openCreate({ emoji: f.emoji, name: f.name, brand: f.brand, mode: "100", sname: sv.n || "", sg: sv.g || "", kcal: f.per100.kcal, p: f.per100.p, c: f.per100.c, f: f.per100.f, liquid: f.liquid, barcode: f.barcode || "", extra: (f.servings || []).slice(1) }, f.id);
  },
  copyPrev(el) {
    const m = el.dataset.m, prev = getDay(addDays(UI.date, -1)).entries.filter(e => e.meal === m), day = getDay(UI.date, true);
    prev.forEach(e => day.entries.push({ ...e, id: uid() })); save(); render(); toast("Copiado");
  },
  dismissCopy(el) { UI.dismissCopy[UI.date + el.dataset.m] = 1; render(); },
  mealMenu(el) { openSheet({ type: "mealMenu", meal: el.dataset.m }); },
  saveMealAs(el) {
    const m = el.dataset.m, items = getDay(UI.date).entries.filter(e => e.meal === m);
    askInput({ title: "Nombre de la comida guardada", placeholder: "Ej: Desayuno típico", value: `${MEALS[m].n} típico`, onOk: v => {
      S.savedMeals.unshift({ id: uid(), name: v.trim() || MEALS[m].n, items: items.map(e => ({ food: e.food, qty: e.qty, unit: e.unit, grams: e.grams })) });
      save(); toast("Comida guardada 🍱"); UI.sheets = []; } });
  },
  copyMealTomorrow(el) {
    const m = el.dataset.m, items = getDay(UI.date).entries.filter(e => e.meal === m), t = getDay(addDays(UI.date, 1), true);
    items.forEach(e => t.entries.push({ ...e, id: uid() })); save(); closeSheet(true); toast("Copiado a mañana");
  },
  clearMeal(el) { const day = getDay(UI.date, true); day.entries = day.entries.filter(e => e.meal !== el.dataset.m); save(); closeSheet(true); },
  addSaved(el, ev) {
    if (ev.target.closest('[data-a="delSaved"]')) return;
    const sm = S.savedMeals.find(x => x.id === el.dataset.id), s = top(), day = getDay(UI.date, true);
    sm.items.forEach(i => day.entries.push({ id: uid(), meal: s.meal, food: i.food, qty: i.qty, unit: i.unit, grams: i.grams }));
    save(); UI.tab = "hoy"; closeSheet(true); toast(`${sm.name} agregado`);
  },
  delSaved(el, ev) { ev.stopPropagation(); S.savedMeals = S.savedMeals.filter(x => x.id !== el.dataset.id); save(); renderResults(); },
  openScan() { openSheet({ type: "scan", full: true }); },
  manualCode() { const v = ($("#manualCode").value || "").replace(/\D/g, ""); if (v.length >= 6) { scanBusy = true; handleBarcode(v); } },
  openPaste() { openSheet({ type: "paste" }); },
  async pasteClip() {
    try { const t = await navigator.clipboard.readText(); top().txt = t; top().err = ""; renderSheet(); }
    catch { toast("Mantén presionado el cuadro y elige Pegar"); }
  },
  pasteImport() {
    const s = top(); s.txt = $("#pasteTxt").value;
    let items;
    try { items = parseClaude(s.txt); } catch (e) { s.err = "No pude leer el bloque: " + e.message; renderSheet(); return; }
    let logged = 0;
    items.forEach(({ food, reg }) => {
      S.custom.unshift(food);
      if (reg) {
        const meal = MEALS[reg.comida] ? reg.comida : mealByHour();
        const unit = reg.porcion && servingsOf(food).some(x => x.n === reg.porcion) ? reg.porcion : (reg.gramos ? unitBase(food) : (food.servings[0] || { n: unitBase(food) }).n);
        const qty = reg.gramos ? num(reg.gramos) : num(reg.cantidad) || 1;
        addEntry(reg.fecha && /^\d{4}-\d\d-\d\d$/.test(reg.fecha) ? reg.fecha : UI.date, meal, food, qty, unit); logged++;
      }
    });
    save();
    if (items.length === 1 && !logged) { UI.sheets.pop(); openFood(items[0].food, (UI.sheets.find(x => x.type === "search") || {}).meal); toast("Guardado en Míos"); return; }
    UI.tab = "hoy"; closeSheet(true);
    toast(logged ? `${logged} registrado${logged > 1 ? "s" : ""} ✨` : `${items.length} alimentos guardados`);
  },
  async copyPrompt() {
    try { await navigator.clipboard.writeText(CLAUDE_PROMPT); toast("Instrucciones copiadas"); }
    catch { askInput({ title: "Copia este texto", value: CLAUDE_PROMPT, ok: "Listo" }); }
  },
  openCreate() { const q = (top() && top().q) || ""; openCreate({ name: q }); },
  cfMode(el) { top().d.mode = el.dataset.v; renderSheet(); },
  cfLiquid() { top().d.liquid = !top().d.liquid; renderSheet(); },
  saveCreate() {
    const s = top(), d = s.d;
    if (!String(d.name).trim()) return toast("Ponle un nombre");
    const sg = num(d.sg);
    let k = 1; if (d.mode === "porc") { if (!sg) return toast("Indica los gramos de la porción"); k = 100 / sg; }
    const per100 = { kcal: r1(num(d.kcal) * k), p: r1(num(d.p) * k), c: r1(num(d.c) * k), f: r1(num(d.f) * k) };
    if (!per100.kcal) per100.kcal = r1(per100.p * 4 + per100.c * 4 + per100.f * 9);
    const servings = [...(sg ? [{ n: String(d.sname || "porción").trim() || "porción", g: sg }] : []), ...(d.extra || [])];
    const food = { id: s.editId || "my_" + uid(), name: String(d.name).trim(), brand: String(d.brand || "").trim() || "Propio", emoji: d.emoji || "🍽️", per100, servings, liquid: !!d.liquid, barcode: d.barcode || "", source: "custom" };
    if (s.editId) {
      S.custom = S.custom.map(f => f.id === s.editId ? food : f);
      if (!S.custom.some(f => f.id === food.id)) S.custom.unshift(food);
      if (S.favs[food.id]) S.favs[food.id] = snap(food);
    } else S.custom.unshift(food);
    save(); FOOD_CACHE.set(food.id, food);
    UI.sheets.pop();
    if (s.editId) { const f = top(); if (f && f.type === "food") { f.food = food; if (!servingsOf(food).some(x => x.n === f.unit)) { f.unit = unitBase(food); f.qty = "100"; } } renderSheet(); toast("Actualizado"); }
    else { openFood(food, (UI.sheets.find(x => x.type === "search") || {}).meal); toast("Guardado en Míos"); }
  },
  deleteFood() { const s = top(); S.custom = S.custom.filter(f => f.id !== s.editId); delete S.favs[s.editId]; save(); closeSheet(true); toast("Eliminado"); },
  inputOk() { const s = top(), v = $("#sheetInput").value; UI.sheets.pop(); s.onOk && s.onOk(v); renderSheet(); render(); },
  inputDel() { const s = top(); UI.sheets.pop(); s.onDel && s.onDel(); renderSheet(); render(); },
  closeSheet() { closeSheet(false); },
  closeAll() { closeSheet(true); },
  applyAdjust() { applyAdjust(); },
  ignoreAdjust() { S.adapt.pending = null; save(); render(); },
  forceAdjust() {
    const a = computeAdjust(true);
    if (!a || Math.abs(a.kcal - S.targets.kcal) < 30) { toast("Tu meta sigue bien ajustada 👌"); return; }
    S.adapt.pending = a; S.adapt.last = todayStr(); save(); UI.tab = "progreso"; render(); window.scrollTo(0, 0);
  },
  // Onboarding
  obSet(el) {
    const ob = obData(), f = el.dataset.f; let v = el.dataset.v;
    if (el.dataset.num) v = +v; if (el.dataset.bool) v = v === "1";
    if (el.dataset.multi) { const a = ob.d[f] || []; ob.d[f] = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; }
    else ob.d[f] = v;
    if (f === "goal" || f === "diet") ob.t = null;
    render();
  },
  obNext() { const ob = obData(); ob.step++; ob.t = null; if (OB_STEPS[ob.step] === "meta" && ob.d.goal === "maintain") {} render(); window.scrollTo(0, 0); },
  obBack() { const ob = obData(); ob.step = Math.max(0, ob.step - 1); render(); },
  obCancel() { UI.ob = null; render(); },
  obFinish() {
    const ob = obData(), p = normProfile(ob.d), { plan } = buildPlan(p);
    const T = ob.t;
    const was = S.profile;
    S.profile = p; S.plan = plan; S.targets = { kcal: r0(num(T.kcal)), p: r0(num(T.p)), c: r0(num(T.c)), f: r0(num(T.f)) };
    if (!was) { S.weights[todayStr()] = p.weight; S.adapt.last = todayStr(); }
    else if (!S.weights[todayStr()] && was.weight !== p.weight) S.weights[todayStr()] = p.weight;
    UI.ob = null; save(); UI.tab = was ? "ajustes" : "hoy"; render(); window.scrollTo(0, 0);
    toast(was ? "Perfil actualizado" : `¡Bienvenido${p.name ? ", " + p.name : ""}! 💪`);
  },
  // Ajustes
  editTargets() { openSheet({ type: "targets", t: { ...S.targets } }); },
  tgtAuto() { const s = top(); s.t = { kcal: num(s.t.kcal), ...macrosFor(num(s.t.kcal), S.profile, currentWeight()) }; renderSheet(); },
  tgtSave() { const s = top(); S.targets = { kcal: r0(num(s.t.kcal)), p: r0(num(s.t.p)), c: r0(num(s.t.c)), f: r0(num(s.t.f)) }; save(); closeSheet(true); toast("Meta guardada"); },
  editSteps() {
    askInput({ title: "Pasos diarios promedio", numeric: true, value: S.profile.steps, onOk: v => {
      S.profile.steps = num(v); const { plan, targets } = buildPlan(S.profile, currentWeight()); S.plan = plan; S.targets = targets; save(); toast(`Meta: ${fmt(targets.kcal)} kcal`); } });
  },
  toggleMeal(el) {
    const m = el.dataset.m, p = S.profile;
    p.meals = p.meals.includes(m) ? p.meals.filter(x => x !== m) : [...p.meals, m];
    if (!p.meals.length) p.meals = [m];
    save(); render();
  },
  accent(el) { S.settings.accent = el.dataset.v; save(); render(); },
  async exportData() {
    const json = JSON.stringify(S, null, 1), name = `eated-respaldo-${todayStr()}.json`;
    const file = new File([json], name, { type: "application/json" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Respaldo EATED" });
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
      S.settings.lastExport = todayStr(); save(); render(); toast("Respaldo exportado");
    } catch (e) { if (e.name !== "AbortError") toast("No se pudo exportar"); }
  },
  importData() { $("#importFile").click(); },
  resetAll() {
    askInput({ title: "¿Borrar todo?", hint: "Escribe BORRAR para confirmar. Exporta un respaldo antes si lo quieres conservar.", placeholder: "BORRAR", ok: "Borrar todo", onOk: v => { if (v.trim().toUpperCase() === "BORRAR") { localStorage.removeItem(KEY); location.reload(); } } });
  },
};
// editProfile real: abre onboarding sobre el perfil actual
A.editProfile = () => { UI.ob = { step: 0, d: { ...S.profile, weight: r1(currentWeight()) } }; render(); window.scrollTo(0, 0); };

const IN = {
  obT(el) { const ob = obData(); ob.t = { ...ob.t, [el.dataset.k]: el.value }; },
  searchQ(el) { const s = top(); s.q = el.value; s.remote = null; s.usda = null; if (s.tab === "recientes") s.tab = "todo"; renderResults(); },
  foodQty(el) { top().qty = el.value; refreshFoodNumbers(); },
  cf(el) { top().d[el.dataset.f] = el.value; },
  tgt(el) {
    const s = top(); s.t[el.dataset.k] = num(el.value);
    const kc = s.t.p * 4 + s.t.c * 4 + s.t.f * 9; $("#tgtInfo").textContent = `Los macros suman ${fmt(kc)} kcal${Math.abs(kc - s.t.kcal) > 60 ? " (distinto a la meta de kcal)" : ""}.`;
  },
};
const CH = {
  searchMeal(el) { top().meal = el.value; },
  foodUnit(el) { const s = top(); s.unit = el.value; s.qty = el.value === unitBase(s.food) ? "100" : "1"; renderSheet(); },
  foodMeal(el) { top().meal = el.value; renderSheet(); },
  usdaKey(el) { S.settings.usdaKey = el.value.trim(); save(); toast("Clave guardada"); },
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]"); if (!el) return;
  const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener("input", e => { const el = e.target.closest("[data-in]"); if (el && IN[el.dataset.in]) IN[el.dataset.in](el, e); });
document.addEventListener("change", e => {
  const el = e.target.closest("[data-ch]"); if (el && CH[el.dataset.ch]) return CH[el.dataset.ch](el, e);
  if (e.target.id === "importFile" && e.target.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data.profile || !data.days) throw 0;
        S = Object.assign(DEFAULT(), data); save(); render(); toast("Respaldo importado ✓");
      } catch { toast("Archivo inválido"); }
    };
    r.readAsText(e.target.files[0]);
  }
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  if (e.target.id === "sheetInput") A.inputOk();
  if (e.target.id === "manualCode") A.manualCode();
  if (e.target.id === "q") e.target.blur();
});
// Onboarding: no re-renderizar en cada tecla (pierde foco en iOS) → actualizar solo el botón
IN.obField = el => {
  obData().d[el.dataset.f] = el.value;
  const ob = obData(), step = OB_STEPS[ob.step], d = ob.d;
  let ok = true;
  if (step === "hola") ok = !!String(d.name).trim();
  if (step === "sobre") ok = num(d.age) > 10 && num(d.height) > 100 && num(d.weight) > 30;
  if (step === "meta" && d.goal !== "maintain") ok = num(d.targetWeight) > 30 && (d.goal === "lose" ? num(d.targetWeight) < num(d.weight) : num(d.targetWeight) > num(d.weight));
  const b = $(".ob-foot .btn"); if (b) b.disabled = !ok;
};

let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }

/* ================= Inicio ================= */
checkAdaptive();
render();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && S.profile) { const t = todayStr(); if (UI._last !== t) { UI._last = t; UI.date = t; checkAdaptive(); render(); } }
});
UI._last = todayStr();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
window.__EATED = { S: () => S, parseClaude, computeAdjust, buildPlan };
})();
