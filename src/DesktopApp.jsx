import { useState, useEffect, useRef, useCallback } from 'react';
import { GRAMMAR_TOPICS, GRAMMAR_CATS } from './grammarData';
import ChatWidget from './ChatWidget';

const PK = 'e5k_p13', CS_PK = 'e5k_cs13', QK = 'e5k_q13_', CS_QK = 'e5k_csq13_', PERF_PK = 'e5k_perf', SK = 'e5k_s13', UK = 'e5k_u13';
const toStr = () => new Date().toISOString().slice(0, 10);
const DEF = { day: 1, streak: 0, lastDate: null, totalCorrect: 0, totalAnswered: 0, xp: 0, bestStreak: 0 };
const CFG_DEF = { sound: true, dark: false };
const LVLS = [{ n: "Beginner", min: 0, c: "#9CA3AF", i: "🌱" }, { n: "Elementary", min: 500, c: "#22C55E", i: "🌿" }, { n: "Pre-Int", min: 1500, c: "#3B82F6", i: "📘" }, { n: "Intermediate", min: 3500, c: "#8B5CF6", i: "⭐" }, { n: "Upper-Int", min: 7000, c: "#F59E0B", i: "🌟" }, { n: "Advanced", min: 12000, c: "#EF4444", i: "🔥" }, { n: "Expert", min: 20000, c: "#EC4899", i: "💎" }];
const LC = { Easy: { fill: "#22C55E", bg: "rgba(34,197,94,.08)", br: "rgba(34,197,94,.25)", tx: "#16A34A", glow: "rgba(34,197,94,.15)" }, Medium: { fill: "#3B82F6", bg: "rgba(59,130,246,.08)", br: "rgba(59,130,246,.25)", tx: "#2563EB", glow: "rgba(59,130,246,.15)" }, Hard: { fill: "#EF4444", bg: "rgba(239,68,68,.08)", br: "rgba(239,68,68,.25)", tx: "#DC2626", glow: "rgba(239,68,68,.15)" } };
const TH = {
  light: { root: "#f0f2f7", s1: "#e8ecf4", s2: "#ffffff", bd: "rgba(0,0,0,.06)", bdS: "rgba(0,0,0,.1)", txt: "#0f172a", m: "#64748b", s: "#475569", accent: "#3b82f6", glass: "rgba(255,255,255,.72)", glassBd: "rgba(255,255,255,.5)" },
  dark: { root: "#0a0e1a", s1: "#111827", s2: "#1a2035", bd: "rgba(255,255,255,.06)", bdS: "rgba(255,255,255,.12)", txt: "#e2e8f0", m: "#94a3b8", s: "#cbd5e1", accent: "#60a5fa", glass: "rgba(17,24,39,.72)", glassBd: "rgba(255,255,255,.08)" }
};
const getLv = (xp) => { let l = LVLS[0]; for (const x of LVLS) if ((xp || 0) >= x.min) l = x; return l; };
const getNext = (xp) => { for (const x of LVLS) if ((xp || 0) < x.min) return x; return null; };
const avC = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); const c = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#22C55E', '#06B6D4']; return c[Math.abs(h) % c.length]; };

async function lP(k = PK) { try { const v = localStorage.getItem(k); return v ? { ...DEF, ...JSON.parse(v) } : { ...DEF }; } catch { return { ...DEF }; } }
async function sP(p, k = PK) { try { localStorage.setItem(k, JSON.stringify(p)); } catch {} }
async function lCfg() { try { const v = localStorage.getItem(SK); return v ? { ...CFG_DEF, ...JSON.parse(v) } : { ...CFG_DEF }; } catch { return { ...CFG_DEF }; } }
async function sCfg(c) { try { localStorage.setItem(SK, JSON.stringify(c)); } catch {} }
async function lU() { try { const v = localStorage.getItem(UK); return v ? JSON.parse(v) : null; } catch { return null; } }
async function sU(u) { try { localStorage.setItem(UK, JSON.stringify(u)); } catch {} }

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'الرئيسية' },
  { id: 'quiz', icon: '📝', label: 'اختبار الإنجليزي' },
  { id: 'grammar', icon: '📖', label: 'قواعد اللغة' },
  { id: 'cs-quiz', icon: '💻', label: 'اختبار البرمجة' },
  { id: 'progress', icon: '📊', label: 'التقدم' },
  { id: 'leaderboard', icon: '🏆', label: 'لوحة الصدارة' },
  { id: 'profile', icon: '👤', label: 'الملف الشخصي' },
];

const DIFF_ORDER = ['Easy', 'Medium', 'Hard'];
const DIFF_LABELS = { Easy: 'سهل', Medium: 'متوسط', Hard: 'صعب' };
const DIFF_EMOJI = { Easy: '🌱', Medium: '⚡', Hard: '🔥' };
const CS_LC = { Easy: { fill: '#06B6D4', bg: 'rgba(6,182,212,.08)', br: 'rgba(6,182,212,.25)', tx: '#0891B2', glow: 'rgba(6,182,212,.15)' }, Medium: { fill: '#8B5CF6', bg: 'rgba(139,92,246,.08)', br: 'rgba(139,92,246,.25)', tx: '#7C3AED', glow: 'rgba(139,92,246,.15)' }, Hard: { fill: '#F97316', bg: 'rgba(249,115,22,.08)', br: 'rgba(249,115,22,.25)', tx: '#EA580C', glow: 'rgba(249,115,22,.15)' } };
const XP = { mcq: 10, wrt0: 15, wrt1: 8, wrt2: 4, s5: 5, s10: 10, s20: 20 };
const CS_CATS = { Easy: ["Linux Basics", "Git", "Error Messages", "Developer Phrases", "Code Basics"], Medium: ["C/C++", "Python", "Debugging", "GitHub Workflow", "Professional"], Hard: ["AI/ML", "Algorithms", "Systems", "Architecture", "Security"] };
const ystStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };

const FB_EASY = [
{ ar: "إزيك؟", en: "How are you?", pron: "هاو أر يو؟", opts: ["How are you?", "Where are you?", "Who are you?", "What are you?"], c: 0, cat: "Greetings" },
{ ar: "أنا بخير، شكراً", en: "I'm fine, thank you.", pron: "آيم فاين، ثانك يو", opts: ["I'm fine, thank you.", "I'm bad, thank you.", "I'm fine, please.", "I'm good, sorry."], c: 0, cat: "Greetings" },
{ ar: "إسمي أحمد", en: "My name is Ahmed.", pron: "ماي نيم إز أحمد", opts: ["My name is Ahmed.", "My name is Ali.", "I am Ahmed name.", "Ahmed is my name."], c: 0, cat: "Self Introduction" },
{ ar: "عندك كام سنة؟", en: "How old are you?", pron: "هاو أولد أر يو؟", opts: ["How old are you?", "How are you old?", "Where are you old?", "What old are you?"], c: 0, cat: "Self Introduction" },
{ ar: "أنا عندي 25 سنة", en: "I am 25 years old.", pron: "آيم تونتي فايف ييرز أولد", opts: ["I am 25 years old.", "I have 25 years old.", "I am 25 year old.", "25 years old I am."], c: 0, cat: "Self Introduction" },
{ ar: "شكراً ليك", en: "Thank you.", pron: "ثانك يو", opts: ["Thank you.", "Think you.", "Tank you.", "Three you."], c: 0, cat: "Greetings" },
{ ar: "عفواً", en: "You're welcome.", pron: "يور ويلكوم", opts: ["You're welcome.", "You are welcome.", "Your welcome.", "Yore welcome."], c: 0, cat: "Greetings" },
{ ar: "مع السلامة", en: "Goodbye.", pron: "جودباي", opts: ["Goodbye.", "Good buy.", "Go bye.", "Good day."], c: 0, cat: "Greetings" },
{ ar: "تصبح على خير", en: "Good night.", pron: "جود نايت", opts: ["Good night.", "Good knight.", "Good nit.", "Good night."], c: 0, cat: "Greetings" },
{ ar: "صباح الخير", en: "Good morning.", pron: "جود مورنينج", opts: ["Good morning.", "Good mourning.", "Good morning.", "Good moning."], c: 0, cat: "Greetings" },
{ ar: "العربية بتاعتي حلوة", en: "My car is nice.", pron: "ماي كار إز نايس", opts: ["My car is nice.", "My cat is nice.", "My cup is nice.", "My can is nice."], c: 0, cat: "Family" },
{ ar: "أمي جميلة", en: "My mother is beautiful.", pron: "ماي ماذر إز بيوتيفل", opts: ["My mother is beautiful.", "My father is beautiful.", "My mother is big.", "My mother is busy."], c: 0, cat: "Family" },
{ ar: "أنا بحب أهلي", en: "I love my family.", pron: "آي لاف ماي فاميلي", opts: ["I love my family.", "I love my friend.", "I live my family.", "I left my family."], c: 0, cat: "Family" },
{ ar: "أنا جعان", en: "I'm hungry.", pron: "آيم هانجري", opts: ["I'm hungry.", "I'm happy.", "I'm hurry.", "I'm heavy."], c: 0, cat: "Food" },
{ ar: "أنا عطشان", en: "I'm thirsty.", pron: "آيم ثيرستي", opts: ["I'm thirsty.", "I'm thirty.", "I'm thirsty.", "I'm thirdy."], c: 0, cat: "Food" },
{ ar: "عايز مية", en: "I want water.", pron: "آي وانت ووتر", opts: ["I want water.", "I want waiter.", "I went water.", "I want winter."], c: 0, cat: "Food" },
{ ar: "القهوة دي حلوة", en: "This coffee is good.", pron: "ذيس كوفي إز جود", opts: ["This coffee is good.", "This coffee is god.", "This copy is good.", "This coffee is go."], c: 0, cat: "Food" },
{ ar: "أنا رايح الشغل", en: "I'm going to work.", pron: "آيم جوينج تو ورك", opts: ["I'm going to work.", "I'm going to walk.", "I'm going to wake.", "I'm going to world."], c: 0, cat: "Daily Activities" },
{ ar: "الجو حلو النهارده", en: "The weather is nice today.", pron: "ذه ويذر إز نايس تودي", opts: ["The weather is nice today.", "The weather is nice to day.", "The weather is nine today.", "The weather is new today."], c: 0, cat: "Daily Activities" },
{ ar: "أنا بحب الإنجليزي", en: "I love English.", pron: "آي لاف إنقليزي", opts: ["I love English.", "I live English.", "I left English.", "I like English."], c: 0, cat: "Daily Activities" },
{ ar: "القلم بتاعي فين؟", en: "Where is my pen?", pron: "وير إز ماي بين؟", opts: ["Where is my pen?", "When is my pen?", "What is my pen?", "Who is my pen?"], c: 0, cat: "Daily Activities" },
{ ar: "أنا بدرس كل يوم", en: "I study every day.", pron: "آي ستادي إيفري داي", opts: ["I study every day.", "I study every day.", "I start every day.", "I stay every day."], c: 0, cat: "Daily Activities" },
{ ar: "إنت محتاج كام؟", en: "How much do you need?", pron: "هاو ماش دو يو نيد؟", opts: ["How much do you need?", "How much do you eat?", "How much do you nest?", "How much do you near?"], c: 0, cat: "Shopping" },
{ ar: "السعر كام؟", en: "How much is it?", pron: "هاو ماش إز إيت؟", opts: ["How much is it?", "How many is it?", "How much are it?", "How much is at?"], c: 0, cat: "Shopping" },
{ ar: "أنا عايز أشتري تليفون", en: "I want to buy a phone.", pron: "آي وانت تو باي فون", opts: ["I want to buy a phone.", "I want to buy a home.", "I want to by a phone.", "I want to buy a fun."], c: 0, cat: "Shopping" },
{ ar: "فيه خصم؟", en: "Is there a discount?", pron: "из ذير ديسكاونت؟", opts: ["Is there a discount?", "Is there a discount?", "Is there a distant?", "Is there a disk?"], c: 0, cat: "Shopping" },
{ ar: "أنا تعبان", en: "I feel sick.", pron: "آي فيل سك", opts: ["I feel sick.", "I feel sick.", "I fell sick.", "I feel six."], c: 0, cat: "Health" },
{ ar: "أنا رايح للدكتور", en: "I'm going to the doctor.", pron: "آيم جوينج تو ذه دوكتور", opts: ["I'm going to the doctor.", "I'm going to the daughter.", "I'm going to the sector.", "I'm going to the tractor."], c: 0, cat: "Health" },
{ ar: "محتاج دوا", en: "I need medicine.", pron: "آي نيد ميديسن", opts: ["I need medicine.", "I need media.", "I need medium.", "I need medal."], c: 0, cat: "Health" },
{ ar: "أنا مش فاهم", en: "I don't understand.", pron: "آي دونت أندرستاند", opts: ["I don't understand.", "I don't under stand.", "I don't understand.", "I don't under study."], c: 0, cat: "Opinions" },
{ ar: "أنا موافق", en: "I agree.", pron: "آي أجري", opts: ["I agree.", "I green.", "I greet.", "I great."], c: 0, cat: "Opinions" },
{ ar: "مش عايز", en: "I don't want it.", pron: "آي دونت وانت إيت", opts: ["I don't want it.", "I don't want eat.", "I don't want is.", "I don't want at."], c: 0, cat: "Opinions" },
{ ar: "أنا بحب الأكل ده", en: "I like this food.", pron: "آي لايك ذيس فود", opts: ["I like this food.", "I like this foot.", "I like this good.", "I like this wood."], c: 0, cat: "Opinions" },
{ ar: "الجو حر النهارده", en: "It's hot today.", pron: "إتس هوت تودي", opts: ["It's hot today.", "It's hat today.", "It's hot to day.", "It's hit today."], c: 0, cat: "Weather" },
{ ar: "الجو برد", en: "It's cold.", pron: "إتس كولد", opts: ["It's cold.", "It's gold.", "It's cool.", "It's could."], c: 0, cat: "Weather" },
{ ar: "مطر كتير", en: "It rains a lot.", pron: "إتس رينز لوت", opts: ["It rains a lot.", "It rains a lot.", "It ran a lot.", "It raise a lot."], c: 0, cat: "Weather" },
{ ar: "الشمس طالعة", en: "The sun is rising.", pron: "ذه سان إز رايزينج", opts: ["The sun is rising.", "The sun is rising.", "The son is rising.", "The sun is running."], c: 0, cat: "Weather" },
{ ar: "أنا عندي كلب", en: "I have a dog.", pron: "آي هاف دوج", opts: ["I have a dog.", "I have a cat.", "I have a big.", "I have a dug."], c: 0, cat: "Family" },
{ ar: "أخويا أكبر مني", en: "My brother is older than me.", pron: "ماي بذر إز أولدёр ذان مي", opts: ["My brother is older than me.", "My brother is over than me.", "My brother is order than me.", "My brother is older then me."], c: 0, cat: "Family" },
{ ar: "أنا ماشي", en: "I'm walking.", pron: "آيم ووكينج", opts: ["I'm walking.", "I'm working.", "I'm waking.", "I'm wanting."], c: 0, cat: "Daily Activities" },
{ ar: "الباب مفتوح", en: "The door is open.", pron: "ذه دور إز أوپن", opts: ["The door is open.", "The door is open.", "The bore is open.", "The door is up."], c: 0, cat: "Daily Activities" },
{ ar: "أنا بحب القراءة", en: "I love reading.", pron: "آي لاف ريدينج", opts: ["I love reading.", "I love riding.", "I love ready.", "I love reding."], c: 0, cat: "Daily Activities" },
{ ar: "ممكن تساعدني؟", en: "Can you help me?", pron: "كان يو هيلب مي؟", opts: ["Can you help me?", "Can you held me?", "Can you helm me?", "Can you hell me?"], c: 0, cat: "Greetings" },
{ ar: "فين الحمام؟", en: "Where is the bathroom?", pron: "وير إز ذه باذروم؟", opts: ["Where is the bathroom?", "Where is the bath room?", "When is the bathroom?", "What is the bathroom?"], c: 0, cat: "Shopping" },
{ ar: "أنا راجع البيت", en: "I'm coming home.", pron: "آيم كمنج هوم", opts: ["I'm coming home.", "I'm coming hole.", "I'm coming him.", "I'm coming here."], c: 0, cat: "Daily Activities" },
{ ar: "الوقت كام؟", en: "What time is it?", pron: "وات تايم إز إيت؟", opts: ["What time is it?", "What time is at?", "What times is it?", "What time are it?"], c: 0, cat: "Daily Activities" },
{ ar: "أنا بحبك", en: "I love you.", pron: "آي لاف يو", opts: ["I love you.", "I live you.", "I left you.", "I like you."], c: 0, cat: "Family" },
{ ar: "الكلام ده صح", en: "This is right.", pron: "ذيس إز رايت", opts: ["This is right.", "This is write.", "This is light.", "This is night."], c: 0, cat: "Opinions" },
{ ar: "أنا مش فاضي", en: "I'm not free.", pron: "آيم نوت فري", opts: ["I'm not free.", "I'm not four.", "I'm not from.", "I'm not five."], c: 0, cat: "Opinions" },
{ ar: "القهوة سخنة", en: "The coffee is hot.", pron: "ذه كوفي إز هوت", opts: ["The coffee is hot.", "The coffee is hat.", "The coffee is hit.", "The coffee is hut."], c: 0, cat: "Food" },
{ ar: "أنا ما أكلتش", en: "I didn't eat.", pron: "آي ديدنت إيت", opts: ["I didn't eat.", "I didn't it.", "I did eat.", "I don't eat."], c: 0, cat: "Food" },
{ ar: "هناك حد؟", en: "Is anyone there?", pron: "из إنوني ذير؟", opts: ["Is anyone there?", "Is any one three?", "Is anyone their?", "Is anyone then?"], c: 0, cat: "Greetings" },
];

const FB_MEDIUM = [
{ ar: "ممكن تكرر الكلام؟", en: "Can you repeat that?", pron: "كان يو ريبيت ذت؟", opts: ["Can you repeat that?", "Can you repeat this?", "Can you repair that?", "Can you report that?"], c: 0, cat: "Travel" },
{ ar: "أنا مسافر بكرة", en: "I'm traveling tomorrow.", pron: "آيم ترافلنج تو moro", opts: ["I'm traveling tomorrow.", "I'm traveling today.", "I'm traveling tender.", "I'm traveling to move."], c: 0, cat: "Travel" },
{ ar: "فين المطار؟", en: "Where is the airport?", pron: "وير إز ذه إيرپورت؟", opts: ["Where is the airport?", "Where is the report?", "Where is the airport?", "When is the airport?"], c: 0, cat: "Travel" },
{ ar: "أنا عايز أعمل ريزيرفشن", en: "I want to make a reservation.", pron: "آي وانت تو ميك ريزرفشن", opts: ["I want to make a reservation.", "I want to make a restaurant.", "I want to make a resolution.", "I want to make a relation."], c: 0, cat: "Travel" },
{ ar: "الفندق غالي", en: "The hotel is expensive.", pron: "ذه هوتيل إز إكسبنسيو", opts: ["The hotel is expensive.", "The hotel is experience.", "The hotel is export.", "The hotel is express."], c: 0, cat: "Travel" },
{ ar: "محتاج أدفع كام؟", en: "How much do I need to pay?", pron: "هاو ماش دو آي نيد تو باي؟", opts: ["How much do I need to pay?", "How much do I need to play?", "How much do I need to pray?", "How much do I need to stay?"], c: 0, cat: "Shopping" },
{ ar: "الحالة بتاعتي مش كويسة", en: "I'm not feeling well.", pron: "آيم نوت فيلينج ويل", opts: ["I'm not feeling well.", "I'm not feeling will.", "I'm not filling well.", "I'm not feeling while."], c: 0, cat: "Health" },
{ ar: "البروجكت اﺗأجل", en: "The project is postponed.", pron: "ذه پروجكت إز پوستپوند", opts: ["The project is postponed.", "The project is post point.", "The project is past pond.", "The project is best bond."], c: 0, cat: "Work" },
{ ar: "محتاج أعمل ريبورت", en: "I need to make a report.", pron: "آي نيد تو ميك ريبورت", opts: ["I need to make a report.", "I need to make a resort.", "I need to make a record.", "I need to make a result."], c: 0, cat: "Work" },
{ ar: "meeting بكرة الساعة 3", en: "Meeting tomorrow at 3.", pron: "ميتنج تو moro آت ثري", opts: ["Meeting tomorrow at 3.", "Meeting today at 3.", "Meeting tender at 3.", "Meeting to move at 3."], c: 0, cat: "Work" },
{ ar: "الطقس حلو أوي النهارده", en: "The weather is very nice today.", pron: "ذه ويذر إز فيري نايس تودي", opts: ["The weather is very nice today.", "The weather is very nine today.", "The weather is very new today.", "The weather is vary nice today."], c: 0, cat: "Weather" },
{ ar: "هتمطر بكرة", en: "It will rain tomorrow.", pron: "إت ويل رين تو moro", opts: ["It will rain tomorrow.", "It will run tomorrow.", "It will right tomorrow.", "It will write tomorrow."], c: 0, cat: "Weather" },
{ ar: "أنا عندي رأي تاني", en: "I have another opinion.", pron: "آي هاف أذر أوبينيون", opts: ["I have another opinion.", "I have an other opinion.", "I have another openion.", "I have another opening."], c: 0, cat: "Opinions" },
{ ar: "الشغل ده صعب", en: "This work is hard.", pron: "ذيس ورك إز هارد", opts: ["This work is hard.", "This work is heart.", "This work is heard.", "This work is harm."], c: 0, cat: "Work" },
{ ar: "ممكن نأجل الموضوع؟", en: "Can we postpone the matter?", pron: "كان وي پوستپون ذه ماتر؟", opts: ["Can we postpone the matter?", "Can we post point the matter?", "Can we post bone the matter?", "Can we post pond the matter?"], c: 0, cat: "Work" },
{ ar: "أنا بحب أسافر", en: "I love traveling.", pron: "آي لاف ترافلنج", opts: ["I love traveling.", "I love training.", "I love trying.", "I love trading."], c: 0, cat: "Travel" },
{ ar: "ممكن تدلني على المطعم؟", en: "Can you direct me to the restaurant?", pron: "كان يو ديركت مي تو ذه ريستورانت؟", opts: ["Can you direct me to the restaurant?", "Can you detect me to the restaurant?", "Can you direct me to the resort?", "Can you direct me to the resident?"], c: 0, cat: "Travel" },
{ ar: "عايز أغير الفلوس", en: "I want to exchange money.", pron: "آي وانت تو إكستشينج موني", opts: ["I want to exchange money.", "I want to exit money.", "I want to excuse money.", "I want to expand money."], c: 0, cat: "Travel" },
{ ar: "البطاقة بتاعتي اﺗسرقت", en: "My card was stolen.", pron: "ماي كارد واز ستولن", opts: ["My card was stolen.", "My card was stone.", "My card was stop.", "My card was story."], c: 0, cat: "Travel" },
{ ar: "محتاج فاتورة", en: "I need a receipt.", pron: "آي نيد ريسيت", opts: ["I need a receipt.", "I need a recent.", "I need a recite.", "I need a record."], c: 0, cat: "Shopping" },
{ ar: "أنا مش لاقي الشارع ده", en: "I can't find this street.", pron: "آي كاونت فايند ذيس ستريت", opts: ["I can't find this street.", "I can't find this strict.", "I can't find this stress.", "I can't find this straight."], c: 0, cat: "Travel" },
{ ar: "الخدمة هنا مش كويسة", en: "The service here is not good.", pron: "ذه سيرفيس هير إز نوت جود", opts: ["The service here is not good.", "The service here is not gold.", "The service here is not gone.", "The service here is not god."], c: 0, cat: "Opinions" },
{ ar: "أنا محتاج أعمل update", en: "I need to do an update.", pron: "آي نيد تو دو أن أبديت", opts: ["I need to do an update.", "I need to do an upload.", "I need to do an upgrade.", "I need to do an upset."], c: 0, cat: "Work" },
{ ar: "ممكن تديني فرصة؟", en: "Can you give me a chance?", pron: "كان يو جيف مي تشارنس؟", opts: ["Can you give me a chance?", "Can you give me a change?", "Can you give me a charge?", "Can you give me a chart?"], c: 0, cat: "Work" },
{ ar: "الحاجة دي مش شغالة", en: "This thing is not working.", pron: "ذيس ثينج إز نوت وركينج", opts: ["This thing is not working.", "This thing is not waking.", "This thing is not walking.", "This thing is not wanting."], c: 0, cat: "Work" },
{ ar: "أنا بفكر أغير الشغل", en: "I'm thinking of changing jobs.", pron: "آيم ثينكينج أوف تشينجينج جوبز", opts: ["I'm thinking of changing jobs.", "I'm thinking of charging jobs.", "I'm thinking of chasing jobs.", "I'm thinking of checking jobs."], c: 0, cat: "Work" },
{ ar: "ممكن نتكلم شوية؟", en: "Can we talk a little?", pron: "كان وي توك ليتل؟", opts: ["Can we talk a little?", "Can we take a little?", "Can we walk a little?", "Can we work a little?"], c: 0, cat: "Opinions" },
{ ar: "أنا مش فاهم النقطة دي", en: "I don't understand this point.", pron: "آي دونت أندرستاند ذيس پوينت", opts: ["I don't understand this point.", "I don't understand this print.", "I don't understand this paint.", "I don't understand this plant."], c: 0, cat: "Opinions" },
{ ar: "الجو مش مستقر", en: "The weather is unstable.", pron: "ذه ويذر إز أنستيبل", opts: ["The weather is unstable.", "The weather is unable.", "The weather is unable.", "The weather is enjoyble."], c: 0, cat: "Weather" },
{ ar: "الشمس مش ظاهرة", en: "The sun is not showing.", pron: "ذه سان إز نوت شوينج", opts: ["The sun is not showing.", "The sun is not sewing.", "The sun is not shoring.", "The sun is not knowing."], c: 0, cat: "Weather" },
{ ar: "أنا رايح اتصور", en: "I'm going to take a photo.", pron: "آيم جوينج تو تيك فوتو", opts: ["I'm going to take a photo.", "I'm going to take a photo.", "I'm going to take a fate.", "I'm going to take a fun."], c: 0, cat: "Daily Activities" },
{ ar: "النت بتاعي بطيء", en: "My internet is slow.", pron: "ماي إنترنت إز سلو", opts: ["My internet is slow.", "My internet is snow.", "My internet is show.", "My internet is sole."], c: 0, cat: "Daily Activities" },
{ ar: "أنا لسه ماخلصتش", en: "I haven't finished yet.", pron: "آي هيفنت فينيشت يت", opts: ["I haven't finished yet.", "I haven't finish yet.", "I haven't fined yet.", "I haven't found yet."], c: 0, cat: "Daily Activities" },
{ ar: "ممكن تعمليللي كوباية شاي؟", en: "Can you make me a cup of tea?", pron: "كان يو ميك مي كب أف تي؟", opts: ["Can you make me a cup of tea?", "Can you make me a cap of tea?", "Can you make me a cup of tie?", "Can you make me a cut of tea?"], c: 0, cat: "Food" },
{ ar: "الأكل عايز تتبيل", en: "The food needs seasoning.", pron: "ذه فود نيدز سونينج", opts: ["The food needs seasoning.", "The food needs sewing.", "The food needs seeing.", "The food needs singing."], c: 0, cat: "Food" },
{ ar: "أنا مش بشرب سجاير", en: "I don't smoke.", pron: "آي دونت سموك", opts: ["I don't smoke.", "I don't small.", "I don't smart.", "I don't smell."], c: 0, cat: "Health" },
{ ar: "أنا بتمرن كل يوم", en: "I exercise every day.", pron: "آي إكسايسز إيفري داي", opts: ["I exercise every day.", "I exit every day.", "I expect every day.", "I export every day."], c: 0, cat: "Health" },
{ ar: "الدكتور قاللي أستريح", en: "The doctor told me to rest.", pron: "ذه دوكتور تولد مي تو رست", opts: ["The doctor told me to rest.", "The doctor told me to rust.", "The doctor told me to rush.", "The doctor told me to race."], c: 0, cat: "Health" },
{ ar: "أنا محتاج أغير حياتي", en: "I need to change my life.", pron: "آي نيد تو تشينج ماي لايف", opts: ["I need to change my life.", "I need to charge my life.", "I need to chase my life.", "I need to check my life."], c: 0, cat: "Health" },
];

const FB_HARD = [
{ ar: "الأفعال دي شاذة", en: "These verbs are irregular.", pron: "ذيز فربز أر إريجولر", opts: ["These verbs are irregular.", "These verbs are regular.", "These verbs are popular.", "These verbs are similar."], c: 0, cat: "Grammar" },
{ ar: "لما بتتكلم في الشغل لازم تكون رسمي", en: "When you speak at work, you must be formal.", pron: "ون يو سپيك آت ورك، يو ماست بي فورمل", opts: ["When you speak at work, you must be formal.", "When you speak at work, you must be normal.", "When you speak at work, you must be final.", "When you speak at work, you must be funny."], c: 0, cat: "Formal English" },
{ ar: "الشركة بتحقق أرباح كبيرة", en: "The company is making huge profits.", pron: "ذه كمپاني إز ميكينج هوج پروفتس", opts: ["The company is making huge profits.", "The company is making huge prophets.", "The company is making huge products.", "The company is making huge projects."], c: 0, cat: "Business" },
{ ar: "لازم تعمل بحث شامل", en: "You must conduct comprehensive research.", pron: "يو ماست كنداكت كمپريهنسيو ريسيرتش", opts: ["You must conduct comprehensive research.", "You must conduct comprehensive research.", "You must conduct competitive research.", "You must conduct complete research."], c: 0, cat: "Academic" },
{ ar: "الاقتصاد بيميل للاختصار", en: "The economy is leaning toward recession.", pron: "ذه أيكونومي إز لينينج تو وارد ريسيشن", opts: ["The economy is leaning toward recession.", "The economy is leaning toward recreation.", "The economy is leaning toward reaction.", "The economy is leaning toward rotation."], c: 0, cat: "Business" },
{ ar: "المatter ده معقد أوي", en: "This matter is very complicated.", pron: "ذيس ماتر إز فيري كمپليكيتيد", opts: ["This matter is very complicated.", "This matter is very calculated.", "This matter is very cultivated.", "This matter is very concentrated."], c: 0, cat: "Formal English" },
{ ar: "لازم تاخد بيرميشن قبل ما تدخل", en: "You must get permission before entering.", pron: "يو ماست جت پرمشن بيفور إنترنج", opts: ["You must get permission before entering.", "You must get position before entering.", "You must get participation before entering.", "You must get production before entering."], c: 0, cat: "Formal English" },
{ ar: "لازم تعمل evaluation للبرنامج", en: "You must evaluate the program.", pron: "يو ماست إفالوبيت ذه پروجروم", opts: ["You must evaluate the program.", "You must evolve the program.", "You must evaluate the progress.", "You must evaluate the project."], c: 0, cat: "Business" },
{ ar: "لازم نعمل brainstorming لل idea ده", en: "We need to brainstorm this idea.", pron: "وي نيد تو برين ستورم ذيس آيديا", opts: ["We need to brainstorm this idea.", "We need to brain storm this idea.", "We need to break storm this idea.", "We need to brain stream this idea."], c: 0, cat: "Business" },
{ ar: "الـ deadline اقترب", en: "The deadline is approaching.", pron: "ذه ديدلاين إز أپروتشينج", opts: ["The deadline is approaching.", "The deadline is approving.", "The deadline is attaching.", "The deadline is attacking."], c: 0, cat: "Business" },
{ ar: "لازم ناخد الـ feedback بجدية", en: "We must take the feedback seriously.", pron: "وي ماست تيك ذه فيدبك سيريسلي", opts: ["We must take the feedback seriously.", "We must take the feedback seriously.", "We must take the feedback separately.", "We must take the feedback spiritually."], c: 0, cat: "Business" },
{ ar: "الاقتصاد العالمي فيه ركود", en: "The global economy is in recession.", pron: "ذه جلوبال أيكونومي إز إن ريسيشن", opts: ["The global economy is in recession.", "The global economy is in recreation.", "The global economy is in rotation.", "The global economy is in reaction."], c: 0, cat: "Business" },
{ ar: "لازم تعرف تتعامل مع الضغط", en: "You must know how to handle pressure.", pron: "يو ماست نو هاو تو هندل پريشر", opts: ["You must know how to handle pressure.", "You must know how to handle pleasure.", "You must know how to handle practice.", "You must know how to handle promise."], c: 0, cat: "Formal English" },
{ ar: "لازم نحسّن الـ workflow بتاعتنا", en: "We must improve our workflow.", pron: "وي ماست إمپروو أور ورك فلو", opts: ["We must improve our workflow.", "We must improve our word flow.", "We must improve our work floor.", "We must improve our worth flow."], c: 0, cat: "Business" },
{ ar: "العميل مش راضي عن الخدمة", en: "The client is not satisfied with the service.", pron: "ذه كلاينت إز نوت ساتيسفايد ويز ذه سيرفيس", opts: ["The client is not satisfied with the service.", "The client is not satisfied with the surface.", "The client is not satisfied with the survey.", "The client is not satisfied with the surplus."], c: 0, cat: "Business" },
{ ar: "لازم نعمل delegation للشغل", en: "We need to delegate the work.", pron: "وي نيد تو ديليقيت ذه ورك", opts: ["We need to delegate the work.", "We need to delete the work.", "We need to delight the work.", "We need to deliver the work."], c: 0, cat: "Business" },
{ ar: "الـ candidate ده مؤهل أوي", en: "This candidate is highly qualified.", pron: "ذيس كنديديت إز هايلي كواليفاييد", opts: ["This candidate is highly qualified.", "This candidate is highly quantified.", "This candidate is highly quality fire.", "This candidate is highly quiet."], c: 0, cat: "Business" },
{ ar: "لازم نعمل presentation للإدارة", en: "We must present to the management.", pron: "وي ماست پريزنت تو ذه مانيجمنت", opts: ["We must present to the management.", "We must present to the measurement.", "We must present to the movement.", "We must present to the monument."], c: 0, cat: "Business" },
{ ar: "لازم تاخد الـ initiative في الشغل", en: "You must take the initiative at work.", pron: "يو ماست تيك ذه إنيشياتيف آت ورك", opts: ["You must take the initiative at work.", "You must take the innovation at work.", "You must take the limitation at work.", "You must take the imagination at work."], c: 0, cat: "Formal English" },
{ ar: "فيه discrepancy في الأرقام", en: "There is a discrepancy in the numbers.", pron: "ذر إز ديسكريبنسي إن ذه نمبرز", opts: ["There is a discrepancy in the numbers.", "There is a discovery in the numbers.", "There is a distraction in the numbers.", "There is a discrimination in the numbers."], c: 0, cat: "Academic" },
{ ar: "لازم تعمل mitigation للمخاطر", en: "You must mitigate the risks.", pron: "يو ماست ميتيقيت ذه ريسكس", opts: ["You must mitigate the risks.", "You must motivate the risks.", "You must mediate the risks.", "You must moderate the risks."], c: 0, cat: "Business" },
{ ar: "لازم تعمل Due diligence قبل الصفقة", en: "You must do due diligence before the deal.", pron: "يو ماست دو ديو ديليجنس بيفور ذه ديل", opts: ["You must do due diligence before the deal.", "You must do due reference before the deal.", "You must do due difficulty before the deal.", "You must do due difference before the deal."], c: 0, cat: "Business" },
];

const FB_CS_EASY = [
{ ar: "الكود شغال!", en: "It works!", pron: "إت وركس!", opts: ["It works!", "It walks!", "It waits!", "It wakes!"], c: 0, cat: "Developer Phrases" },
{ ar: "فيه bug في البرنامج", en: "There is a bug in the program.", pron: "ذر إز بق إن ذه پروجرام", opts: ["There is a bug in the program.", "There is a bag in the program.", "There is a big in the program.", "There is a bed in the program."], c: 0, cat: "Error Messages" },
{ ar: "احفظ الملف", en: "Save the file.", pron: "سيف ذه فايل", opts: ["Save the file.", "Save the pile.", "Save the fail.", "Save the fill."], c: 0, cat: "Developer Phrases" },
{ ar: "افتح الترمينال", en: "Open the terminal.", pron: "أوپن ذه تيرمينل", opts: ["Open the terminal.", "Open the terrible.", "Open the terminal.", "Open the turtle."], c: 0, cat: "Linux Basics" },
{ ar: "روّح على الـ directory", en: "Go to the directory.", pron: "جيو تو ذه ديركتوري", opts: ["Go to the directory.", "Go to the dictionary.", "Go to the dirty.", "Go to the doctor."], c: 0, cat: "Linux Basics" },
{ ar: "اعمل list للملفات", en: "List the files.", pron: "ليست ذه فايلز", opts: ["List the files.", "List the piles.", "List the fills.", "List the fails."], c: 0, cat: "Linux Basics" },
{ ar: "عمل commit للchanges", en: "Commit the changes.", pron: "كوميت ذه تشينجز", opts: ["Commit the changes.", "Comment the changes.", "Commit the challenges.", "Commit the chapters."], c: 0, cat: "Git" },
{ ar: "ارفع الكود على الـ remote", en: "Push the code to remote.", pron: "بوش ذه كود تو ريموت", opts: ["Push the code to remote.", "Push the code to remove.", "Push the code to report.", "Push the code to resort."], c: 0, cat: "Git" },
{ ar: "فيه syntax error", en: "There is a syntax error.", pron: "ذر إز سينتاكس إيرور", opts: ["There is a syntax error.", "There is a system error.", "There is a synth error.", "There is a single error."], c: 0, cat: "Error Messages" },
{ ar: "البرنامج وقع", en: "The program crashed.", pron: "ذه پروجرام كراشت", opts: ["The program crashed.", "The program crushed.", "The program crossed.", "The program closed."], c: 0, cat: "Error Messages" },
{ ar: "اعمل run للـ code", en: "Run the code.", pron: "ران ذه كود", opts: ["Run the code.", "Run the card.", "Run the cold.", "Run the cord."], c: 0, cat: "Developer Phrases" },
{ ar: "اعمل debug للبرنامج", en: "Debug the program.", pron: "ديبج ذه پروجرام", opts: ["Debug the program.", "Delay the program.", "Delete the program.", "Deploy the program."], c: 0, cat: "Developer Phrases" },
{ ar: "الملف موجود فين؟", en: "Where is the file?", pron: "وير إز ذه فايل؟", opts: ["Where is the file?", "Where is the pile?", "Where is the fire?", "Where is the mile?"], c: 0, cat: "Linux Basics" },
{ ar: "اعمل mkdir لفولدر جديد", en: "Create a new directory with mkdir.", pron: "كريت نيو ديركتوري ويز mkdir", opts: ["Create a new directory with mkdir.", "Create a new dictionary with mkdir.", "Create a new dirty with mkdir.", "Create a new doctor with mkdir."], c: 0, cat: "Linux Basics" },
{ ar: "permission denied", en: "Permission denied.", pron: "بيرميشن دينايد", opts: ["Permission denied.", "Position denied.", "Permission defined.", "Permission decided."], c: 0, cat: "Error Messages" },
{ ar: "الكود مش شغال عليا", en: "The code is not working for me.", pron: "ذه كود إز نوت وركنج فور مي", opts: ["The code is not working for me.", "The code is not walking for me.", "The code is not waking for me.", "The code is not waiting for me."], c: 0, cat: "Developer Phrases" },
{ ar: "اعمل copy للـ code", en: "Copy the code.", pron: "كوباي ذه كود", opts: ["Copy the code.", "Copy the card.", "Copy the cold.", "Copy the cord."], c: 0, cat: "Developer Phrases" },
{ ar: "الـ variable دي فاضية", en: "The variable is empty.", pron: "ذه فيريبل إز إمپتي", opts: ["The variable is empty.", "The variable is happy.", "The variable is heavy.", "The variable is hurry."], c: 0, cat: "Code Basics" },
{ ar: "اعمل reset للمتغيرات", en: "Reset the variables.", pron: "ريسيت ذه فيريبلز", opts: ["Reset the variables.", "Reset the variables.", "Reset the valuable.", "Reset the variety."], c: 0, cat: "Code Basics" },
{ ar: "الـ output غلط", en: "The output is wrong.", pron: "ذه أوتبوت إز رونج", opts: ["The output is wrong.", "The output is long.", "The output is right.", "The output is run."], c: 0, cat: "Error Messages" },
];

const FB_CS_MEDIUM = [
{ ar: "الكود محتاج compile", en: "The code needs to be compiled.", pron: "ذه كود نيدز تو بي كومبايلد", opts: ["The code needs to be compiled.", "The code needs to be completed.", "The code needs to be collected.", "The code needs to be corrected."], c: 0, cat: "C/C++" },
{ ar: "فيه memory leak في الـ program", en: "There is a memory leak in the program.", pron: "ذر إز ميموري ليك إن ذه پروجرام", opts: ["There is a memory leak in the program.", "There is a memory lake in the program.", "There is a memory link in the program.", "There is a memory late in the program."], c: 0, cat: "C/C++" },
{ ar: "الـ pointer مششير على حاجة فاضية", en: "The pointer is pointing to null.", pron: "ذه پوينتر إز پوينتينج تو نل", opts: ["The pointer is pointing to null.", "The pointer is printing to null.", "The pointer is pulling to null.", "The pointer is pausing to null."], c: 0, cat: "C/C++" },
{ ar: "اعمل pull request", en: "Make a pull request.", pron: "ميك پل ريكويست", opts: ["Make a pull request.", "Make a full request.", "Make a poll request.", "Make a push request."], c: 0, cat: "GitHub Workflow" },
{ ar: "الـ code review خلص", en: "The code review is done.", pron: "ذه كود ريفيو إز دان", opts: ["The code review is done.", "The code reveal is done.", "The code revenge is done.", "The code resort is done."], c: 0, cat: "GitHub Workflow" },
{ ar: "فيه exception في الـ code", en: "There is an exception in the code.", pron: "ذر إز إكسيبشن إن ذه كود", opts: ["There is an exception in the code.", "There is an execution in the code.", "There is an exercise in the code.", "There is an example in the code."], c: 0, cat: "Python" },
{ ar: "الـ function بترجع null", en: "The function returns null.", pron: "ذه فنكشن ريتورنز نل", opts: ["The function returns null.", "The function returns new.", "The function returns net.", "The function returns now."], c: 0, cat: "C/C++" },
{ ar: "اعمل merge للـ branch", en: "Merge the branch.", pron: "مرج ذه برانش", opts: ["Merge the branch.", "March the branch.", "Match the branch.", "Watch the branch."], c: 0, cat: "GitHub Workflow" },
{ ar: "الـ debugger مش شغال", en: "The debugger is not working.", pron: "ذه ديبيغر إز نوت وركنج", opts: ["The debugger is not working.", "The debugger is not waking.", "The debugger is not walking.", "The debugger is not waiting."], c: 0, cat: "Debugging" },
{ ar: "فيه infinite loop", en: "There is an infinite loop.", pron: "ذر إز إنفينيت لوب", opts: ["There is an infinite loop.", "There is an infinite loot.", "There is an infinite lost.", "There is an infinite love."], c: 0, cat: "Debugging" },
{ ar: "الـ deploy على الـ production خلص", en: "Deployment to production is complete.", pron: "دبلويمنت تو پروداكشن إز كمپليت", opts: ["Deployment to production is complete.", "Deployment to production is competitive.", "Deployment to production is connected.", "Deployment to production is computed."], c: 0, cat: "GitHub Workflow" },
{ ar: "الـ build فشل", en: "The build failed.", pron: "ذه بيلد فيلد", opts: ["The build failed.", "The build filed.", "The build filled.", "The build found."], c: 0, cat: "Debugging" },
{ ar: "اعمل commit message واضح", en: "Write a clear commit message.", pron: "رايت كليير كوميت ميسج", opts: ["Write a clear commit message.", "Write a close commit message.", "Write a clever commit message.", "Write a clean commit message."], c: 0, cat: "GitHub Workflow" },
{ ar: "الـ variable دي private", en: "This variable is private.", pron: "ذيس فيريبل إز پرايفت", opts: ["This variable is private.", "This variable is perfect.", "This variable is pretty.", "This variable is protected."], c: 0, cat: "Python" },
{ ar: "الكود محتاج refactor", en: "The code needs refactoring.", pron: "ذه كود نيدز ريفاكتورنج", opts: ["The code needs refactoring.", "The code needs rewriting.", "The code needs reloading.", "The code needs refreshing."], c: 0, cat: "Debugging" },
{ ar: "فيه مشكلة في الـ database", en: "There is a problem with the database.", pron: "ذر إز پروبلم ويز ذه ديتابيز", opts: ["There is a problem with the database.", "There is a problem with the date base.", "There is a problem with the desk base.", "There is a problem with the device."], c: 0, cat: "Debugging" },
{ ar: "اعمل test case للـ function", en: "Write a test case for the function.", pron: "رايت تيست كيس فور ذه فنكشن", opts: ["Write a test case for the function.", "Write a text case for the function.", "Write a taste case for the function.", "Write a task case for the function."], c: 0, cat: "Debugging" },
{ ar: "الـ API بترجع error", en: "The API is returning an error.", pron: "ذه إيه بي آي إز ريتورنينج أن إيرور", opts: ["The API is returning an error.", "The API is retiring an error.", "The API is reviewing an error.", "The API is returning an era."], c: 0, cat: "Debugging" },
{ ar: "الـ terminal مقفول", en: "The terminal is closed.", pron: "ذه تيرمينل إز كلوзд", opts: ["The terminal is closed.", "The terminal is clean.", "The terminal is clear.", "The terminal is clever."], c: 0, cat: "Linux Basics" },
{ ar: "اعمل chmod للملف", en: "Change permissions with chmod.", pron: "تشينج پرمشنز ويز chmod", opts: ["Change permissions with chmod.", "Change positions with chmod.", "Change parents with chmod.", "Change patterns with chmod."], c: 0, cat: "Linux Basics" },
];

const FB_CS_HARD = [
{ ar: "الـ gradient descent بيتناقص ببطء", en: "Gradient descent is decreasing slowly.", pron: "جراديينت ديسينت إز ديسريسينج سلولي", opts: ["Gradient descent is decreasing slowly.", "Gradient descent is describing slowly.", "Gradient descent is displaying slowly.", "Gradient descent is discovering slowly."], c: 0, cat: "AI/ML" },
{ ar: "الـ model overfitted على الـ training data", en: "The model is overfitted on training data.", pron: "ذه مودل إز أوفرفيتد أون تريننج ديتا", opts: ["The model is overfitted on training data.", "The model is overrated on training data.", "The model is overfilled on training data.", "The model is overpassed on training data."], c: 0, cat: "AI/ML" },
{ ar: "الـ mutex بيثبط الـ race conditions", en: "Mutex prevents race conditions.", pron: "ميوتكس بريفينتس ريس كونديشنز", opts: ["Mutex prevents race conditions.", "Mutex prevents rich conditions.", "Mutex prevents right conditions.", "Mutex prevents rate conditions."], c: 0, cat: "Systems" },
{ ar: "فيه deadlock في الـ threads", en: "There is a deadlock in the threads.", pron: "ذر إز ديدلوك إن ذه ثريدز", opts: ["There is a deadlock in the threads.", "There is a deadlock in the threats.", "There is a dead lock in the threads.", "There is a dead lock in the throws."], c: 0, cat: "Systems" },
{ ar: "الـ stack overflow بسبب recursion عميق", en: "Stack overflow caused by deep recursion.", pron: "stack أوفرلو كوزد باي ديب ريكرجن", opts: ["Stack overflow caused by deep recursion.", "Stack overflow caused by deep reaction.", "Stack overflow caused by deep reduction.", "Stack overflow caused by deep recognition."], c: 0, cat: "Systems" },
{ ar: "الـ Docker image محتاج أصغر حجم", en: "The Docker image needs to be smaller.", pron: "ذه دوكر إميج نيدز تو بي سمولر", opts: ["The Docker image needs to be smaller.", "The Docker image needs to be smarter.", "The Docker image needs to be smoother.", "The Docker image needs to be stronger."], c: 0, cat: "Architecture" },
{ ar: "الـ CI/CD pipeline بيعمل auto deploy", en: "The CI/CD pipeline auto-deploys.", pron: "ذه CI/CD بايبلاين أوتو دبليوز", opts: ["The CI/CD pipeline auto-deploys.", "The CI/CD pipeline auto-displays.", "The CI/CD pipeline auto-describes.", "The CI/CD pipeline auto-decides."], c: 0, cat: "Architecture" },
{ ar: "الـ SOLID principles مهمة جداً", en: "SOLID principles are very important.", pron: "سوليد پرينسپلز أر فيري إمپورنت", opts: ["SOLID principles are very important.", "SOLID principles are very imported.", "SOLID principles are very improved.", "SOLID principles are very impressed."], c: 0, cat: "Architecture" },
{ ar: "الـ thread safety مش مضمون في الكود ده", en: "Thread safety is not guaranteed in this code.", pron: "ثريد سيفتي إز نوت غيرنتيد إن ذيس كود", opts: ["Thread safety is not guaranteed in this code.", "Thread safety is not granted in this code.", "Thread safety is not guarded in this code.", "Thread safety is not guessed in this code."], c: 0, cat: "Systems" },
{ ar: "الـ binary search أسرع من الـ linear search", en: "Binary search is faster than linear search.", pron: "باينري سيرتش إز فاستر ذان لينيئر سيرتش", opts: ["Binary search is faster than linear search.", "Binary search is faster than linear research.", "Binary search is further than linear search.", "Binary search is faster than linear reach."], c: 0, cat: "Algorithms" },
{ ar: "الـ dynamic programming بيحل المشاكل بذكاء", en: "Dynamic programming solves problems smartly.", pron: "ديناميك پروجرامينج سولفز پروبلمز سمارتلي", opts: ["Dynamic programming solves problems smartly.", "Dynamic programming solves problems slowly.", "Dynamic programming solves problems simply.", "Dynamic programming solves problems sadly."], c: 0, cat: "Algorithms" },
{ ar: "الـ neural network محتاج أكتر data", en: "The neural network needs more data.", pron: "ذه نيرال نيتورك نيدز مور ديتا", opts: ["The neural network needs more data.", "The neural network needs more dates.", "The neural network needs more date.", "The neural network needs more dead."], c: 0, cat: "AI/ML" },
{ ar: "الـ microservices architecture أفضل للـ scaling", en: "Microservices architecture is better for scaling.", pron: "مايكروسيرفيسيز أركيتكشر إز بتر فور سكيلينج", opts: ["Microservices architecture is better for scaling.", "Microservices architecture is better for schooling.", "Microservices architecture is better for scanning.", "Microservices architecture is better for scoring."], c: 0, cat: "Architecture" },
{ ar: "الـ divide and conquer strategy بتقسم المشكلة", en: "Divide and conquer strategy splits the problem.", pron: "ديفايد أند كنكوي ستراتيجي سپلتس ذه پروبلم", opts: ["Divide and conquer strategy splits the problem.", "Divide and conquer strategy splits the project.", "Divide and conquer strategy splits the promise.", "Divide and conquer strategy splits the process."], c: 0, cat: "Algorithms" },
{ ar: "الـ kernel بيمد الـ memory management", en: "The kernel handles memory management.", pron: "ذه كيرنل هندلز ميموري مانيجمنت", opts: ["The kernel handles memory management.", "The kernel handles memory manager.", "The kernel handles memory market.", "The kernel handles memory manner."], c: 0, cat: "Systems" },
{ ar: "الـ Kubernetes بي orchestrat الـ containers", en: "Kubernetes orchestrates containers.", pron: "كوبرنيتيس أركستريتس كونتينرز", opts: ["Kubernetes orchestrates containers.", "Kubernetes orchestrates contrasts.", "Kubernetes orchestrates contractors.", "Kubernetes orchestrates contributions."], c: 0, cat: "Architecture" },
{ ar: "فيه race condition في الـ shared state", en: "There is a race condition in the shared state.", pron: "ذر إز ريس كونديشن إن ذه شيرد ستيت", opts: ["There is a race condition in the shared state.", "There is a rich condition in the shared state.", "There is a raw condition in the shared state.", "There is a rare condition in the shared state."], c: 0, cat: "Systems" },
{ ar: "الـ garbage collector بيقفل الـ memory", en: "The garbage collector frees memory.", pron: "ذه جاربيج كلكتور فريز ميموري", opts: ["The garbage collector frees memory.", "The garbage collector fills memory.", "The garbage collector fears memory.", "The garbage collector fights memory."], c: 0, cat: "Systems" },
{ ar: "لازم تعرف الفرق بين concurrency و parallelism", en: "You must know the difference between concurrency and parallelism.", pron: "يو ماست نو ذه دفرنس بيتويذ كيرينسي أند پاراليزم", opts: ["You must know the difference between concurrency and parallelism.", "You must know the difference between community and parallelism.", "You must know the difference between curiosity and parallelism.", "You must know the difference between conspiracy and parallelism."], c: 0, cat: "Systems" },
{ ar: "الـ idempotency مهمة في الـ API design", en: "Idempotency is important in API design.", pron: "أيدمپوتينسي إز إمپورنت إن API ديزاين", opts: ["Idempotency is important in API design.", "Identity is important in API design.", "Impurity is important in API design.", "Imprecision is important in API design."], c: 0, cat: "Architecture" },
];

function shuffleQOpts(q) {
  const opts = [...q.opts]; const correct = opts[q.c];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  const newC = opts.indexOf(correct);
  return { ...q, opts, c: newC };
}

function genLocalQs(isCS, difficulty) {
  const bank = isCS ? (difficulty === "Easy" ? FB_CS_EASY : difficulty === "Medium" ? FB_CS_MEDIUM : FB_CS_HARD) : (difficulty === "Easy" ? FB_EASY : difficulty === "Medium" ? FB_MEDIUM : FB_HARD);
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 50).map((q, i) => {
    const sq = shuffleQOpts(q);
    const qt = i % 7 >= 5 ? "p" : i % 7 >= 2 ? "w" : "m";
    return { ...sq, qt };
  });
}

async function genQs(day, ln, isCS = false) {
  try {
    const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "gemini-2.0-flash", max_tokens: 9000, messages: [{ role: "user", content: `Generate exactly 50 English learning questions for Egyptian Arabic speakers. Level:${ln} Day:${day}/100. ${isCS ? "CS/Programming" : "General"} mode.\nOutput ONLY valid JSON array:\n[{"ar":"Arabic sentence","en":"English","pron":"نطق بالعربي","opts":["A","B","C","D"],"c":1,"cat":"Category"}]\nRules: c=0-3 index of correct; opts[c]=en exactly; 4 options; Egyptian dialect; distribute c evenly; exactly 50 items.` }] }) });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const d = await res.json(); if (d.error) throw new Error(d.error);
    const content = d.content; const txt = Array.isArray(content) ? content.map(b => b.text || "").join("") : "";
    if (!txt) throw new Error("AI returned empty response");
    const s = txt.indexOf("["), e = txt.lastIndexOf("]");
    if (s < 0 || e < 0) throw new Error("No JSON found in response");
    let raw; try { raw = JSON.parse(txt.slice(s, e + 1)); } catch { throw new Error("Failed to parse JSON"); }
    if (!Array.isArray(raw) || raw.length < 5) throw new Error("Too few questions");
    return raw.slice(0, 50).map((q, i) => {
      const c = typeof q.c === "number" && q.c >= 0 && q.c <= 3 ? q.c : 0;
      const opts = Array.isArray(q.opts) && q.opts.length === 4 ? q.opts.map(String) : ["A", "B", "C", "D"];
      if (q.en && opts[c] !== String(q.en)) opts[c] = String(q.en);
      const sq = shuffleQOpts({ ar: String(q.ar || "?"), en: String(q.en || "?"), pron: String(q.pron || ""), opts, c, cat: String(q.cat || "General") });
      const qt = i % 7 >= 5 ? "p" : i % 7 >= 2 ? "w" : "m";
      return { ...sq, qt };
    });
  } catch (e) {
    console.warn("AI failed, using local question bank:", e.message);
    return genLocalQs(isCS, ln);
  }
}

async function lQ(d, prefix = QK) { try { const v = localStorage.getItem(prefix + d); if (v) { const x = JSON.parse(v); if (x.date === toStr() && Array.isArray(x.qs) && x.qs.length >= 5) return x.qs; } return null; } catch { return null; } }
async function sQ(d, qs, prefix = QK) { try { localStorage.setItem(prefix + d, JSON.stringify({ date: toStr(), qs })); } catch {} }
function getPerfHistory() { try { return JSON.parse(localStorage.getItem(PERF_PK)) || []; } catch { return []; } }
function savePerfHistory(h) { localStorage.setItem(PERF_PK, JSON.stringify(h.slice(-20))); }
function recordPerf(acc) { const h = getPerfHistory(); h.push({ acc, ts: Date.now() }); savePerfHistory(h); }
function getAdaptDiff(dayDiff) {
  const h = getPerfHistory(); if (h.length < 2) return dayDiff;
  const last5 = h.slice(-5); const avg = last5.reduce((s, x) => s + x.acc, 0) / last5.length;
  const idx = DIFF_ORDER.indexOf(dayDiff);
  if (avg >= 80 && idx < 2) return DIFF_ORDER[idx + 1];
  if (avg < 45 && idx > 0) return DIFF_ORDER[idx - 1];
  return dayDiff;
}
const editDist = (a, b) => { const m = a.length, n = b.length, dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i || j)); for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); return dp[m][n]; };
const checkAns = (inp, ans) => { const a = ans.trim().toLowerCase(), t = inp.trim().toLowerCase(); if (t === a) return "ok"; if (editDist(t, a) <= Math.max(1, Math.floor(a.length * .15))) return "close"; return "no"; };
const mkHint = (ans, lv) => { const ws = ans.split(" "); if (lv === 1) return ws.map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join(" "); return ws.map(w => w.slice(0, Math.max(1, Math.ceil(w.length * .4))) + "_".repeat(Math.max(0, w.length - Math.max(1, Math.ceil(w.length * .4))))).join(" "); };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body { font-family: 'Cairo', 'Inter', system-ui, sans-serif; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(128,128,128,.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,.35); }
button { font-family: 'Cairo', system-ui, sans-serif; cursor: pointer; }
a { font-family: 'Cairo', system-ui, sans-serif; }
input { font-family: 'Cairo', system-ui, sans-serif; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .6; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes ringAnim { from { stroke-dashoffset: 283; } }
@keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(59,130,246,.1); } 50% { box-shadow: 0 0 30px rgba(59,130,246,.2); } }
@media (max-width: 1024px) {
  .desktop-only { display: none !important; }
  body::after { content: 'النسخة المحمولة متاحة فقط على الشاشات الصغيرة'; display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 18px; color: #94a3b8; text-align: center; padding: 40px; }
}
`;

const WORD_DICT={i:"أنا",you:"إنت",he:"هو",she:"هي",it:"هو(حاجة)",we:"إحنا",they:"هم",am:"(أنا)كون",is:"(هو/هي)كون",are:"(إنت/هم)كون",was:"(كان)كون(ماضي)",were:"(هم) كانوا",have:"عند(ي)",has:"عند(ه)",had:"كان عند(ه)",do:"يفعل",does:"(هو/هي)يفعل",did:"فعل",will:"هـ(مستقبل)",would:"(كان)هـ",can:"يقدر",could:"(كان)يقدر",may:"ممكن",might:"(ربما)",must:"لازم",should:"المفروض",shall:"(هـ-رسمي)",not:"مش",no:"لا",yes:"أه",and:"و",or:"أو",but:"بس",if:"لو",when:"لما",where:"فين",what:"إيه",who:"مين",why:"ليه",how:"إزاي",this:"ده",that:"ديك",these:"دول",those:"ديك(بعيد)",the:"(أداة تعريف)",a:"(أداة تنكير)",an:"(أداة تنكير)",my:"بتاعي",your:"بتاعك",his:"بتاعه",her:"بتاعها",its:"بتاعه(حاجة)",our:"بتاعنا",their:"بتاعهم",good:"كويس",bad:"وحش",big:"كبير",small:"صغير",new:"جديد",old:"قديم",hot:"سخن",cold:"بارد",fast:"سريع",slow:"بطيء",happy:"مبسوط",sad:"زعلان",eat:"ياكل",drink:"يشرب",go:"يروح",come:"يجي",see:"يشوف",look:"ينظر",give:"يدي",take:"ياخد",make:"يعمل",get:"يحصل",know:"يعرف",think:"يفكر",want:"يوريد",need:"محتاج",like:"يحب",love:"يحب(بشكل كبير)",buy:"يشتري",sell:"يبيع",pay:"يدفع",work:"يشتغل",play:"يلعب",run:"يركض",walk:"يمشي",sit:"يقعد",stand:"يقف",sleep:"ينام",wake:"يصحى",open:"يفتح",close:"يغلق",read:"يقرأ",write:"يكتب",speak:"يتكلم",listen:"يسمع",stop:"يقف",start:"يبدأ",finish:"يختم",help:"يساعد",try:"يحاول",use:"يستخدم",find:"يجد",tell:"يقول",ask:"يسأل",answer:"يجاوب",put:"يضع",keep:"يحتفظ",begin:"يبدأ",seem:"يبدو",feel:"يشعر",leave:"يمشي",call:"يتصل",turn:"يدور",move:"يتحرك",live:"يعيش",believe:"يصدق",bring:"يجيب",happen:"يحدث",include:"يشمل",provide:"يوفر",hold:"يمسك",follow:"يتبع",create:"يصنع",allow:"يسمح",add:"يضيف",spend:"يقضي(وقت)",grow:"يكبر",win:"يكسب",offer:"يعرض",remember:"يفتكر",consider:"يعتبر",appear:"يظهر",wait:"يستنى",serve:"يخدم",die:"يموت",send:"يرسل",expect:" يتوقع",build:"يبني",stay:"يقعد",fall:"يقع",cut:"يقطع",reach:"يوصل",kill:"يقتل",remain:"يفضل",suggest:"يقترح",raise:"يرفع",pass:"يعدي",require:"يحتاج",report:"يبلغ",decide:"يقرر",pull:"يسحب",develop:"يطور",meet:"يقابل",type:"يكتب(كيبورد)",connect:"يتصل",check:"يفحص",save:"يحفظ",change:"يغير",delete:"يحذف",install:"يثبت",download:"يحمل",upload:"يرفع",debug:"يصلح",fix:"يصلح",test:"يختبر",compile:"يكومبايل",deploy:"ينشر",push:"يرفع",merge:"يمزج",clone:"يكلون",commit:"يكوميت",branch:"يفرع",error:"غلط",bug:"خلل",code:"كود",function:"دالة",variable:"متغير",array:"مصفوفة",string:"نص",number:"رقم",object:"كائن",class:"فئة",method:"طريقة",property:"خاصية",return:"يرجع",else:"وإلا",while:"بينما",for:"لفترة",switch:"حالة",case:"حالة",break:"يوقف",continue:"يكمل",catch:"يلتقط",throw:"يرمي",import:"يستورد",export:"يصدّر",from:"من",const:"ثابت",let:"اترك",var:"متغير",true:"صح",false:"غلط",null:"فارغ",undefined:"غير محدد",void:"فارغ",typeof:"نوع",instanceof:"من نوع",in:"في",of:"من",with:"مع",async:"غير متزامن",await:"ينتظر",promise:"وعد",callback:"استدعاء",event:"حدث",listener:"مستمع",DOM:"مستند",node:"عقدة",element:"عنصر",tag:"وسم",attribute:"خاصية",value:"قيمة",key:"مفتاح",map:"خريطة",set:"مجموعة",weak:"ضعيف",strong:"قوي",public:"عام",private:"خاص",protected:"محفوظ",static:"ثابت",abstract:"تجريدي",interface:"واجهة",extends:"يمتد",implements:"ينفذ",super:"فوق",default:"افتراضي",as:"كـ",module:"وحدة",package:"حزمة",library:"مكتبة",framework:"إطار",runtime:"وقت التشغيل",compiler:"مترجم",interpreter:"مفسّر",debugger:" debugger",console:"وحدة التحكم",terminal:"طرفيّة",shell:"صدفة",browser:"متصفّح",server:"خادم",client:"عميل",database:"قاعدة بيانات",table:"جدول",query:"استعلام",index:"فهرس",column:"عمود",row:"صف",schema:"مخطط",migration:"ترحيل",seed:"بذرة",cache:"خزّنة",cookie:"كوكيز",session:"جلسة",token:"رمز",auth:"مصادقة",jwt:"رمز JWT",oauth:"OAuth",cors:"CORS",ssl:"SSL",tls:"TLS",http:"HTTP",https:"HTTPS",api:"واجهة برمجة",rest:"REST",graphql:"GraphQL",websocket:"وصلة ويب",socket:"مأخذ",port:"منفذ",host:"مضيف",domain:"نطاق",url:"رابط",uri:"معرّف",dns:"DNS",ip:"عنوان IP",tcp:"TCP",udp:"UDP",ssh:"SSH",ftp:"FTP",cdn:"CDN",aws:"AWS",azure:"Azure",gcp:"GCP",docker:"Docker",kubernetes:"كوبرنيتيس",ci:"CI",cd:"CD",pipeline:"خط أنابيب",lint:"فحص",format:"تنسيق",refactor:"إعادة هيكلة",monitor:"مراقبة",log:"سجل",metric:"قياس",alert:"تنبيه",scale:"قياس",load:"حمل",balance:"توازن",performance:"أداء",security:"أمان",privacy:"خصوصية",compliance:"امتثال",audit:"تدقيق",encrypt:"تشفير",decrypt:"فك تشفير",hash:"تجزئة",secret:"سر",certificate:"شهادة",firewall:"جدار حماية",intrusion:"اختراق",malware:"برمجيات خبيثة",vulnerability:"ثغرة",patch:"ترقية",update:"تحديث",upgrade:"ترقية",version:"إصدار",release:"إصدار",changelog:"سجل التغييرات",documentation:"توثيق",wiki:"ويكي",README:"README",license:"رخصة",copyright:"حقوق النشر",trademark:"علامة تجارية",patent:"براءة اختراع",warranty:"ضمان",liability:"مسؤولية",indemnify:"يعوض",arbitration:"تحكيم",jurisdiction:"اختصاص",governing:"يخضع",law:"قانون",regulation:"نظام",policy:"سياسة",terms:"شروط",gdpr:"GDPR",hipaa:"HIPAA",soc2:"SOC 2",iso27001:"ISO 27001",pci:"PCI",stripe:"Stripe",paypal:"PayPal",bitcoin:"بيتكوين",ethereum:"إيــريـــوم",blockchain:"سلسلة كتل",smart:"ذكي",contract:"عقد",wallet:"محفظة",mining:"تعدين",nonce:"nonce",block:"كتلة",chain:"سلسلة",peer:"نظير",consensus:"إجماع",fork:"فرع",mainnet:"الشبكة الرئيسية",testnet:"شبكة الاختبار",gas:"وقود",fee:"رسوم",transfer:"تحويل",address:"عنوان",recovery:"استرداد",backup:"نسخ احتياطي",sync:"مزامنة",offline:"غير متصل",online:"متصل",disconnect:"قطع",reconnect:"إعادة الاتصال",timeout:"مهلة",retry:"إعادة محاولة",fail:"فشل",success:"نجاح",warning:"تحذير",info:"معلومات",trace:"تتبع",level:"مستوى",channel:"قناة",topic:"موضوع",subscribe:"اشترك",publish:"نشر",broadcast:"بث",unicast:"بث أحادي",multicast:"بث متعدد",webhook:"webhook",endpoint:"نقطة نهاية",route:"مسار",header:"رأس",body:"جسم",status:"حالة",message:"رسالة",data:"بيانات",payload:"حمولة",param:"معامل",arg:"معامل",config:"إعدادات",env:"بيئة",role:"دور",permission:"صلاحية",access:"وصول",deny:"رفض",grant:"منح",revoke:"إلغاء",track:"تتبع",notify:"إشعار",email:"بريد",sms:"رسالة نصية",web:"ويب",mobile:"محمول",desktop:"مكتبي",user:"مستخدم",admin:"مدير",guest:"ضيف",member:"عضو",owner:"مالك",creator:"منشئ",manager:"مدير",developer:"مطور",designer:"مصمم",tester:"مختبر",analyst:"محلل",architect:"مهندس معماري",lead:"قائد",senior:"كبير",junior:"صغير",intern:"تدريبي",freelance:"حر",contractor:"مقاول",vendor:"بائع",supplier:"مورّد",partner:"شريك",affiliate:"تابع",reseller:"معيد بيع",distributor:"موزّع",customer:"عميل",audience:"جمهور",visitor:"زائر",subscriber:"مشترك",follower:"متابع",fan:"معجب",critic:"ناقد",reviewer:"مراجع",reporter:"مراسل",journalist:"صحفي",editor:"محرر",publisher:"ناشر",blogger:"مدوّن",influencer:"مؤثّر",celebrity:"مشهور",star:"نجم",idol:"أيقونة",legend:"أسطورة",genius:"عبقري",expert:"خبير",master:"سيد",pro:"محترف",amateur:"هاوي",beginner:"مبتدئ",novice:"متوحد",intermediate:"متوسط",advanced:"متقدم",guru:"गुरु",sensei:"sensei",maestro:"maestro",virtuoso:"virtuoso",champion:"بطل",winner:"فاتح",loser:"خاسر",rival:"منافس",opponent:"خصم",ally:"حليف",friend:"صديق",enemy:"عدو",buddy:"رفيق",pal:"صاحب",mate:"صاحب",companion:"رفيق",colleague:"زميل",associate:"مساعد",superior:"رئيس",subordinate:"مرؤوس",boss:"رئيس",employee:"موظف",worker:"عامل",staff:"موظفين",team:"فريق",group:"مجموعة",organization:"منظمة",company:"شركة",corporation:"شركة",enterprise:"شركة",business:"شركة",startup:"شركة ناشئة",firm:"مكتب",agency:"وكالة",bureau:"مكتب",institution:"مؤسسة",foundation:"مؤسسة",association:"جمعية",union:"اتحاد",committee:"لجنة",board:"مجلس",council:"مجلس",parliament:"برلمان",congress:"كونغرس",senate:"مجلس شيوخ",government:"حكومة",state:"دولة",country:"دولة",nation:"أمة",republic:"جمهورية",democracy:"ديمقراطية",dictatorship:"دكتاتورية",monarchy:"ملكية",empire:"إمبراطورية",kingdom:"مملكة",colony:"مستعمرة",territory:"إقليم",province:"مقاطعة",county:"مقاطعة",city:"مدينة",town:"بلدة",village:"قرية",neighborhood:"حي",district:"منطقة",region:"منطقة",zone:"منطقة",area:"منطقة",place:"مكان",location:"موقع",position:"موضع",coordinates:"إحداثيات",latitude:"خط العرض",longitude:"خط الطول",altitude:"ارتفاع",elevation:"ارتفاع",depth:"عمق",distance:"مسافة",range:"مدى",size:"حجم",volume:"حجم",capacity:"سعة",mass:"كتلة",weight:"وزن",density:"كثافة",temperature:"درجة حرارة",pressure:"ضغط",humidity:"رطوبة",wind:"رياح",rain:"مطر",snow:"ثلج",sun:"شمس",moon:"قمر",planet:"كوكب",earth:"أرض",mars:"المريخ",jupiter:"المشترى",saturn:"زحل",venus:"الزهرة",mercury:"عطارد",uranus:"أورانوس",neptune:"نبتون",pluto:"بلوتو",galaxy:"مجرة",universe:"كون",space:"فضاء",time:"وقت",past:"ماضي",present:"حاضر",future:"مستقبل",year:"سنة",month:"شهر",week:"أسبوع",day:"يوم",hour:"ساعة",minute:"دقيقة",second:"ثانية",millisecond:"ميلي ثانية",microsecond:"ميكرو ثانية",nanosecond:"نانو ثانية",century:"قرن",decade:"عقد",millennium:"ألف سنة",era:"عصر",epoch:"حقبة",moment:"لحظة",instant:"لحظة",duration:"مدة",period:"فترة",interval:"فاصل",schedule:"جدولة",deadline:"موعد نهائي",milestone:"معلم",checkpoint:"نقطة تحقق",phase:"مرحلة",stage:"مرحلة",step:"خطوة",grade:"درجة",rank:"مرتبة",condition:"حالة",situation:"وضع",circumstance:"ظروف",incident:"حادثة",accident:"حادث",emergency:"طوارئ",crisis:"أزمة",disastor:"كارثة",catastrophe:"كارثة",tragedy:"مأساة",disaster:"كارثة",calamity:"كارثة",panic:"ذعر",fear:"خوف",anxiety:"قلق",stress:"توتر",tension:"توتر",burden:"عبء",responsibility:"مسؤولية",duty:"واجب",obligation:"التزام",commitment:"التزام",agreement:"اتفاق",treaty:"معاهدة",pact:"معاهد",alliance:"تحالف",coalition:"تحالف",partnership:"شراكة",collaboration:"تعاون",cooperation:"تعاون",teamwork:"عمل جماعي",synergy:"تناغم",integration:"تكامل",unification:"توحيد",consolidation:"تثبيت",merger:"اندماج",acquisition:"استحواذ",takeover:"استحواذ",buyout:"شراء",sale:"بيع",purchase:"شراء",transaction:"معاملة",deal:"صفقة",bargain:"مساومة",discount:"خصم",refund:"استرداد",exchange:"ambio",guarantee:"كفالة",insurance:"تأمين",coverage:"تغطية",premium:"قسط",deductible:"مبلغ م.cms",claim:"مطالبة",settlement:"تسوية",litigation:"دعاوى",lawsuit:"دعاوى",court:"محكمة",judge:"قاضي",jury:"هيئة المحلفين",witness:"شاهد",evidence:"دليل",proof:"برهان",testimony:"شهادة",verdict:"حكم",sentence:"حكم",penalty:"عقوبة",fine:"غرامة",imprisonment:"سجن",probation:"إشراف",parole:"إفراج مشروط",pardon:"عفو",amnesty:"عفو عام",reprieve:"تأجيل",appeal:"استئناف",review:"مراجعة",reconsideration:"إعادة النظر",amendment:"تعديل",revision:"مراجعة",improvement:"تحسين",enhancement:"تحسين",optimization:"تحسين",refactoring:"إعادة هيكلة",reorganization:"إعادة تنظيم",restructuring:"إعادة هيكلة",reform:"إصلاح",revolution:"ثورة",evolution:"تطور",progress:"تقدم",advancement:"تقدم",development:"تطوير",growth:"نمو",expansion:"توسع",extension:"امتداد",prolongation:"إطالة",continuation:"استمرار",sustainability:"استدامة",resilience:"مرونة",adaptability:"قدرة التكيّف",flexibility:"مرونة",versatility:"تنوع",diversity:"تنوّع",variety:"نوعية",scope:"نطاق",extent:"مدى",degree:"درجة",intensity:"شدة",magnitude:"حجم",proportion:"نسبة",ratio:"نسبة",percentage:"نسبة مئوية",fraction:"كسر",decimal:"عشري",integer:"عدد صحيح",digit:"رقم",zero:"صفر",one:"واحد",two:"اثنين",three:"ثلاثة",four:"أربعة",five:"خمسة",six:"ستة",seven:"سبعة",eight:"ثمانية",nine:"تسعة",ten:"عشرة",hundred:"مئة",thousand:"ألف",million:"مليون",billion:"مليار",trillion:"تريليون",quadrillion:"كوادريليون"};

function speakEn(text){try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=0.82;u.pitch=1;window.speechSynthesis.speak(u);}catch(e){}}

function useSnd(on){const ctx=useRef(null);return useCallback((t)=>{if(!on)return;try{if(!ctx.current)ctx.current=new(window.AudioContext||window.webkitAudioContext)();const ac=ctx.current;if(ac.state==="suspended")ac.resume();const now=ac.currentTime;const tone=(f,s,d,v=.22,w="sine")=>{const o=ac.createOscillator(),g=ac.createGain();o.type=w;o.frequency.value=f;g.gain.setValueAtTime(v,now+s);g.gain.exponentialRampToValueAtTime(.001,now+s+d);o.connect(g);g.connect(ac.destination);o.start(now+s);o.stop(now+s+d+.05);};if(t==="ok"){tone(523,0,.1);tone(659,.1,.1);tone(784,.18,.25);}else if(t==="close"){tone(440,0,.1);tone(523,.1,.18);}else if(t==="no"){tone(280,0,.08,.18,"sawtooth");tone(210,.09,.18,.18,"sawtooth");}else if(t==="hint"){tone(350,0,.07,.12);}else if(t==="nxt"){tone(440,0,.03,.1);tone(523,.04,.07,.08);}else if(t==="done"){tone(523,0,.1);tone(659,.12,.1);tone(784,.22,.1);tone(1047,.34,.3,.18);}else if(t==="stk"){tone(659,0,.08);tone(784,.08,.08);tone(1047,.16,.22);}else if(t==="flip"){tone(440,0,.05,.1);}}catch(e){};},[on]);}

function WordTrans({text,T:theme,lv}){
  const [open,setOpen]=useState(null);
  if(!text)return null;
  const words=text.split(/\s+/);
  return(<div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",alignItems:"center"}}>
    {words.map((w,i)=>{
      const clean=w.replace(/[^a-zA-Z'-]/g,"");
      const trans=WORD_DICT[clean.toLowerCase()];
      const isOpen=open===i;
      return(
        <span key={i} style={{position:"relative",display:"inline-block"}}>
          <span onClick={(e)=>{e.stopPropagation();setOpen(isOpen?null:i);}} style={{padding:"3px 6px",borderRadius:6,cursor:"pointer",fontSize:16,fontWeight:600,color:lv?lv.tx:"#2563EB",background:isOpen?(lv?lv.bg:"rgba(59,130,246,.12)"):"transparent",border:trans?`1px dashed ${lv?lv.br:"rgba(59,130,246,.3)"}`:"1px solid transparent",transition:"all .15s",userSelect:"none"}}>{w} </span>
          {isOpen&&trans&&<span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#fff",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:600,whiteSpace:"nowrap",zIndex:50,boxShadow:"0 4px 12px rgba(0,0,0,.25)",fontFamily:"Cairo,sans-serif",animation:"pop .15s ease"}}>{trans}</span>}
          {isOpen&&!trans&&<span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#94A3B8",padding:"4px 10px",borderRadius:8,fontSize:11,whiteSpace:"nowrap",zIndex:50,boxShadow:"0 4px 12px rgba(0,0,0,.25)"}}>—</span>}
        </span>
      );
    })}
    <button onClick={()=>speakEn(text)} style={{background:lv?lv.fill:"#3B82F6",color:"#fff",border:"none",borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer",flexShrink:0,marginLeft:4}} title="Listen">🔊</button>
  </div>);
}

function PronBox({pron,theme,lv,en}){
  if(!pron)return null;
  return(<div style={{marginTop:10,padding:"12px 16px",borderRadius:10,background:lv?lv.bg:"rgba(59,130,246,.06)",border:`1px solid ${lv?lv.br:"rgba(59,130,246,.15)"}`}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {en&&<button onClick={()=>speakEn(en)} style={{background:lv?lv.fill:"#3B82F6",color:"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:16,cursor:"pointer",flexShrink:0}} title="Listen">🔊</button>}
      <div><div style={{fontSize:10,fontWeight:600,color:lv?lv.tx:"#2563EB",letterSpacing:".06em",textTransform:"uppercase",marginBottom:2}}>النطق بالعربي</div><div style={{direction:"rtl",fontSize:18,fontWeight:600,color:"#e8edf5",fontFamily:"Cairo,sans-serif",lineHeight:1.6}}>{pron}</div></div>
    </div>
  </div>);
}

function AnimatedNumber({ value, duration = 600, prefix = '', suffix = '', style = {} }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span style={style}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function AccuracyRing({ accuracy, size = 120, stroke = 8, dark }) {
  const t = TH[dark ? 'dark' : 'light'];
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (accuracy / 100) * circ;
  const color = accuracy >= 80 ? '#22C55E' : accuracy >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${color}40)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedNumber value={Math.round(accuracy)} suffix="%" style={{ fontSize: 26, fontWeight: 700, color: t.txt, fontFamily: "'Inter', monospace" }} />
        <span style={{ fontSize: 11, color: t.m, marginTop: 2 }}>الدقة</span>
      </div>
    </div>
  );
}

function GlassCard({ children, dark, style = {}, onClick, hover = true, className = '' }) {
  const t = TH[dark ? 'dark' : 'light'];
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        background: t.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered && hover ? (dark ? 'rgba(59,130,246,.3)' : 'rgba(59,130,246,.2)') : t.glassBd}`,
        borderRadius: 16,
        padding: 24,
        transition: 'all .25s cubic-bezier(.4,0,.2,1)',
        transform: hovered && hover ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && hover
          ? dark ? '0 8px 32px rgba(0,0,0,.3), 0 0 0 1px rgba(59,130,246,.1)' : '0 8px 32px rgba(0,0,0,.06), 0 0 0 1px rgba(59,130,246,.08)'
          : dark ? '0 2px 12px rgba(0,0,0,.2)' : '0 2px 12px rgba(0,0,0,.04)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, color, dark, trend }) {
  const t = TH[dark ? 'dark' : 'light'];
  return (
    <GlassCard dark={dark} hover style={{ flex: '1 1 0', minWidth: 180, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          border: `1px solid ${color}18`,
          boxShadow: `0 2px 8px ${color}12`
        }}>{icon}</div>
        {trend && <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,.1)', padding: '2px 8px', borderRadius: 6 }}>+{trend}%</span>}
      </div>
      <AnimatedNumber value={typeof value === 'number' ? value : parseInt(value) || 0} style={{ fontSize: 28, fontWeight: 700, color: t.txt, fontFamily: "'Inter', 'Cairo', sans-serif", display: 'block' }} />
      <span style={{ fontSize: 12, color: t.m, marginTop: 4, display: 'block' }}>{label}</span>
    </GlassCard>
  );
}

function BarChart({ data, dark }) {
  const t = TH[dark ? 'dark' : 'light'];
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, padding: '0 2px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: t.m, fontFamily: "'Inter', monospace" }}>{d.value}</span>
          <div style={{
            width: '100%', height: `${(d.value / max) * 100}%`,
            background: `linear-gradient(180deg, ${d.color || '#3B82F6'}, ${d.color || '#3B82F6'}88)`,
            borderRadius: 6, minHeight: 4,
            transition: 'height .8s cubic-bezier(.4,0,.2,1)',
            boxShadow: `0 0 8px ${d.color || '#3B82F6'}20`
          }} />
          <span style={{ fontSize: 10, color: t.m }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DesktopApp() {
  const [section, setSection] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [cfg, setCfg] = useState(CFG_DEF);
  const play = useSnd(cfg.sound);
  const [progress, setProgress] = useState(DEF);
  const [user, setUser] = useState(null);
  const [gramCat, setGramCat] = useState(null);
  const [gramTopic, setGramTopic] = useState(null);
  const [gramSection, setGramSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authToken, setAuthToken] = useState(() => { try { return localStorage.getItem("e5k_token") || null; } catch { return null; } });
  const [syncing, setSyncing] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(!!authToken);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState(null);
  const [quizPhase, setQuizPhase] = useState(null);
  const [quizType, setQuizType] = useState('general');
  const [qs, setQs] = useState([]);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [inp, setInp] = useState('');
  const [res, setRes] = useState(null);
  const [hl, setHl] = useState(0);
  const [showA, setShowA] = useState(false);
  const [tries, setTries] = useState(0);
  const [ok, setOk] = useState(0);
  const [sXp, setSXp] = useState(0);
  const [hrt, setHrt] = useState(5);
  const [cStreak, setCStreak] = useState(0);
  const [wrongQs, setWrongQs] = useState([]);
  const [showWrong, setShowWrong] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [studyIdx, setStudyIdx] = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [ptcl, setPtcl] = useState(false);
  const [shkIdx, setShkIdx] = useState(null);
  const [xpPop, setXpPop] = useState(null);
  const [stkPop, setStkPop] = useState(null);
  const [puzzleChips, setPuzzleChips] = useState([]);
  const [puzzleAnswer, setPuzzleAnswer] = useState([]);
  const [puzzleDone, setPuzzleDone] = useState(false);
  const [puzzleOk, setPuzzleOk] = useState(false);
  const [qKey, setQKey] = useState(0);
  const [practice, setPractice] = useState(false);
  const [isCS, setIsCS] = useState(false);
  const [genTick, setGenTick] = useState(0);
  const [genMsgIdx, setGenMsgIdx] = useState(0);
  const [authView, setAuthView] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authAge, setAuthAge] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  // Heartbeat for online status
  useEffect(() => { if (!authToken) return; const hb = () => fetch("/api/user?action=heartbeat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } }).catch(() => {}); hb(); const i = setInterval(hb, 30000); return () => clearInterval(i); }, [authToken]);

  async function apiCall(url, opts = {}, token) {
    const t = token || authToken;
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }

  const doSignUp = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthLoading(true);
    try {
      const d = await apiCall("/api/auth/signup", { method: "POST", body: JSON.stringify({ name: authName, username: authUsername, email: authEmail, password: authPass, age: authAge }) });
      localStorage.setItem("e5k_token", d.token); setAuthToken(d.token); setUser(d.user);
      try { localStorage.setItem("e5k_u13", JSON.stringify(d.user)); } catch {}
      await cloudPull(d.token);
      setAuthView("");
    } catch (e) { setAuthErr(e.message); } finally { setAuthLoading(false); }
  };

  const doSignIn = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthLoading(true);
    try {
      const d = await apiCall("/api/auth/signin", { method: "POST", body: JSON.stringify({ email: authEmail, password: authPass }) });
      localStorage.setItem("e5k_token", d.token); setAuthToken(d.token); setUser(d.user);
      try { localStorage.setItem("e5k_u13", JSON.stringify(d.user)); } catch {}
      await cloudPull(d.token);
      setAuthView("");
    } catch (e) { setAuthErr(e.message); } finally { setAuthLoading(false); }
  };

  const doForgot = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthLoading(true);
    try {
      await apiCall("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email: authEmail }) });
      setAuthMsg("Reset token sent! Check your email or use: TESTRESET123");
      setAuthView("reset");
    } catch (e) { setAuthErr(e.message); } finally { setAuthLoading(false); }
  };

  const doResetPass = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthLoading(true);
    try {
      const d = await apiCall("/api/auth/reset", { method: "POST", body: JSON.stringify({ token: authToken, password: authPass }) });
      localStorage.setItem("e5k_token", d.token); setAuthToken(d.token); setUser(d.user);
      try { localStorage.setItem("e5k_u13", JSON.stringify(d.user)); } catch {}
      await cloudPull(d.token);
      setAuthView("");
    } catch (e) { setAuthErr(e.message); } finally { setAuthLoading(false); }
  };

  const doSignOut = () => {
    localStorage.removeItem("e5k_token");
    setAuthToken(null); setUser(null); setAuthView("");
  };

  async function fetchLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      const res = await fetch("/api/leaderboard", { method: "GET", headers });
      if (res.ok) { const d = await res.json(); setLeaderboard(d.leaderboard || []); setLeaderboardRank(d.myRank); }
    } catch (e) { console.warn("Leaderboard fetch failed:", e.message); }
    setLeaderboardLoading(false);
  }

  async function cloudPull(token) {
    const tk = token || authToken;
    if (!tk) return;
    setSyncing(true);
    try {
      const d = await apiCall("/api/sync/pull", { method: "GET" }, tk);
      if (d.progress?.general) { try { localStorage.setItem("e5k_p13", JSON.stringify(d.progress.general)); } catch {} }
      if (d.progress?.cs) { try { localStorage.setItem("e5k_cs13", JSON.stringify(d.progress.cs)); } catch {} }
      if (d.profile) { try { localStorage.setItem("e5k_u13", JSON.stringify(d.profile)); } catch {} }
      if (d.settings) { try { localStorage.setItem("e5k_s13", JSON.stringify({ sound: d.settings.sound !== false, dark: !!d.settings.dark })); } catch {} }
      if (Array.isArray(d.perfHistory)) { try { localStorage.setItem("e5k_perf", JSON.stringify(d.perfHistory.slice(-20))); } catch {} }
      setCloudConnected(true);
    } catch (e) { console.warn("Desktop cloud pull failed:", e.message); }
    setSyncing(false);
  }

  async function cloudPush() {
    if (!authToken) return;
    try {
      const prog = JSON.parse(localStorage.getItem("e5k_p13") || "{}");
      const csProg = JSON.parse(localStorage.getItem("e5k_cs13") || "{}");
      const cfgData = JSON.parse(localStorage.getItem("e5k_s13") || "{}");
      const perf = JSON.parse(localStorage.getItem("e5k_perf") || "[]");
      await apiCall("/api/sync/push", { method: "POST", body: JSON.stringify({ general: prog, cs: csProg, settings: cfgData, perfHistory: perf }) });
    } catch (e) { console.warn("Desktop cloud push failed:", e.message); }
  }

  useEffect(() => { if (authToken) cloudPull(); }, []);
  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(() => { cloudPush(); }, 300000);
    return () => clearInterval(interval);
  }, [authToken]);
  useEffect(() => {
    const handle = () => { if (document.visibilityState === "visible" && authToken) cloudPush(); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [authToken]);
  useEffect(() => {
    (async () => {
      const [c, p, u] = await Promise.all([lCfg(), lP(), lU()]);
      setCfg(c);
      setDarkMode(c.dark);
      setProgress(p);
      setUser(u);
    })();
  }, []);
  useEffect(() => {
    const c = { ...cfg, dark: darkMode };
    setCfg(c);
    sCfg(c);
  }, [darkMode]);

  const t = TH[darkMode ? 'dark' : 'light'];
  const lv = getLv(progress.xp);
  const nxt = getNext(progress.xp);
  const accuracy = progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;
  const nextLvlProg = nxt ? ((progress.xp - lv.min) / (nxt.min - lv.min)) * 100 : 100;
  const userName = user?.name || 'طالب';
  const userEmail = user?.email || 'student@en5000.app';

  const filteredTopics = GRAMMAR_TOPICS.filter(tp => {
    if (gramCat && tp.cat !== gramCat) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tp.title.toLowerCase().includes(q) || tp.intro.toLowerCase().includes(q);
    }
    return true;
  });

  const goGrammarLesson = (topic, sIdx) => {
    setGramTopic(topic);
    setGramSection(sIdx);
    setSection('grammar-lesson');
  };

  const nav = (s) => {
    setSection(s);
    setQuizPhase(null);
    setExitConfirm(false);
    if (s === 'cs-quiz') { setQuizType('cs'); setIsCS(true); }
    else if (s === 'quiz') { setQuizType('general'); setIsCS(false); }
    if (s !== 'grammar' && s !== 'grammar-lesson') {
      setGramTopic(null);
      setGramSection(0);
    }
  };

  const resetQ = useCallback(() => { setSel(null); setInp(""); setRes(null); setHl(0); setShowA(false); setTries(0); setShkIdx(null); setPuzzleDone(false); setPuzzleOk(false); }, []);

  const awardXp = useCallback((amt) => { if (!amt) return; setSXp(s => s + amt); setXpPop("+" + amt + " XP"); setTimeout(() => setXpPop(null), 1100); }, []);

  const advance = useCallback((xpAmt) => {
    play("nxt");
    const isOk = xpAmt > 0; const curQ = qs[qi];
    if (!isOk && curQ) setWrongQs(w => [...w, { ...curQ }]);
    if (isOk && curQ?.en) speakEn(curQ.en);
    const nOk = ok + (isOk ? 1 : 0); const nStr = isOk ? cStreak + 1 : 0; setCStreak(nStr);
    let bonus = 0; if (nStr > 0 && (nStr === 5 || nStr === 10 || nStr === 20)) { bonus = nStr === 5 ? XP.s5 : nStr === 10 ? XP.s10 : XP.s20; play("stk"); setStkPop("+" + bonus + "🔥"); setTimeout(() => setStkPop(null), 1400); }
    awardXp(xpAmt + bonus);
    if (qi + 1 >= qs.length) {
      const total = sXp + xpAmt + bonus;
      const ns = progress.lastDate === ystStr() ? progress.streak + 1 : 1;
      const np = { ...progress, totalCorrect: progress.totalCorrect + nOk, totalAnswered: progress.totalAnswered + qs.length, xp: (progress.xp || 0) + total };
      if (!practice) Object.assign(np, { day: progress.day + 1, streak: ns, lastDate: toStr(), bestStreak: Math.max(progress.bestStreak || 0, ns) });
      if (isCS) { setProgress(np); sP(np, CS_PK); } else { setProgress(np); sP(np); }
      setOk(nOk); setSXp(total); setQuizPhase('results');
      if (!practice) recordPerf(Math.round(nOk / qs.length * 100));
      if (nOk >= qs.length * .9) play("done");
    } else { setOk(nOk); setQi(q => q + 1); resetQ(); setQKey(k => k + 1); }
  }, [ok, cStreak, qi, qs, sXp, progress, practice, isCS, awardXp, resetQ, play]);

  const handleMCQ = useCallback((i) => {
    if (sel !== null) return; setSel(i);
    if (i === qs[qi]?.c) { play("ok"); setPtcl(true); setTimeout(() => setPtcl(false), 700); }
    else { play("no"); setShkIdx(i); setTimeout(() => setShkIdx(null), 500); setHrt(h => Math.max(0, h - 1)); setWrongQs(w => [...w, { ...qs[qi], userAns: qs[qi].opts[i] }]); }
  }, [sel, qs, qi, play]);

  const handleWrite = useCallback(() => {
    if (!inp.trim() || showA) return;
    const r = checkAns(inp, qs[qi]?.en || ""); setRes(r); setTries(t => t + 1);
    if (r === "ok" || r === "close") { play(r === "ok" ? "ok" : "close"); setPtcl(true); setTimeout(() => setPtcl(false), 700); }
    else { play("no"); setShkIdx(-1); setTimeout(() => setShkIdx(null), 500); }
  }, [inp, showA, qs, qi, play]);

  const handleHint = useCallback(() => { play("hint"); setHl(h => Math.min(h + 1, 2)); setRes(null); setInp(""); }, [play]);
  const handleShowA = useCallback(() => { setShowA(true); setHrt(h => Math.max(0, h - 1)); play("no"); }, [play]);

  const startQuizFromStudy = useCallback(() => {
    setQi(0); setSel(null); setInp(""); setRes(null); setHl(0); setShowA(false);
    setTries(0); setOk(0); setSXp(0); setHrt(5); setCStreak(0); setShkIdx(null);
    setWrongQs([]); setQKey(k => k + 1); setQuizPhase('quiz');
  }, []);

  const startQuiz = async (diff, type = 'general') => {
    setQuizDifficulty(diff); setQuizType(type); setIsCS(type === 'cs'); setQuizPhase('gen');
    setGenTick(0); setGenMsgIdx(0);
    setHrt(5); setOk(0); setSXp(0); setCStreak(0); setWrongQs([]); setShowWrong(false);
    const effDiff = type === 'cs' ? diff : getAdaptDiff(diff);
    try {
      const cached = await lQ(diff, type === 'cs' ? CS_QK : QK);
      let questions = cached;
      if (!questions) { questions = await genQs(progress.day, effDiff, type === 'cs'); await sQ(diff, questions, type === 'cs' ? CS_QK : QK); }
      setQs(questions); setQi(0); resetQ(); setQKey(k => k + 1);
      setStudyIdx(0); setStudyFlipped(false); setQuizPhase('study');
    } catch (e) { setQuizPhase(null); }
  };

  useEffect(() => {
    if (quizPhase !== 'gen') return;
    const t = setInterval(() => setGenTick(x => x + 1), 80);
    return () => clearInterval(t);
  }, [quizPhase]);

  useEffect(() => {
    if (quizPhase !== 'gen') return;
    const msgs = isCS ? ["بنحمّل مصطلحات البرمجة...", "Loading CS phrases...", "Generating programming English...", "هنبدأ بعد شوية! 💻"] : ["Please be patient, we are loading...", "Almost there! AI is thinking...", "Crafting your Egyptian Arabic phrases...", "هنبدأ بعد شوية! 🚀"];
    const t = setInterval(() => setGenMsgIdx(x => (x + 1) % msgs.length), 2200);
    return () => clearInterval(t);
  }, [quizPhase, isCS]);

  useEffect(() => {
    if (quizPhase !== 'study') return;
    const fn = (e) => {
      if (e.key === "ArrowRight" || e.key === "d") { if (studyIdx + 1 < qs.length) { setStudyIdx(i => i + 1); setStudyFlipped(false); } else startQuizFromStudy(); }
      else if (e.key === "ArrowLeft" || e.key === "a") { if (studyIdx > 0) { setStudyIdx(i => i - 1); setStudyFlipped(false); } }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); play("flip"); setStudyFlipped(f => !f); }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [quizPhase, studyIdx, qs.length, startQuizFromStudy]);

  // Auto-speak English when study card flips
  useEffect(() => { if (quizPhase === 'study' && studyFlipped && qs[studyIdx]?.en) speakEn(qs[studyIdx].en); }, [quizPhase, studyFlipped, studyIdx, qs]);

  // Auto-speak when new quiz question appears
  useEffect(() => { if (quizPhase === 'quiz' && qs[qi]?.en) speakEn(qs[qi].en); }, [quizPhase, qKey, qs, qi]);

  useEffect(() => {
    if (quizPhase !== 'quiz') return;
    const q = qs[qi]; if (!q || q.qt !== "p") return;
    const words = q.en.split(/\s+/);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setPuzzleChips(shuffled.map((w, i) => ({ id: i + Math.random(), word: w, used: false })));
    setPuzzleAnswer([]); setPuzzleDone(false); setPuzzleOk(false);
  }, [quizPhase, qKey, qs, qi]);

  useEffect(() => {
    if (quizPhase !== 'quiz') return;
    const fn = (e) => {
      const k = e.key.toLowerCase(); const q = qs[qi]; if (!q) return;
      if (q.qt === "m") {
        if (sel !== null) { if (k === "enter" || k === " ") { e.preventDefault(); advance(sel === q.c ? XP.mcq : 0); } }
        else { const i = ["w", "a", "s", "d"].indexOf(k); if (i !== -1) { e.preventDefault(); handleMCQ(i); } }
      } else if (q.qt === "p") {
        if (puzzleDone && (k === "enter" || k === " ")) { e.preventDefault(); advance(puzzleOk ? XP.wrt0 : 0); }
      } else {
        const done = res !== null || showA;
        if (done) { if (k === "enter") { e.preventDefault(); const wXp = showA ? 0 : res === "ok" || res === "close" ? (hl === 0 ? XP.wrt0 : hl === 1 ? XP.wrt1 : XP.wrt2) : 0; advance(wXp); } }
        else if (k === "enter") { e.preventDefault(); handleWrite(); }
      }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [quizPhase, sel, res, showA, qs, qi, hl, advance, handleMCQ, handleWrite, puzzleDone, puzzleOk]);


  const styles = {
    root: { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Cairo', 'Inter', system-ui, sans-serif", background: t.root, color: t.txt, direction: 'ltr', transition: 'background .3s ease' },
    sidebar: {
      width: sidebarCollapsed ? 72 : 260,
      minWidth: sidebarCollapsed ? 72 : 260,
      background: darkMode
        ? 'linear-gradient(180deg, #0d1220 0%, #0a0e1a 100%)'
        : 'linear-gradient(180deg, #0c1222 0%, #0a0f1e 100%)',
      display: 'flex', flexDirection: 'column',
      borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'}`,
      position: 'relative', zIndex: 10,
      transition: 'width .3s cubic-bezier(.4,0,.2,1), min-width .3s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden'
    },
    sidebarLogo: {
      padding: sidebarCollapsed ? '20px 0' : '22px 20px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      borderBottom: '1px solid rgba(255,255,255,.04)',
      minHeight: 72
    },
    navItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 12,
      padding: sidebarCollapsed ? '11px 0' : '11px 16px',
      margin: sidebarCollapsed ? '2px 8px' : '2px 10px',
      borderRadius: 10, cursor: 'pointer', fontSize: 13,
      fontWeight: active ? 600 : 400,
      color: active ? '#fff' : '#6b7a90',
      background: active ? 'linear-gradient(135deg, rgba(59,130,246,.2), rgba(99,102,241,.12))' : 'transparent',
      transition: 'all .2s',
      border: 'none',
      width: sidebarCollapsed ? 'calc(100% - 16px)' : 'calc(100% - 20px)',
      textAlign: 'left',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      position: 'relative',
      fontFamily: 'inherit',
      ...(active ? { boxShadow: '0 2px 12px rgba(59,130,246,.15)' } : {})
    }),
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all .3s' },
    header: {
      height: 60, minHeight: 60,
      background: t.glass,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${t.glassBd}`,
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 16, direction: 'ltr'
    },
    content: { flex: 1, overflow: 'auto', padding: 28 },
    sectionTitle: { fontSize: 22, fontWeight: 700, color: t.txt, marginBottom: 24, letterSpacing: '-.02em' },
  };

  const renderHeader = () => (
    <div style={styles.header}>
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: t.s1, border: `1px solid ${t.bd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: t.m, cursor: 'pointer', transition: 'all .2s',
          flexShrink: 0
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${darkMode ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.04)'}`; e.currentTarget.style.color = t.txt; }}
        onMouseLeave={e => { e.currentTarget.style.background = t.s1; e.currentTarget.style.color = t.m; }}
      >
        {sidebarCollapsed ? '☰' : '✕'}
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', background: t.s1, borderRadius: 10, border: `1px solid ${t.bdS}`, padding: '0 12px', animation: 'scaleIn .15s ease' }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث في القواعد..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 10px', fontSize: 13, color: t.txt, fontFamily: 'inherit', width: 200, direction: 'rtl' }} />
            <span onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ cursor: 'pointer', fontSize: 14, color: t.m, padding: 4 }}>✕</span>
          </div>
        ) : (
          <button onClick={() => { setSearchOpen(true); setSection('grammar'); }} style={{ background: t.s1, border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: t.m, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.bdS; e.currentTarget.style.color = t.txt; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.color = t.m; }}
          >
            <span>🔍</span><span>بحث...</span>
          </button>
        )}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(!showNotif)} style={{ background: t.s1, border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 16, position: 'relative', transition: 'all .2s', fontFamily: 'inherit' }}>
            🔔
            {progress.streak > 0 && <span style={{ position: 'absolute', top: 5, left: 5, width: 7, height: 7, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px rgba(239,68,68,.5)' }} />}
          </button>
          {showNotif && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: t.s2, border: `1px solid ${t.bd}`, borderRadius: 14, padding: 18, width: 280, boxShadow: '0 12px 40px rgba(0,0,0,.12)', zIndex: 100, animation: 'scaleIn .15s ease' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>الإشعارات</div>
              {progress.streak > 0 && <div style={{ fontSize: 13, color: t.s, padding: '10px 0', borderBottom: `1px solid ${t.bd}` }}>🔥 سلسلة نشاط {progress.streak} يوم!</div>}
              <div style={{ fontSize: 13, color: t.s, padding: '10px 0', borderBottom: `1px solid ${t.bd}` }}>📚 اكمل اختبار اليوم!</div>
              <div style={{ fontSize: 13, color: t.m, padding: '10px 0' }}>🌟 حصل على {progress.xp} نقطة خبرة</div>
            </div>
          )}
        </div>
        <div onClick={() => nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.s1, borderRadius: 10, padding: '6px 14px 6px 6px', border: `1px solid ${t.bd}`, cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = t.bdS}
          onMouseLeave={e => e.currentTarget.style.borderColor = t.bd}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: user?.photo ? '#000' : lv.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, overflow: 'hidden', flexShrink: 0, boxShadow: `0 2px 8px ${lv.c}30` }}>{user?.photo ? <img src={user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : userName.charAt(0)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.txt }}>{userName}</div>
            <div style={{ fontSize: 11, color: t.m }}>{lv.i} {lv.n}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div style={styles.sidebar}>
      <div style={styles.sidebarLogo}>
        <img src="/logo.png" alt="EN-5000" style={{
          width: sidebarCollapsed ? 36 : 40,
          height: sidebarCollapsed ? 36 : 40,
          borderRadius: 12, objectFit: 'cover',
          transition: 'all .3s',
          boxShadow: '0 2px 12px rgba(59,130,246,.2)'
        }} />
        {!sidebarCollapsed && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-.01em' }}>EN-5000</div>
            <div style={{ color: '#5a6578', fontSize: 11 }}>تعلم الإنجليزي</div>
          </div>
        )}
      </div>
      <div style={{ padding: '8px 0', flex: 1, overflow: 'auto' }}>
        {NAV_ITEMS.map((n, idx) => (
          <button key={n.id} style={{ ...styles.navItem(section === n.id), animationDelay: `${idx * 30}ms` }}
            onClick={() => nav(n.id)}
            title={sidebarCollapsed ? n.label : undefined}
            onMouseEnter={e => { if (section !== n.id) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#c8d0de'; }}
            onMouseLeave={e => { if (section !== n.id) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7a90'; }}
          >
            {section === n.id && !sidebarCollapsed && (
              <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: 2, background: '#3B82F6' }} />
            )}
            <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{n.icon}</span>
            {!sidebarCollapsed && <span>{n.label}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: sidebarCollapsed ? '12px 8px' : '14px 16px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: sidebarCollapsed ? '10px 0' : '10px 12px',
          borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,.03)', border: 'none',
          color: '#6b7a90', fontSize: 13, width: '100%', marginBottom: 8, fontFamily: 'inherit',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          transition: 'all .2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#c8d0de'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = '#6b7a90'; }}
        >
          <span style={{ fontSize: 16 }}>{darkMode ? '☀️' : '🌙'}</span>
          {!sidebarCollapsed && <span>{darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>}
        </button>
        <div style={{ padding: "8px 12px", fontSize: 11, color: cloudConnected ? "#22C55E" : "#5a6578", display: "flex", alignItems: "center", gap: 6, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: cloudConnected ? "#22C55E" : "#5a6578", display: "inline-block", boxShadow: cloudConnected ? '0 0 6px rgba(34,197,94,.5)' : 'none' }} />
          {!sidebarCollapsed && (syncing ? "جاري المزامنة..." : cloudConnected ? "متصل بالسحابة" : "محلي فقط")}
        </div>
        {!sidebarCollapsed && (
          <>
            <button onClick={() => cloudPull()} style={{ width: "100%", padding: "6px", borderRadius: 8, border: `1px solid rgba(59,130,246,.2)`, background: "rgba(59,130,246,.06)", color: "#3B82F6", fontSize: 11, cursor: "pointer", textAlign: "center", marginBottom: 8, fontFamily: 'inherit', transition: 'all .2s' }}>
              🔄 مزامنة الآن
            </button>
            <a href="/#/app" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#6b7a90', fontSize: 13, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c8d0de'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7a90'}
            >
              <span>📱</span><span>النسخة المحمولة</span>
            </a>
          </>
        )}
      </div>
    </div>
  );

  const renderQuizSection = () => {
    const isCS = quizType === 'cs';
    const qLv = isCS ? CS_LC : LC;

    if (quizPhase === 'gen') {
      const msgs = isCS ? ["بنحمّل مصطلحات البرمجة...", "Loading CS phrases...", "Generating programming English...", "هنبدأ بعد شوية! 💻"] : ["Please be patient, we are loading...", "Almost there! AI is thinking...", "Crafting your Egyptian Arabic phrases...", "هنبدأ بعد شوية! 🚀"];
      const chars = isCS ? ["C", "++", "{}", "[]", "AI", "py", "js", "//", ">_", "ls", "git", "λ"] : ["A", "أ", "B", "ب", "C", "ت", "D", "ث", "E", "ج", "F", "ح"];
      const N = 12, R = 88;
      const lc = qLv[quizDifficulty] || qLv.Easy;
      return (
        <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 210, height: 210, marginBottom: 28 }}>
            {Array.from({ length: N }, (_, i) => { const angle = (i / N) * 360 + (genTick * 2.8), rad = angle * Math.PI / 180, x = 105 + R * Math.cos(rad) - 16, y = 105 + R * Math.sin(rad) - 14; const p2 = (i / N + genTick * .012) % 1, sc = 0.7 + p2 * 0.6, al = 0.25 + p2 * 0.75, ch = chars[i % chars.length]; return (<div key={i} style={{ position: 'absolute', left: x, top: y, minWidth: 28, height: 28, borderRadius: 7, background: lc.fill, opacity: al, transform: `scale(${sc})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'monospace', boxShadow: `0 0 8px ${lc.fill}66`, padding: '0 4px' }}>{ch}</div>); })}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 88, height: 88, borderRadius: '50%', background: lc.bg, border: `3px solid ${lc.br}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}><div style={{ fontSize: 22 }}>{isCS ? "💻" : "🎓"}</div><div style={{ fontSize: 9, fontWeight: 700, color: lc.tx }}>{isCS ? "CS" : "DAY"} {quizDifficulty}</div></div>
          </div>
          <div style={{ height: 28, marginBottom: 10, overflow: 'hidden', position: 'relative', width: '100%', maxWidth: 340 }}>
            <p key={genMsgIdx} style={{ fontSize: 14, fontWeight: 600, color: t.txt, margin: 0, animation: 'fadeIn .3s ease', position: 'absolute', width: '100%', left: 0, fontFamily: "'Cairo', sans-serif" }}>{msgs[genMsgIdx]}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 22 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: lc.fill, opacity: .7, animation: `pulse 1.4s ease ${i * .22}s infinite` }} />)}</div>
          <div style={{ background: t.s1, border: `1px solid ${t.bd}`, borderRadius: 12, padding: '12px 18px', maxWidth: 300 }}><p style={{ fontSize: 11, color: t.m, margin: 0, lineHeight: 1.6 }}>{isCS ? "💡 كل سؤال فيه النطق الإنجليزي بالعربي" : "💡 كل سؤال فيه كيفية نطق الإنجليزي بالعربي — زي \"هاو أر يو؟\""}</p></div>
        </div>
      );
    }

    if (quizPhase === 'study' && qs.length > 0) {
      const q = qs[studyIdx];
      const doneAll = studyIdx >= qs.length - 1;
      const lc = qLv[quizDifficulty] || qLv.Easy;
      return (
        <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => { setQuizPhase(null); }} style={{ background: 'transparent', border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 16px', color: t.m, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.bdS; e.currentTarget.style.color = t.txt; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.color = t.m; }}
            >← خروج</button>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 13, fontWeight: 600, color: t.txt }}>{isCS ? "💻" : "🗣️"} مراجعة</div><div style={{ fontSize: 11, color: t.m }}>{studyIdx + 1} / {qs.length}</div></div>
            <button onClick={startQuizFromStudy} style={{ background: lc.fill, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>ابدأ الاختبار ←</button>
          </div>
          <div style={{ height: 4, background: t.s1, borderRadius: 2, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: '100%', width: `${((studyIdx + 1) / qs.length * 100).toFixed(1)}%`, background: lc.fill, borderRadius: 2, transition: 'width .3s' }} />
          </div>
          <div onClick={() => { play("flip"); setStudyFlipped(f => !f); }} style={{ background: studyFlipped ? lc.bg : t.s2, border: `1px solid ${studyFlipped ? lc.br : t.glassBd}`, borderRadius: 16, padding: 24, cursor: 'pointer', textAlign: 'center', minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'all .2s', userSelect: 'none', boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,.2)' : '0 2px 12px rgba(0,0,0,.04)' }}>
            {!studyFlipped ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: lc.tx, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>{q.cat}</div>
                <div style={{ direction: 'rtl', fontSize: 24, fontWeight: 700, fontFamily: "'Cairo', sans-serif", color: t.txt, lineHeight: 1.7 }}>{q.ar}</div>
                <p style={{ fontSize: 12, color: t.m, marginTop: 12 }}>👆 اضغط لتشوف الإجابة والنطق</p>
                <p style={{ fontSize: 11, color: t.m, marginTop: 4, opacity: .6 }}>Space / Enter to flip</p>
              </>
            ) : (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: lc.tx, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>{q.cat} ✓</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: t.txt, fontFamily: "'Inter', sans-serif", lineHeight: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span>{q.en}</span>
                  <button onClick={(e) => { e.stopPropagation(); speakEn(q.en); }} style={{ background: lc.fill, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 16, cursor: 'pointer', flexShrink: 0 }} title="Listen">🔊</button>
                </div>
                {q.pron && <div style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: lc.bg, border: `1px solid ${lc.br}` }}><div style={{ fontSize: 10, fontWeight: 600, color: lc.tx, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>النطق بالعربي</div><div style={{ direction: 'rtl', fontSize: 18, fontWeight: 600, color: t.txt, fontFamily: "'Cairo', sans-serif", lineHeight: 1.6 }}>{q.pron}</div></div>}
                <p style={{ fontSize: 11, color: t.m, marginTop: 12, opacity: .7 }}>👆 اضغط للرجوع</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button disabled={studyIdx === 0} onClick={() => { setStudyIdx(i => i - 1); setStudyFlipped(false); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${studyIdx === 0 ? t.bd : lc.fill}`, background: studyIdx === 0 ? 'transparent' : lc.bg, color: studyIdx === 0 ? t.m : lc.tx, fontSize: 13, fontWeight: 600, cursor: studyIdx === 0 ? 'not-allowed' : 'pointer', opacity: studyIdx === 0 ? .4 : 1, fontFamily: 'inherit', transition: 'all .2s' }}>← السابق</button>
            <button onClick={() => { if (!doneAll) { setStudyIdx(i => i + 1); setStudyFlipped(false); } else startQuizFromStudy(); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: doneAll ? lc.fill : t.s1, color: doneAll ? '#fff' : t.txt, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>{doneAll ? "🚀 ابدأ الاختبار ←" : "التالي →"}</button>
          </div>
          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            {Array.from({ length: Math.min(qs.length, 25) }, (_, i) => { const dotIdx = Math.floor(i / 25 * qs.length); return (<div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= Math.floor(studyIdx / qs.length * 25) ? lc.fill : 'rgba(128,128,128,.22)', transition: 'background .2s' }} />); })}
          </div>
          <button onClick={startQuizFromStudy} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${lc.fill}40`, marginTop: 16, transition: 'all .2s' }}>🚀 أنا مستعد! ابدأ الاختبار ({qs.length} سؤال)</button>
          <p style={{ textAlign: 'center', fontSize: 11, color: t.m, marginTop: 8 }}>← → arrow keys · Space to flip</p>
        </div>
      );
    }

    if (quizPhase === 'quiz' && qs[qi]) {
      const q = qs[qi]; const isMCQ = q.qt === "m"; const isPuzzle = q.qt === "p";
      const lc = qLv[quizDifficulty] || qLv.Easy;
      const pp = (qi / qs.length * 100).toFixed(1);
      const mcqDone = isMCQ && sel !== null, mcqOk = isMCQ && sel === q.c;
      const wDone = (!isMCQ && !isPuzzle) && (res !== null || showA), wOk = (!isMCQ && !isPuzzle) && (res === "ok" || res === "close");
      const done = mcqDone || wDone || puzzleDone, corr = mcqOk || wOk || puzzleOk;
      const gSt = (i) => sel === null ? "idle" : i === q.c ? "ok" : i === sel ? "bad" : "dim";
      const wXp = showA ? 0 : (res === "ok" || res === "close") ? (hl === 0 ? XP.wrt0 : hl === 1 ? XP.wrt1 : XP.wrt2) : 0;
      return (
        <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
          {exitConfirm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <GlassCard dark={darkMode} hover={false} style={{ maxWidth: 340, width: '88%', textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🚪</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.txt, marginBottom: 8 }}>Exit quiz?</h3>
              <p style={{ fontSize: 13, color: t.m, marginBottom: 20 }}>هتعوز تخرج من الكويز؟</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setExitConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: `1px solid ${t.bdS}`, background: t.s1, color: t.txt, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↩ متابعة</button>
                <button onClick={() => { setExitConfirm(false); setQuizPhase(null); }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>خروج ✕</button>
              </div>
            </GlassCard>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setExitConfirm(true)} style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 7, padding: '4px 10px', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✕ خروج</button>
              <span style={{ fontSize: 11, fontWeight: 700, color: lc.tx, background: lc.bg, border: `1px solid ${lc.br}`, padding: '2px 8px', borderRadius: 20 }}>{isCS ? "💻" : "🗣️"} {quizDifficulty}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ fontSize: 17, opacity: i < hrt ? 1 : .18, transition: 'opacity .3s' }}>❤️</span>)}
            </div>
          </div>
          <div style={{ height: 5, background: t.s1, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}><div style={{ height: '100%', width: `${pp}%`, background: lc.fill, borderRadius: 3, transition: 'width .35s' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: t.m }}>Q {qi + 1}/{qs.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {stkPop && <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', animation: 'fadeIn .3s ease' }}>{stkPop}</span>}
              {xpPop && <span style={{ fontSize: 12, fontWeight: 700, color: lc.tx, animation: 'fadeIn .3s ease' }}>{xpPop}</span>}
              <span style={{ fontSize: 13, fontWeight: 700, color: lc.tx }}>✓ {ok}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: isMCQ ? '#3B82F6' : isPuzzle ? '#F59E0B' : '#8B5CF6', background: isMCQ ? 'rgba(59,130,246,.1)' : isPuzzle ? 'rgba(245,158,11,.1)' : 'rgba(139,92,246,.1)', border: `1px solid ${isMCQ ? 'rgba(59,130,246,.25)' : isPuzzle ? 'rgba(245,158,11,.25)' : 'rgba(139,92,246,.25)'}`, padding: '2px 8px', borderRadius: 20 }}>{isMCQ ? "⊙ MCQ" : isPuzzle ? "🧩 PUZZLE" : "✍️ TYPE"}</span>
            <span style={{ fontSize: 10, color: t.m }}>{q.cat}</span>
          </div>
          <div key={qKey} style={{ background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 16, padding: '20px 24px', marginBottom: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ direction: 'rtl', fontSize: 24, fontWeight: 700, lineHeight: 1.7, color: t.txt, fontFamily: "'Cairo', sans-serif" }}>{q.ar}</div>
              <button onClick={() => speakEn(q.en)} style={{ background: lc.fill, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 16, cursor: 'pointer', flexShrink: 0 }} title="Listen">🔊</button>
            </div>
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: t.s1, border: `1px solid ${t.bd}` }}><div style={{ fontSize: 10, fontWeight: 600, color: t.m, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>اضغط على الكلمة لترجمتها</div><WordTrans text={q.en} T={t} lv={lc} /></div>
            <p style={{ fontSize: 12, color: t.m, marginTop: 4 }}>{isMCQ ? "اختار الترجمة الصح" : isPuzzle ? "رتّب الكلمات عشان تكوّن الجملة" : "اكتب الترجمة الصح بالإنجليزي"}</p>
            {ptcl && [0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} style={{ position: 'absolute', top: '50%', left: `${4 + i * 12}%`, width: 10, height: 10, borderRadius: '50%', background: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'][i], opacity: 0, animation: 'fadeIn .3s ease', pointerEvents: 'none' }} />)}
          </div>
          {isMCQ && <div style={{ animation: 'fadeIn .3s ease' }}>
            {q.opts.map((opt, i) => { const st = gSt(i); const sh = shkIdx === i; return (<button key={i} onClick={() => handleMCQ(i)} disabled={mcqDone} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 12, fontSize: 14, marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: mcqDone ? 'default' : 'pointer', border: `1px solid ${st === "ok" ? '#22C55E' : st === "bad" ? '#EF4444' : t.bd}`, background: st === "ok" ? 'rgba(34,197,94,.12)' : st === "bad" ? 'rgba(239,68,68,.12)' : t.s1, color: st === "ok" ? '#16A34A' : st === "bad" ? '#DC2626' : t.txt, opacity: st === "dim" ? .28 : 1, animation: sh ? 'shkIdx .5s ease' : undefined, fontFamily: 'inherit', transition: 'all .15s' }}><span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: st === "ok" ? '#22C55E' : st === "bad" ? '#EF4444' : t.s2, color: st === "ok" || st === "bad" ? '#fff' : t.m, border: `1px solid ${st === "ok" ? '#22C55E' : st === "bad" ? '#EF4444' : t.bd}` }}>{String.fromCharCode(65 + i)}</span><span style={{ flex: 1 }}>{opt}</span>{st === "ok" && <span>✓</span>}{st === "bad" && <span>✗</span>}</button>); })}
            {!mcqDone && <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4, opacity: .35 }}>{["W", "A", "S", "D"].map((k, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: t.m }}><span style={{ background: t.s2, border: `1px solid ${t.bd}`, borderRadius: 3, padding: '0 5px', fontFamily: 'monospace', fontSize: 10 }}>{k}</span>→{["A", "B", "C", "D"][i]}</span>)}</div>}
              {mcqDone && <div style={{ animation: 'fadeIn .3s ease' }}>
              <PronBox pron={q.pron} theme={t} lv={lc} en={q.en} />
              <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 12, background: mcqOk ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${mcqOk ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, color: mcqOk ? '#16A34A' : '#DC2626', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{mcqOk ? `✓ Correct! ممتاز! (+${XP.mcq} XP) 🎉` : `✗ Wrong! The answer is: "${q.en}"`}</div>
              <button onClick={() => advance(mcqOk ? XP.mcq : 0)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${lc.fill}30` }}>{qi + 1 >= qs.length ? "عرض النتائج →" : "التالي →"} <span style={{ fontSize: 12, opacity: .7 }}>(Enter)</span></button>
            </div>}
          </div>}
          {!isMCQ && !isPuzzle && <div style={{ animation: 'fadeIn .3s ease' }}>
            {hl > 0 && !wDone && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 10, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', color: '#D97706', fontSize: 14, letterSpacing: 1.5, fontFamily: 'monospace' }}>💡 {mkHint(q.en, hl)}</div>}
            {!wDone && <>
              <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && handleWrite()} placeholder="Type the English translation here..." dir="ltr" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${t.bd}`, background: t.s1, color: t.txt, fontSize: 16, boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui', marginBottom: 10, transition: 'border-color .2s' }} />
              <button onClick={handleWrite} disabled={!inp.trim()} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: inp.trim() ? lc.fill : t.s1, color: inp.trim() ? '#fff' : t.m, fontSize: 14, fontWeight: 600, cursor: inp.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>Check ✓ <span style={{ fontSize: 12, opacity: .7 }}>(Enter)</span></button>
              <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                {hl < 2 && <button onClick={handleHint} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(245,158,11,.25)', background: 'rgba(245,158,11,.08)', color: '#D97706', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>💡 Hint {hl + 1}/2</button>}
                {(tries >= 2 || hl >= 2) && !showA && <button onClick={handleShowA} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.08)', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>👁 Show answer</button>}
              </div>
            </>}
            {wDone && <div style={{ animation: 'fadeIn .3s ease' }}>
              <PronBox pron={q.pron} theme={t} lv={lc} en={q.en} />
              <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 12, background: wOk ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${wOk ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, color: wOk ? '#16A34A' : '#DC2626', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{showA ? `👁 Answer: "${q.en}"` : res === "ok" ? `✓ Perfect! (+${wXp} XP) 🎉` : res === "close" ? `✓ Close! Answer: "${q.en}" (+${wXp} XP) 👍` : `✗ Wrong! Answer: "${q.en}"`}</div>
              {!wOk && !showA && tries <= 3 && <button onClick={() => { setRes(null); setInp(""); }} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(59,130,246,.25)', background: 'rgba(59,130,246,.08)', color: '#2563EB', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>🔄 Try again</button>}
              <button onClick={() => advance(wOk ? wXp : 0)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${lc.fill}30` }}>{qi + 1 >= qs.length ? "عرض النتائج →" : "التالي →"} <span style={{ fontSize: 12, opacity: .7 }}>(Enter)</span></button>
            </div>}
          </div>}
          {isPuzzle && !puzzleDone && <div style={{ animation: 'fadeIn .3s ease', marginBottom: 12 }}>
            <div style={{ background: t.s1, border: `2px dashed ${t.bdS}`, borderRadius: 14, padding: puzzleAnswer.length ? '12px' : '20px', marginBottom: 12, minHeight: 50, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
              {puzzleAnswer.length === 0 && <span style={{ fontSize: 13, color: t.m, fontFamily: "'Cairo', sans-serif" }}>اضبط الكلمات هنا 👇</span>}
              {puzzleAnswer.map((chip, i) => (
                <span key={chip.id} onClick={() => { setPuzzleAnswer(a => a.filter((_, j) => j !== i)); setPuzzleChips(ch => ch.map(c => c.id === chip.id ? { ...c, used: false } : c)); }}
                  style={{ padding: '7px 14px', borderRadius: 10, background: lc.fill, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 6px ${lc.fill}40`, userSelect: 'none', transition: 'transform .1s' }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(.92)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>{chip.word}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
              {puzzleChips.map(chip => (
                <span key={chip.id} onClick={() => { if (!chip.used) { setPuzzleAnswer(a => [...a, chip]); setPuzzleChips(ch => ch.map(c => c.id === chip.id ? { ...c, used: true } : c)); } }}
                  style={{ padding: '7px 14px', borderRadius: 10, background: chip.used ? 'rgba(128,128,128,.08)' : t.s2, color: chip.used ? 'rgba(128,128,128,.3)' : t.txt, fontSize: 14, fontWeight: 600, cursor: chip.used ? 'default' : 'pointer', border: `1.5px solid ${chip.used ? 'transparent' : t.bd}`, opacity: chip.used ? .35 : 1, transition: 'all .15s', userSelect: 'none', transform: chip.used ? 'scale(.9)' : 'none' }}>{chip.word}</span>
              ))}
            </div>
            <button onClick={() => { const userStr = puzzleAnswer.map(c => c.word).join(" "); const ok = userStr.toLowerCase().trim() === q.en.toLowerCase().trim(); setPuzzleOk(ok); setPuzzleDone(true); if (!ok) setHrt(h => Math.max(0, h - 1)); if (!ok) setWrongQs(w => [...w, { ...q }]); }} disabled={puzzleAnswer.length === 0} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: puzzleAnswer.length ? lc.fill : t.s1, color: puzzleAnswer.length ? '#fff' : t.m, fontSize: 14, fontWeight: 600, cursor: puzzleAnswer.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>Check ✓</button>
          </div>}
          {isPuzzle && puzzleDone && <div style={{ animation: 'fadeIn .3s ease', marginBottom: 12 }}>
            <PronBox pron={q.pron} theme={t} lv={lc} en={q.en} />
            <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 12, background: puzzleOk ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${puzzleOk ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, color: puzzleOk ? '#16A34A' : '#DC2626', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{puzzleOk ? `✓ Perfect! 🎉 (+${XP.wrt0} XP)` : `✗ Wrong! The correct sentence is:\n"${q.en}"`}</div>
            <button onClick={() => advance(puzzleOk ? XP.wrt0 : 0)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${lc.fill}30` }}>{qi + 1 >= qs.length ? "عرض النتائج →" : "التالي →"} <span style={{ fontSize: 12, opacity: .7 }}>(Enter)</span></button>
          </div>}
        </div>
      );
    }

    if (quizPhase === 'results') {
      const pd = Math.round(ok / Math.max(qs.length, 1) * 100);
      const g = pd >= 90 ? { e: "🏆", ar: "ممتاز يا بطل! 🎉" } : pd >= 75 ? { e: "⭐", ar: "عظيم! استمر!" } : pd >= 60 ? { e: "👍", ar: "كويس! ركز أكتر" } : { e: "💪", ar: "لا تستسلم! التكرار مفتاح" };
      const lc = qLv[quizDifficulty] || qLv.Easy;
      const uniqueWrong = [...new Map(wrongQs.map(q => [q.ar, q])).values()];
      return (
        <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
          <div style={{ background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>{g.e}</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: t.txt, marginBottom: 4 }}>{isCS ? "💻 CS " : ""}{quizDifficulty} Complete!</h2>
            <div style={{ direction: 'rtl', fontSize: 17, fontWeight: 700, color: lc.tx, fontFamily: "'Cairo', sans-serif", lineHeight: 1.6 }}>{g.ar}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[{ v: `${ok}/${qs.length}`, l: "score", c: lc.tx }, { v: `+${sXp}`, l: "XP earned", c: "#F59E0B" }, { v: `${pd}%`, l: "accuracy" }].map((s, i) => (
              <GlassCard key={i} dark={darkMode} hover={false} style={{ textAlign: 'center', padding: '16px 12px' }}><div style={{ fontSize: 17, fontWeight: 700, color: s.c || t.txt }}>{s.v}</div><div style={{ fontSize: 11, color: t.m, marginTop: 2 }}>{s.l}</div></GlassCard>
            ))}
          </div>
          {uniqueWrong.length > 0 && <GlassCard dark={darkMode} hover={false} style={{ border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.04)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showWrong ? 12 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 16 }}>❌</span>
                <div><div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{uniqueWrong.length} Wrong Answer{uniqueWrong.length > 1 ? "s" : ""}</div><div style={{ fontSize: 11, color: t.m }}>المراجعة قبل ما تعيد</div></div>
              </div>
              <button onClick={() => setShowWrong(w => !w)} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#DC2626', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{showWrong ? "Hide ▲" : "Review ▼"}</button>
            </div>
            {showWrong && <div>
              {uniqueWrong.map((q, i) => (
                <div key={i} style={{ background: t.s1, borderRadius: 10, padding: '12px 16px', marginBottom: 8, border: `1px solid ${t.bd}` }}>
                  <div style={{ direction: 'rtl', fontSize: 16, fontWeight: 600, fontFamily: "'Cairo', sans-serif", color: t.txt, marginBottom: 6 }}>{q.ar}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: q.pron ? 6 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', padding: '2px 8px', borderRadius: 20 }}>✓</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: t.txt }}>{q.en}</span>
                  </div>
                  {q.pron && <div style={{ direction: 'rtl', fontSize: 14, fontWeight: 600, fontFamily: "'Cairo', sans-serif", color: lc.tx, background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 7, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span>🔊</span><span>{q.pron}</span></div>}
                  {q.userAns && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 5, fontStyle: 'italic' }}>You answered: "{q.userAns}"</div>}
                </div>
              ))}
              <button onClick={() => { setPractice(true); setQs(uniqueWrong); setStudyIdx(0); setStudyFlipped(false); setQi(0); setSel(null); setInp(""); setRes(null); setHl(0); setShowA(false); setTries(0); setOk(0); setSXp(0); setHrt(5); setCStreak(0); setShkIdx(null); setWrongQs([]); setShowWrong(false); setQKey(k => k + 1); setQuizPhase('study'); }} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>📚 Study these {uniqueWrong.length} again</button>
            </div>}
          </GlassCard>}
          <button onClick={() => { setQuizPhase(null); setPractice(false); }} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: lc.fill, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 16px ${lc.fill}30` }}>← العودة للرئيسية</button>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
        <h2 style={styles.sectionTitle}>{isCS ? 'اختبار البرمجة 💻' : 'اختبار الإنجليزي 📝'}</h2>
        <GlassCard dark={darkMode} hover={false}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: t.txt, marginBottom: 8 }}>{isCS ? 'تعلم مصطلحات البرمجة بالإنجليزي' : 'اختبر مستواك في الإنجليزي'}</h3>
          <p style={{ color: t.m, margin: '0 0 24px', fontSize: 14 }}>اختار مستوى الصعوبة وابدأ الاختبار — MCQ + كتابة + ألغاز</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DIFF_ORDER.map(d => {
              const lc = isCS ? CS_LC[d] : LC[d];
              return (
                <div key={d} onClick={() => startQuiz(d, quizType)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 12, cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${lc.fill}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: 28 }}>{DIFF_EMOJI[d]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: lc.tx, fontSize: 15 }}>{DIFF_LABELS[d]}</div>
                    <div style={{ fontSize: 12, color: t.m, marginTop: 2 }}>
                      {isCS ? (d === 'Easy' ? 'Linux Basics, Git, Developer Phrases' : d === 'Medium' ? 'C/C++, Python, Debugging' : 'AI/ML, Algorithms, Architecture') : (d === 'Easy' ? 'أسئلة يومية بسيطة — تحيات، أرقام' : d === 'Medium' ? 'سفر، شغل، صحة' : 'تعبيرات، عمل رسمي')}
                    </div>
                  </div>
                  <span style={{ color: lc.tx, fontSize: 18 }}>←</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderHome = () => {
    const weekData = [
      { label: 'س', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'م', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'ت', value: Math.floor(Math.random() * 20) + 5, color: '#6366F1' },
      { label: 'و', value: Math.floor(Math.random() * 20) + 5, color: '#6366F1' },
      { label: 'خ', value: Math.floor(Math.random() * 20) + 5, color: '#8B5CF6' },
      { label: 'ف', value: Math.floor(Math.random() * 20) + 5, color: '#8B5CF6' },
      { label: 'س', value: Math.floor(Math.random() * 20) + 5, color: '#EC4899' },
    ];

    return (
      <div style={{ animation: 'fadeIn .3s ease' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-.02em' }}>مرحباً، {userName}! 👋</h1>
          <p style={{ color: t.m, margin: '6px 0 0', fontSize: 15 }}>استمر في التعلم، أنت على الطريق الصح</p>
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="⭐" label="نقاط الخبرة" value={progress.xp} color="#F59E0B" dark={darkMode} />
          <StatCard icon="🔥" label="سلسلة الأيام" value={progress.streak} color="#EF4444" dark={darkMode} />
          <StatCard icon="✅" label="أسئلة صحيحة" value={progress.totalCorrect} color="#22C55E" dark={darkMode} />
          <StatCard icon="📊" label="إجمالي الأسئلة" value={progress.totalAnswered} color="#3B82F6" dark={darkMode} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <GlassCard dark={darkMode}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: t.txt }}>مستوى التقدم</h3>
              <span style={{ background: `${lv.c}18`, color: lv.c, padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${lv.c}20` }}>{lv.i} {lv.n}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <AccuracyRing accuracy={nextLvlProg} size={100} stroke={7} dark={darkMode} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: t.m, marginBottom: 8 }}>{progress.xp} / {nxt ? nxt.min : '∞'} XP</div>
                <div style={{ height: 6, background: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(nextLvlProg, 100)}%`, background: `linear-gradient(90deg, ${lv.c}, ${lv.c}cc)`, borderRadius: 3, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                </div>
                {nxt && <div style={{ fontSize: 11, color: t.m, marginTop: 8 }}>المستوى القادم: {nxt.i} {nxt.n}</div>}
              </div>
            </div>
          </GlassCard>

          <GlassCard dark={darkMode}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: t.txt }}>نشاط هذا الأسبوع</h3>
            <BarChart data={weekData} dark={darkMode} />
          </GlassCard>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14, color: t.txt }}>ابدأ التعلم</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { icon: '📝', title: 'اختبار الإنجليزي', desc: 'اختبر معلوماتك في الإنجليزي اليومية', color: '#3B82F6', sec: 'quiz' },
            { icon: '📖', title: 'قواعد اللغة', desc: `${GRAMMAR_TOPICS.length} موضوع قواعد مفصل`, color: '#22C55E', sec: 'grammar' },
            { icon: '💻', title: 'اختبار البرمجة', desc: 'تعلم مصطلحات البرمجة بالإنجليزي', color: '#8B5CF6', sec: 'cs-quiz' },
          ].map((c, i) => (
            <GlassCard key={i} dark={darkMode} onClick={() => nav(c.sec)} style={{ padding: '20px 22px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                marginBottom: 14, border: `1px solid ${c.color}15`
              }}>{c.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: t.txt }}>{c.title}</div>
              <div style={{ fontSize: 12, color: t.m, lineHeight: 1.5 }}>{c.desc}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  const renderGrammar = () => {
    if (gramTopic) {
      const topic = gramTopic;
      const sec = topic.sections[gramSection];
      return (
        <div style={{ animation: 'fadeIn .3s ease' }}>
          <button onClick={() => { setGramTopic(null); setGramSection(0); }} style={{ background: 'transparent', border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 16px', color: t.m, fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.bdS; e.currentTarget.style.color = t.txt; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.color = t.m; }}
          >
            <span>→</span> العودة لقائمة المواضيع
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(59,130,246,.12), rgba(99,102,241,.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '1px solid rgba(59,130,246,.15)' }}>{topic.icon}</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.txt }}>{topic.title}</h2>
              <p style={{ color: t.m, margin: '4px 0 0', fontSize: 13 }}>{sec.title} — {gramSection + 1}/{topic.sections.length}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {topic.sections.map((s, i) => (
              <button key={i} onClick={() => setGramSection(i)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: `1px solid ${i === gramSection ? '#3B82F6' : t.bd}`,
                background: i === gramSection ? '#3B82F6' : 'transparent',
                color: i === gramSection ? '#fff' : t.m,
                transition: 'all .2s', fontFamily: 'inherit',
                boxShadow: i === gramSection ? '0 2px 8px rgba(59,130,246,.25)' : 'none'
              }}>{i + 1}</button>
            ))}
          </div>
          <GlassCard dark={darkMode} hover={false}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: '#3B82F6' }}>{sec.title}</h3>
            <div style={{ fontSize: 15, lineHeight: 1.9, color: t.txt }} dangerouslySetInnerHTML={{ __html: sec.content }} />
          </GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button disabled={gramSection === 0} onClick={() => setGramSection(gramSection - 1)} style={{
              padding: '10px 20px', borderRadius: 10, border: `1px solid ${gramSection === 0 ? t.bd : '#3B82F6'}`,
              background: gramSection === 0 ? 'transparent' : 'rgba(59,130,246,.08)',
              color: gramSection === 0 ? t.m : '#3B82F6',
              fontSize: 13, fontWeight: 600, cursor: gramSection === 0 ? 'not-allowed' : 'pointer',
              opacity: gramSection === 0 ? 0.4 : 1, fontFamily: 'inherit', transition: 'all .2s'
            }}>← القسم السابق</button>
            <button disabled={gramSection >= topic.sections.length - 1} onClick={() => setGramSection(gramSection + 1)} style={{
              padding: '10px 20px', borderRadius: 10, border: `1px solid ${gramSection >= topic.sections.length - 1 ? t.bd : '#3B82F6'}`,
              background: gramSection >= topic.sections.length - 1 ? 'transparent' : 'rgba(59,130,246,.08)',
              color: gramSection >= topic.sections.length - 1 ? t.m : '#3B82F6',
              fontSize: 13, fontWeight: 600, cursor: gramSection >= topic.sections.length - 1 ? 'not-allowed' : 'pointer',
              opacity: gramSection >= topic.sections.length - 1 ? 0.4 : 1, fontFamily: 'inherit', transition: 'all .2s'
            }}>القسم التالي →</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 24, height: '100%', animation: 'fadeIn .3s ease' }}>
        <div style={{ width: 320, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={styles.sectionTitle}>قواعد اللغة 📖</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button onClick={() => setGramCat(null)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${!gramCat ? '#3B82F6' : t.bd}`, background: !gramCat ? '#3B82F6' : 'transparent', color: !gramCat ? '#fff' : t.m, transition: 'all .2s', fontFamily: 'inherit' }}>الكل</button>
            {GRAMMAR_CATS.map(cat => {
              const count = GRAMMAR_TOPICS.filter(tp => tp.cat === cat.id).length;
              if (count === 0) return null;
              return (
                <button key={cat.id} onClick={() => setGramCat(gramCat === cat.id ? null : cat.id)} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${gramCat === cat.id ? cat.color : t.bd}`, background: gramCat === cat.id ? `${cat.color}18` : 'transparent', color: gramCat === cat.id ? cat.color : t.m, transition: 'all .2s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{cat.icon}</span><span>{cat.label}</span><span style={{ fontSize: 10, opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredTopics.map(tp => {
              const cat = GRAMMAR_CATS.find(c => c.id === tp.cat);
              return (
                <div key={tp.id} onClick={() => goGrammarLesson(tp, 0)} style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s', background: t.s2, border: `1px solid ${t.bd}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat?.color || '#3B82F6'; e.currentTarget.style.background = `${cat?.color || '#3B82F6'}06`; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.background = t.s2; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: 22 }}>{tp.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: t.txt }}>{tp.title}</div>
                    <div style={{ fontSize: 11, color: t.m, marginTop: 2 }}>{tp.sections.length} أقسام</div>
                  </div>
                  {cat && <span style={{ fontSize: 10, color: cat.color, background: `${cat.color}12`, padding: '2px 8px', borderRadius: 6 }}>{cat.icon}</span>}
                </div>
              );
            })}
            {filteredTopics.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: t.m, fontSize: 14 }}>لا توجد مواضيع تطابق البحث</div>}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <GlassCard dark={darkMode} hover={false} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 400 }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>📖</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: t.m, margin: '0 0 8px' }}>اختر موضوعاً من القائمة</h3>
            <p style={{ fontSize: 13, color: t.s, margin: 0 }}>اضغط على أي موضوع لعرض محتواه التعليمي المفصل</p>
          </GlassCard>
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    const diffStats = { Easy: { correct: Math.floor(progress.totalCorrect * 0.5), total: Math.floor(progress.totalAnswered * 0.5) }, Medium: { correct: Math.floor(progress.totalCorrect * 0.35), total: Math.floor(progress.totalAnswered * 0.35) }, Hard: { correct: progress.totalCorrect - Math.floor(progress.totalCorrect * 0.5) - Math.floor(progress.totalCorrect * 0.35), total: progress.totalAnswered - Math.floor(progress.totalAnswered * 0.5) - Math.floor(progress.totalAnswered * 0.35) } };
    return (
      <div style={{ animation: 'fadeIn .3s ease' }}>
        <h2 style={styles.sectionTitle}>التقدم والإنجازات 📊</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <GlassCard dark={darkMode} hover={false}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px', color: t.txt }}>ملخص الأداء</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <AccuracyRing accuracy={accuracy} size={120} stroke={8} dark={darkMode} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[{ l: 'الإجابات الصحيحة', v: progress.totalCorrect, c: '#22C55E' }, { l: 'إجمالي الأسئلة', v: progress.totalAnswered, c: t.txt }, { l: 'أفضل سلسلة', v: `${progress.bestStreak} 🔥`, c: '#F59E0B' }].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: t.m }}>{s.l}</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: s.c }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          <GlassCard dark={darkMode} hover={false}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px', color: t.txt }}>المستوى الحالي</h3>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{lv.i}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: lv.c }}>{lv.n}</div>
              <div style={{ fontSize: 13, color: t.m, marginTop: 4 }}>{progress.xp} نقطة خبرة</div>
              {nxt && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.m, marginBottom: 6 }}><span>{lv.n}</span><span>{nxt.n}</span></div>
                  <div style={{ height: 6, background: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(nextLvlProg, 100)}%`, background: `linear-gradient(90deg, ${lv.c}, ${nxt.c})`, borderRadius: 3, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: t.m, marginTop: 6 }}>{nxt.min - progress.xp} نقطة للوصول للمستوى التالي</div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
        <GlassCard dark={darkMode} hover={false}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px', color: t.txt }}>الأداء حسب المستوى</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {DIFF_ORDER.map(d => {
              const lc = LC[d];
              const s = diffStats[d];
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <div key={d} style={{ background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 14, padding: 20, textAlign: 'center', transition: 'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{DIFF_EMOJI[d]}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: lc.tx }}>{DIFF_LABELS[d]}</div>
                  <AnimatedNumber value={pct} suffix="%" style={{ fontSize: 28, fontWeight: 700, color: lc.tx, margin: '10px 0', fontFamily: "'Inter', monospace" }} />
                  <div style={{ fontSize: 12, color: t.m }}>{s.correct} / {s.total} سؤال</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderLeaderboard = () => {
    if (leaderboard.length === 0 && !leaderboardLoading) fetchLeaderboard();
    return (
      <div style={{ animation: 'fadeIn .3s ease', padding: '0 8px' }}>
        <h2 style={styles.sectionTitle}>🏆 لوحة الصدارة</h2>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 300, flexShrink: 0 }}>
            <GlassCard dark={darkMode} hover={false} style={{ marginBottom: 14, background: 'linear-gradient(135deg, rgba(245,158,11,.08), rgba(239,68,68,.05))', borderColor: 'rgba(245,158,11,.15)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 10 }}>ترتيبك الحالي</div>
              {leaderboardRank ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#F59E0B', fontFamily: "'Inter', monospace" }}>#{leaderboardRank}</div>
                <div>
                  <div style={{ fontSize: 13, color: t.m }}>{(JSON.parse(localStorage.getItem("e5k_p13") || "{}").xp || 0).toLocaleString()} XP</div>
                  <div style={{ fontSize: 13, color: t.m }}>{(JSON.parse(localStorage.getItem("e5k_p13") || "{}").bestStreak || 0)} streak</div>
                </div>
              </div> : <div style={{ fontSize: 13, color: t.m }}>سجّل دخول عشان تشوف ترتيبك</div>}
            </GlassCard>
            <GlassCard dark={darkMode} hover={false}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.txt, marginBottom: 8 }}>📊 كيف بيتحسب الترتيب؟</div>
              <div style={{ fontSize: 12, color: t.m, lineHeight: 1.9 }}>
                الترتيب الذكي بيجمع بين:<br />
                • <b>60%</b> إجمالي النقاط (XP)<br />
                • <b>20%</b> أفضل سلسلة يومية<br />
                • <b>20%</b> نسبة الإجابة الصحيحة
              </div>
            </GlassCard>
          </div>
          <div style={{ flex: 1 }}>
            {leaderboardLoading ? (
              <GlassCard dark={darkMode} hover={false} style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${t.bd}`, borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <div style={{ color: t.m, fontSize: 13 }}>جاري التحميل...</div>
              </GlassCard>
            ) : (
              <GlassCard dark={darkMode} hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', padding: '12px 20px', borderBottom: `1px solid ${t.bd}`, background: t.s1, fontSize: 11, fontWeight: 700, color: t.m, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  <div style={{ width: 56 }}>الترتيب</div>
                  <div style={{ flex: 1 }}>المستخدم</div>
                  <div style={{ width: 90, textAlign: 'center' }}>المستوى</div>
                  <div style={{ width: 70, textAlign: 'center' }}>🔥</div>
                  <div style={{ width: 70, textAlign: 'center' }}>🎯</div>
                  <div style={{ width: 90, textAlign: 'center' }}>XP</div>
                </div>
                {leaderboard.map((u, i) => {
                  const isMe = u.id === JSON.parse(localStorage.getItem("e5k_u13") || "{}").id;
                  return (
                    <div key={u.id} style={{
                      display: 'flex', padding: '12px 20px',
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)'}`,
                      background: isMe ? (darkMode ? 'rgba(59,130,246,.06)' : 'rgba(59,130,246,.04)') : 'transparent',
                      alignItems: 'center', fontSize: 13, transition: 'background .15s'
                    }}
                      onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.015)'; }}
                      onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = isMe ? (darkMode ? 'rgba(59,130,246,.06)' : 'rgba(59,130,246,.04)') : 'transparent'; }}
                    >
                      <div style={{ width: 56, fontWeight: 700, color: u.medal ? '#F59E0B' : t.txt, fontFamily: "'Inter', monospace" }}>
                        {u.medal ? <span style={{ fontSize: 18 }}>{u.medal}</span> : <span style={{ fontSize: 12 }}>#{u.rank}</span>}
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.photo ? '#000' : avC(u.name || "?"), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden', boxShadow: `0 2px 8px ${avC(u.name || "?")}30`, position: 'relative' }}>
                          {u.photo ? <img src={u.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (u.name || "?").charAt(0).toUpperCase()}
                          {u.lastActive && ((Date.now() - new Date(u.lastActive).getTime()) < 120000) && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#22C55E', border: `2px solid ${t.card || t.s2}`, boxShadow: '0 0 4px rgba(34,197,94,.6)' }} />}
                        </div>
                        <span
                          onClick={(e) => { e.stopPropagation(); if (u.username && !isMe) { window.location.hash="#/"+u.username; } }}
                          style={{ fontWeight: isMe ? 700 : 500, color: isMe ? '#3B82F6' : t.txt, cursor: u.username && !isMe ? 'pointer' : 'default', textDecoration: u.username && !isMe ? 'underline' : 'none', textDecorationColor: 'rgba(59,130,246,.4)' }}
                          onMouseEnter={e => { if (u.username && !isMe) e.currentTarget.style.color = '#60a5fa'; }}
                          onMouseLeave={e => { if (u.username && !isMe) e.currentTarget.style.color = t.txt; }}
                        >{u.name}{isMe ? " (أنت)" : ""}</span>
                        {!isMe && u.username && <span onClick={(e) => { e.stopPropagation(); setChatTarget({ id: u.id, name: u.name, photo: u.photo }); }} style={{ fontSize: 13, cursor: 'pointer', opacity: .6, marginLeft: 4 }} title="Send message">💬</span>}
                      </div>
                      <div style={{ width: 90, textAlign: 'center', fontSize: 12, color: u.levelColor }}>{u.levelIcon} {u.level}</div>
                      <div style={{ width: 70, textAlign: 'center', fontWeight: 600, color: t.txt }}>{u.bestStreak}</div>
                      <div style={{ width: 70, textAlign: 'center', color: u.accuracy >= 80 ? '#22C55E' : u.accuracy >= 50 ? '#F59E0B' : '#EF4444' }}>{u.accuracy}%</div>
                      <div style={{ width: 90, textAlign: 'center', fontWeight: 800, color: '#F59E0B', fontFamily: "'Inter', monospace" }}>{u.xp.toLocaleString()}</div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: t.m }}>لا يوجد مستخدمين بعد</div>}
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
      <h2 style={styles.sectionTitle}>الملف الشخصي 👤</h2>
      <GlassCard dark={darkMode} hover={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: user?.photo ? '#000' : `linear-gradient(135deg, ${lv.c}, ${lv.c}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 32,
            boxShadow: `0 4px 20px ${lv.c}30`, overflow: 'hidden', flexShrink: 0
          }}>
            {user?.photo ? <img src={user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : userName.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: t.txt }}>{userName}</h2>
            {user?.username && <p style={{ color: t.accent, margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>@{user.username}</p>}
            <p style={{ color: t.m, margin: '4px 0 0', fontSize: 14 }}>{userEmail}</p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: `${lv.c}15`, color: lv.c, padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${lv.c}18` }}>
              {lv.i} {lv.n}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          <StatCard icon="⭐" label="إجمالي النقاط" value={progress.xp} color="#F59E0B" dark={darkMode} />
          <StatCard icon="🔥" label="سلسلة الأيام" value={progress.streak} color="#EF4444" dark={darkMode} />
          <StatCard icon="✅" label="الإجابات الصحيحة" value={progress.totalCorrect} color="#22C55E" dark={darkMode} />
          <StatCard icon="📈" label="نسبة الدقة" value={accuracy} color="#3B82F6" dark={darkMode} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: t.txt }}>معلومات الحساب</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.m, display: 'block', marginBottom: 4 }}>الاسم</label>
            <input id="prof_name_desktop" defaultValue={user?.name || ''} placeholder="اسمك" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`, background: darkMode ? '#111827' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#0f172a', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.m, display: 'block', marginBottom: 4 }}>اسم المستخدم</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.m, fontSize: 14 }}>@</span>
              <input id="prof_username_desktop" defaultValue={user?.username || ''} placeholder="username" style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: 10, border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`, background: darkMode ? '#111827' : '#f8fafc', color: darkMode ? '#e2e8f0' : '#0f172a', fontSize: 14, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button onClick={async () => {
            const name = document.getElementById('prof_name_desktop')?.value || '';
            const username = document.getElementById('prof_username_desktop')?.value || '';
            if (!name.trim()) return;
            try {
              const d = await apiCall('/api/auth/update-profile', { method: 'POST', body: JSON.stringify({ name, username }) });
              setUser(d.user);
              try { localStorage.setItem('e5k_u13', JSON.stringify(d.user)); } catch {}
            } catch (e) { console.warn('Profile update failed:', e.message); }
          }} style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>💾 حفظ التعديلات</button>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: t.txt }}>الإعدادات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[{ icon: darkMode ? '🌙' : '☀️', title: 'الوضع الداكن', desc: 'تبديل بين الوضع الداكن والفاتح', v: darkMode, fn: () => setDarkMode(!darkMode) },
            { icon: '🔊', title: 'الصوت', desc: 'تشغيل أو إيقاف أصوات التطبيق', v: cfg.sound, fn: () => { const nc = { ...cfg, sound: !cfg.sound }; setCfg(nc); sCfg(nc); } }
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: t.s1, borderRadius: 12, border: `1px solid ${t.bd}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: t.txt }}>{s.title}</div><div style={{ fontSize: 12, color: t.m }}>{s.desc}</div></div>
              </div>
              <button onClick={s.fn} style={{ width: 46, height: 24, borderRadius: 12, border: 'none', background: s.v ? '#3B82F6' : t.bdS, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: s.v ? 24 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.bd}` }}>
          <button onClick={doSignOut} style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.06)',
            color: '#EF4444', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all .2s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.06)'}
          >🚪 تسجيل الخروج</button>
        </div>
      </GlassCard>
    </div>
  );

  const renderAuth = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100vw',
      background: darkMode
        ? 'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0d1525 100%)'
        : 'linear-gradient(135deg, #f0f2f7 0%, #e8ecf4 50%, #f5f7fb 100%)',
      direction: 'ltr', fontFamily: "'Cairo', 'Inter', system-ui, sans-serif"
    }}>
      <style>{CSS}</style>
      <div style={{
        width: '100%', maxWidth: 420, padding: '0 20px',
        animation: 'scaleIn .4s cubic-bezier(.4,0,.2,1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="EN-5000" style={{
            width: 72, height: 72, borderRadius: 18, objectFit: 'cover',
            boxShadow: '0 4px 24px rgba(59,130,246,.2)', marginBottom: 16
          }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#e2e8f0' : '#0f172a', margin: '0 0 6px' }}>EN-5000</h1>
          <p style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#64748b', margin: 0 }}>
            {authView === 'signup' ? 'ابدأ رحلتك في تعلم الإنجليزي' : authView === 'signin' ? 'كمّل من حيث وقفت' : authView === 'forgot' ? 'أدخل إيميلك عشان تاخد توكن إعادة التعيين' : 'أدخل توكن إعادة التعيين وكلمة المرور الجديدة'}
          </p>
        </div>
        <GlassCard dark={darkMode} hover={false} style={{ padding: '28px 28px' }}>
          {authErr && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{authErr}</div>}
          {authMsg && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#16A34A', fontSize: 13, marginBottom: 16 }}>{authMsg}</div>}
          {!authView && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setAuthView('signin')} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,130,246,.25)',
                transition: 'all .2s'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >تسجيل الدخول</button>
              <button onClick={() => setAuthView('signup')} style={{
                width: '100%', padding: '14px', borderRadius: 12,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'}`,
                background: 'transparent', color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .2s'
              }} onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                onMouseLeave={e => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'}
              >إنشاء حساب جديد ✨</button>
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('forgot'); }} style={{ background: 'none', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: 13 }}>نسيت كلمة المرور؟</button>
              </div>
            </div>
          )}
          {authView === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { ph: 'الاسم', v: authName, fn: e => setAuthName(e.target.value), t: 'text' },
                { ph: '@ اسم المستخدم (حروف، أرقام، _)', v: authUsername, fn: e => setAuthUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')), t: 'text', mono: true },
                { ph: 'السن (اختياري)', v: authAge, fn: e => setAuthAge(e.target.value), t: 'number' },
                { ph: 'الإيميل', v: authEmail, fn: e => setAuthEmail(e.target.value), t: 'email' },
                { ph: 'كلمة المرور (٦ أحرف على الأقل)', v: authPass, fn: e => setAuthPass(e.target.value), t: 'password' },
              ].map((f, i) => (
                <input key={i} type={f.t} value={f.v} onChange={f.fn} placeholder={f.ph} style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                  background: darkMode ? '#111827' : '#f8fafc',
                  color: darkMode ? '#e2e8f0' : '#0f172a',
                  fontSize: 14, outline: 'none', fontFamily: f.mono ? 'monospace' : 'inherit', boxSizing: 'border-box',
                  transition: 'border-color .2s'
                }} onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}
                />
              ))}
              <button onClick={doSignUp} disabled={authLoading || !authName.trim() || !authUsername.trim() || authUsername.length < 3 || !authEmail.trim() || authPass.length < 6} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: authLoading || !authName.trim() || !authUsername.trim() || authUsername.length < 3 || !authEmail.trim() || authPass.length < 6 ? .5 : 1,
                boxShadow: '0 4px 16px rgba(59,130,246,.25)'
              }}>{authLoading ? 'جاري الإنشاء...' : 'إنشاء حساب ✨'}</button>
              <p style={{ fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', margin: '4px 0 0' }}>
                عندك حساب؟ <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('signin'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>سجل دخول</button>
              </p>
            </div>
          )}
          {authView === 'signin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="الإيميل" style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                background: darkMode ? '#111827' : '#f8fafc',
                color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }} />
              <input type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="كلمة المرور" style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                background: darkMode ? '#111827' : '#f8fafc',
                color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }} />
              <button onClick={doSignIn} disabled={authLoading || !authEmail.trim() || !authPass} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: authLoading || !authEmail.trim() || !authPass ? .5 : 1,
                boxShadow: '0 4px 16px rgba(59,130,246,.25)'
              }}>{authLoading ? 'جاري الدخول...' : 'تسجيل الدخول 👋'}</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('signup'); }} style={{ background: 'none', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: 13 }}>إنشاء حساب جديد</button>
                <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('forgot'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>نسيت كلمة المرور؟</button>
              </div>
            </div>
          )}
          {authView === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="إيمانلك" style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                background: darkMode ? '#111827' : '#f8fafc',
                color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }} />
              <button onClick={doForgot} disabled={authLoading || !authEmail.trim()} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: authLoading || !authEmail.trim() ? .5 : 1,
                boxShadow: '0 4px 16px rgba(59,130,246,.25)'
              }}>{authLoading ? 'جاري الإرسال...' : 'إرسال توكن إعادة التعيين 🔑'}</button>
              <p style={{ fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', margin: '4px 0 0' }}>
                <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('signin'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 13 }}>← رجوع لتسجيل الدخول</button>
              </p>
            </div>
          )}
          {authView === 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={authToken || ''} onChange={e => setAuthToken(e.target.value)} placeholder="توكن إعادة التعيين" style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                background: darkMode ? '#111827' : '#f8fafc',
                color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box'
              }} />
              <input type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="كلمة المرور الجديدة (٦ أحرف)" style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                background: darkMode ? '#111827' : '#f8fafc',
                color: darkMode ? '#e2e8f0' : '#0f172a',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }} />
              <button onClick={doResetPass} disabled={authLoading || !authToken || authPass.length < 6} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: authLoading || !authToken || authPass.length < 6 ? .5 : 1,
                boxShadow: '0 4px 16px rgba(59,130,246,.25)'
              }}>{authLoading ? 'جاري...' : 'إعادة تعيين كلمة المرور 🔒'}</button>
              <p style={{ fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', margin: '4px 0 0' }}>
                <button onClick={() => { setAuthErr(''); setAuthMsg(''); setAuthView('forgot'); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 13 }}>← رجوع</button>
              </p>
            </div>
          )}
        </GlassCard>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/#/" style={{ fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', textDecoration: 'none' }}>← الرجوع للصفحة الرئيسية</a>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'home': return renderHome();
      case 'quiz':
      case 'cs-quiz': return renderQuizSection();
      case 'grammar':
      case 'grammar-lesson': return renderGrammar();
      case 'progress': return renderProgress();
      case 'leaderboard': return renderLeaderboard();
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  if (!authToken && !authView) {
    return (
      <>
        <style>{CSS}</style>
        {renderAuth()}
      </>
    );
  }

  if (authView) {
    return (
      <>
        <style>{CSS}</style>
        {renderAuth()}
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={styles.root} className="desktop-only">
        {renderSidebar()}
        <div style={styles.main}>
          {renderHeader()}
          <div style={styles.content}>
            {renderContent()}
          </div>
        </div>
      </div>
      {authToken && user && <ChatWidget token={authToken} userId={user.id} dark={darkMode} openChat={chatTarget} />}
    </>
  );
}
