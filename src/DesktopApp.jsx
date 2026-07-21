import { useState, useEffect, useRef, useCallback } from 'react';
import { GRAMMAR_TOPICS, GRAMMAR_CATS } from './grammarData';

const PK = 'e5k_p13', SK = 'e5k_s13', UK = 'e5k_u13';
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
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizType, setQuizType] = useState('general');
  const [authView, setAuthView] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authAge, setAuthAge] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      const d = await apiCall("/api/auth/signup", { method: "POST", body: JSON.stringify({ name: authName, email: authEmail, password: authPass, age: authAge }) });
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
    setQuizActive(false);
    setQuizComplete(false);
    if (s !== 'grammar' && s !== 'grammar-lesson') {
      setGramTopic(null);
      setGramSection(0);
    }
  };

  const startQuiz = (diff, type = 'general') => {
    setQuizDifficulty(diff);
    setQuizType(type);
    const FB = type === 'cs' ? [
      { ar: "It works!", en: "It works!", pron: "إت وركس!", opts: ["It works!", "It work!", "Its works!", "It working!"], c: 0, cat: "Developer Phrases" },
      { ar: "File not found", en: "File not found", pron: "فايل نوت فاوند", opts: ["File not found", "File not found.", "Find not found", "File no found"], c: 0, cat: "Error Messages" },
      { ar: "Run the code", en: "Run the code", pron: "ران ذا كود", opts: ["Run the code", "Run the codes", "Ran the code", "Running the code"], c: 0, cat: "Developer Phrases" },
      { ar: "Permission denied", en: "Permission denied", pron: "بيرميشن دينايد", opts: ["Permission denied", "Permission defined", "Permission decided", "Permission delayed"], c: 0, cat: "Error Messages" },
      { ar: "git commit", en: "git commit", pron: "جيت كوميت", opts: ["git commit", "get commit", "git committee", "got commit"], c: 0, cat: "Git" },
      { ar: "git push", en: "git push", pron: "جيت پوش", opts: ["git push", "get push", "git pool", "git pull"], c: 0, cat: "Git" },
      { ar: "Segmentation fault", en: "Segmentation fault", pron: "سيجمنتيشن فولت", opts: ["Segmentation fault", "Segmentation fault", "Segmention fault", "Segmentation fast"], c: 0, cat: "Error Messages" },
      { ar: "ls -la", en: "List all files", pron: "ليست أول فايلز", opts: ["List all files", "Last all files", "Lose all files", "List all field"], c: 0, cat: "Linux Basics" },
      { ar: "Compile the code", en: "Compile the code", pron: "كومبايل ذا كود", opts: ["Compile the code", "Complete the code", "Compute the code", "Compare the code"], c: 0, cat: "Developer Phrases" },
      { ar: "Debug the program", en: "Debug the program", pron: "ديباج ذا پروجراوم", opts: ["Debug the program", "Design the program", "Develop the program", "Deposit the program"], c: 0, cat: "Developer Phrases" },
      { ar: "Save the file", en: "Save the file", pron: "سييف ذا فايل", opts: ["Save the file", "Safe the file", "Saw the file", "Sale the file"], c: 0, cat: "Developer Phrases" },
      { ar: "What's the bug?", en: "What's the bug?", pron: "واتس ذا بج؟", opts: ["What's the bug?", "What's the bag?", "What's the big?", "What's the bed?"], c: 0, cat: "Debugging" },
      { ar: "Problem solved", en: "Problem solved", pron: "پروبليم سافد", opts: ["Problem solved", "Problem solved", "Problem solved", "Problems solved"], c: 0, cat: "Debugging" },
      { ar: "Code review", en: "Code review", pron: "كود ريفيو", opts: ["Code review", "Code revise", "Code reveal", "Code resort"], c: 0, cat: "Developer Phrases" },
      { ar: "Pull request", en: "Pull request", pron: "بول ريكويست", opts: ["Pull request", "Pool request", "Pull require", "Full request"], c: 0, cat: "GitHub Workflow" },
    ] : [
      { ar: "إزيك؟", en: "How are you?", pron: "هاو أر يو؟", opts: ["How are you?", "Where are you?", "Who are you?", "What are you?"], c: 0, cat: "Greetings" },
      { ar: "أنا بخير، شكراً", en: "I'm fine, thank you.", pron: "آيم فاين، ثانك يو", opts: ["I'm fine, thank you.", "I'm bad, thank you.", "I'm fine, please.", "I'm good, sorry."], c: 0, cat: "Greetings" },
      { ar: "إسمي أحمد", en: "My name is Ahmed.", pron: "ماي نيم إز أحمد", opts: ["My name is Ahmed.", "My name is Ali.", "I am Ahmed name.", "Ahmed is my name."], c: 0, cat: "Self Introduction" },
      { ar: "عندك كام سنة؟", en: "How old are you?", pron: "هاو أولد أر يو؟", opts: ["How old are you?", "How are you old?", "Where are you old?", "What old are you?"], c: 0, cat: "Self Introduction" },
      { ar: "أنا عندي 25 سنة", en: "I am 25 years old.", pron: "آيم تونتي فايف ييرز أولد", opts: ["I am 25 years old.", "I have 25 years old.", "I am 25 year old.", "25 years old I am."], c: 0, cat: "Self Introduction" },
      { ar: "شكراً ليك", en: "Thank you.", pron: "ثانك يو", opts: ["Thank you.", "Think you.", "Tank you.", "Three you."], c: 0, cat: "Greetings" },
      { ar: "مع السلامة", en: "Goodbye.", pron: "جودباي", opts: ["Goodbye.", "Good buy.", "Go bye.", "Good day."], c: 0, cat: "Greetings" },
      { ar: "صباح الخير", en: "Good morning.", pron: "جود مورنينج", opts: ["Good morning.", "Good mourning.", "Good morning.", "Good moning."], c: 0, cat: "Greetings" },
      { ar: "أنا جعان", en: "I'm hungry.", pron: "آيم هانجري", opts: ["I'm hungry.", "I'm happy.", "I'm hurry.", "I'm heavy."], c: 0, cat: "Food" },
      { ar: "أنا رايح الشغل", en: "I'm going to work.", pron: "آيم جوينج تو ورك", opts: ["I'm going to work.", "I'm going to walk.", "I'm going to wake.", "I'm going to world."], c: 0, cat: "Daily Activities" },
      { ar: "الجو حلو النهارده", en: "The weather is nice today.", pron: "ذه ويذر إز نايس تودي", opts: ["The weather is nice today.", "The weather is nice to day.", "The weather is nine today.", "The weather is new today."], c: 0, cat: "Daily Activities" },
      { ar: "أنا بحب الإنجليزي", en: "I love English.", pron: "آي لاف إنقليزي", opts: ["I love English.", "I live English.", "I left English.", "I like English."], c: 0, cat: "Daily Activities" },
      { ar: "القلم بتاعي فين؟", en: "Where is my pen?", pron: "وير إز ماي بين؟", opts: ["Where is my pen?", "When is my pen?", "What is my pen?", "Who is my pen?"], c: 0, cat: "Daily Activities" },
      { ar: "ممكن تساعدني؟", en: "Can you help me?", pron: "كان يو هيلب مي؟", opts: ["Can you help me?", "Can you held me?", "Can you helm me?", "Can you hell me?"], c: 0, cat: "Greetings" },
      { ar: "الوقت كام؟", en: "What time is it?", pron: "وات تايم إز إيت؟", opts: ["What time is it?", "What time is at?", "What times is it?", "What time are it?"], c: 0, cat: "Daily Activities" },
    ];
    const shuffled = [...FB].sort(() => Math.random() - 0.5).slice(0, 10);
    shuffled.forEach(q => { q.opts = [...q.opts].sort(() => Math.random() - 0.5); });
    setQuizQuestions(shuffled);
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizComplete(false);
    setQuizActive(true);
    setSection(type === 'cs' ? 'cs-quiz' : 'quiz');
  };

  const handleQuizAnswer = (idx) => {
    if (quizAnswered) return;
    setQuizSelected(idx);
    setQuizAnswered(true);
    const correct = quizQuestions[quizIndex].c === idx;
    if (correct) setQuizScore(s => s + 1);
  };

  const nextQuizQuestion = () => {
    if (quizIndex >= quizQuestions.length - 1) {
      setQuizComplete(true);
      const newProg = { ...progress, totalAnswered: progress.totalAnswered + quizQuestions.length, totalCorrect: progress.totalCorrect + quizScore };
      setProgress(newProg);
      sP(newProg);
      return;
    }
    setQuizIndex(i => i + 1);
    setQuizSelected(null);
    setQuizAnswered(false);
  };

  const styles = {
    root: { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Cairo', 'Inter', system-ui, sans-serif", background: t.root, color: t.txt, direction: 'rtl', transition: 'background .3s ease' },
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
      textAlign: 'right',
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
            <a href="/#/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#6b7a90', fontSize: 13, transition: 'color .15s' }}
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
    if (quizActive && quizQuestions.length > 0 && !quizComplete) {
      const q = quizQuestions[quizIndex];
      const progressPct = ((quizIndex + 1) / quizQuestions.length * 100).toFixed(1);
      const isCorrect = quizSelected !== null && quizSelected === q.c;
      return (
        <div style={{ maxWidth: 700, animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => { setQuizActive(false); setQuizComplete(false); }} style={{ background: 'transparent', border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 16px', color: t.m, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.bdS; e.currentTarget.style.color = t.txt; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.color = t.m; }}
            >✕ خروج</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: t.m }}>{quizIndex + 1} / {quizQuestions.length}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>✓ {quizScore}</span>
            </div>
          </div>
          <div style={{ height: 4, background: t.s1, borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', borderRadius: 2, transition: 'width .4s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <GlassCard dark={darkMode} hover={false} style={{ marginBottom: 20, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', background: 'rgba(59,130,246,.08)', padding: '3px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 16 }}>{q.cat}</div>
            <div style={{ direction: 'rtl', fontSize: 26, fontWeight: 700, color: t.txt, lineHeight: 1.7, fontFamily: "'Cairo', sans-serif" }}>{q.ar}</div>
            <div style={{ fontSize: 12, color: t.m, marginTop: 8 }}>اختار الترجمة الصحيحة</div>
          </GlassCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {q.opts.map((opt, i) => {
              let bg = t.s1, bd = t.bd, color = t.txt;
              if (quizAnswered) {
                if (i === q.c) { bg = 'rgba(34,197,94,.12)'; bd = 'rgba(34,197,94,.3)'; color = '#16A34A'; }
                else if (i === quizSelected) { bg = 'rgba(239,68,68,.12)'; bd = 'rgba(239,68,68,.3)'; color = '#DC2626'; }
                else { bg = t.s1; bd = t.bd; color = t.m; opacity: 0.5; }
              }
              return (
                <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswered} style={{
                  padding: '14px 16px', borderRadius: 12, border: `1px solid ${bd}`, background: bg,
                  color, fontSize: 14, fontWeight: 500, cursor: quizAnswered ? 'default' : 'pointer',
                  transition: 'all .2s', fontFamily: 'inherit', textAlign: 'left'
                }}
                  onMouseEnter={e => { if (!quizAnswered) { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { if (!quizAnswered) { e.currentTarget.style.borderColor = bd; e.currentTarget.style.transform = 'none'; } }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, fontFamily: 'monospace', marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {quizAnswered && (
            <div style={{ animation: 'fadeIn .2s ease' }}>
              <GlassCard dark={darkMode} hover={false} style={{
                marginBottom: 16, padding: '16px 20px',
                background: isCorrect ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                border: `1px solid ${isCorrect ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: isCorrect ? '#16A34A' : '#DC2626' }}>
                  {isCorrect ? '✓ أحسنت! إجابة صحيحة 🎉' : `✗ خطأ! الإجابة الصحيحة: "${q.en}"`}
                </div>
                {q.pron && <div style={{ fontSize: 12, color: t.m, marginTop: 6 }}>🔊 {q.pron}</div>}
              </GlassCard>
              <button onClick={nextQuizQuestion} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,130,246,.25)',
                transition: 'all .2s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >{quizIndex >= quizQuestions.length - 1 ? 'عرض النتائج ←' : 'السؤال التالي ←'}</button>
            </div>
          )}
        </div>
      );
    }

    if (quizComplete) {
      const pct = Math.round((quizScore / quizQuestions.length) * 100);
      return (
        <div style={{ maxWidth: 500, animation: 'scaleIn .3s ease' }}>
          <GlassCard dark={darkMode} hover={false} style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: t.txt, marginBottom: 8 }}>أحسنت! أكملت الاختبار</h2>
            <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444', fontFamily: "'Inter', monospace", margin: '16px 0' }}>{pct}%</div>
            <div style={{ fontSize: 14, color: t.m, marginBottom: 24 }}>{quizScore} / {quizQuestions.length} إجابة صحيحة</div>
            <button onClick={() => { setQuizActive(false); setQuizComplete(false); }} style={{
              padding: '12px 32px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,130,246,.25)'
            }}>العودة للرئيسية ←</button>
          </GlassCard>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 700 }}>
        <h2 style={styles.sectionTitle}>{quizType === 'cs' ? 'اختبار البرمجة 💻' : 'اختبار الإنجليزي 📝'}</h2>
        <GlassCard dark={darkMode} hover={false}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: t.txt, marginBottom: 8 }}>{quizType === 'cs' ? 'تعلم مصطلحات البرمجة بالإنجليزي' : 'اختبر مستواك في الإنجليزي'}</h3>
          <p style={{ color: t.m, margin: '0 0 24px', fontSize: 14 }}>اختار مستوى الصعوبة وابدأ الاختبار — 10 أسئلة</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DIFF_ORDER.map(d => {
              const csColors = { Easy: { fill: '#06B6D4', bg: 'rgba(6,182,212,.06)', br: 'rgba(6,182,212,.2)', tx: '#0891B2' }, Medium: { fill: '#8B5CF6', bg: 'rgba(139,92,246,.06)', br: 'rgba(139,92,246,.2)', tx: '#7C3AED' }, Hard: { fill: '#F97316', bg: 'rgba(249,115,22,.06)', br: 'rgba(249,115,22,.2)', tx: '#EA580C' } };
              const lc = quizType === 'cs' ? csColors[d] : LC[d];
              return (
                <div key={d} onClick={() => startQuiz(d, quizType)} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', background: lc.bg, border: `1px solid ${lc.br}`,
                  borderRadius: 12, cursor: 'pointer', transition: 'all .2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${lc.fill}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: 28 }}>{DIFF_EMOJI[d]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: lc.tx, fontSize: 15 }}>{DIFF_LABELS[d]}</div>
                    <div style={{ fontSize: 12, color: t.m, marginTop: 2 }}>
                      {quizType === 'cs'
                        ? (d === 'Easy' ? 'Linux Basics, Git, Developer Phrases' : d === 'Medium' ? 'C/C++, Python, Debugging' : 'AI/ML, Algorithms, Architecture')
                        : (d === 'Easy' ? 'أسئلة يومية بسيطة — تحيات، أرقام' : d === 'Medium' ? 'سفر، شغل، صحة' : 'تعبيرات، عمل رسمي')
                      }
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
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.photo ? '#000' : avC(u.name || "?"), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden', boxShadow: `0 2px 8px ${avC(u.name || "?")}30` }}>
                          {u.photo ? <img src={u.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: isMe ? 700 : 500, color: isMe ? '#3B82F6' : t.txt }}>{u.name}{isMe ? " (أنت)" : ""}</span>
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
                { ph: 'السن (اختياري)', v: authAge, fn: e => setAuthAge(e.target.value), t: 'number' },
                { ph: 'الإيميل', v: authEmail, fn: e => setAuthEmail(e.target.value), t: 'email' },
                { ph: 'كلمة المرور (٦ أحرف على الأقل)', v: authPass, fn: e => setAuthPass(e.target.value), t: 'password' },
              ].map((f, i) => (
                <input key={i} type={f.t} value={f.v} onChange={f.fn} placeholder={f.ph} style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`,
                  background: darkMode ? '#111827' : '#f8fafc',
                  color: darkMode ? '#e2e8f0' : '#0f172a',
                  fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'border-color .2s'
                }} onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}
                />
              ))}
              <button onClick={doSignUp} disabled={authLoading || !authName.trim() || !authEmail.trim() || authPass.length < 6} style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', opacity: authLoading || !authName.trim() || !authEmail.trim() || authPass.length < 6 ? .5 : 1,
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
    </>
  );
}