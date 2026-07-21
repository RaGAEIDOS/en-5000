import { useState, useEffect, useRef, useCallback } from 'react';
import { GRAMMAR_TOPICS, GRAMMAR_CATS } from './grammarData';

const PK = 'e5k_p13', SK = 'e5k_s13', UK = 'e5k_u13';
const toStr = () => new Date().toISOString().slice(0, 10);
const DEF = { day: 1, streak: 0, lastDate: null, totalCorrect: 0, totalAnswered: 0, xp: 0, bestStreak: 0 };
const CFG_DEF = { sound: true, dark: false };
const LVLS = [{ n: "Beginner", min: 0, c: "#9CA3AF", i: "🌱" }, { n: "Elementary", min: 500, c: "#22C55E", i: "🌿" }, { n: "Pre-Int", min: 1500, c: "#3B82F6", i: "📘" }, { n: "Intermediate", min: 3500, c: "#8B5CF6", i: "⭐" }, { n: "Upper-Int", min: 7000, c: "#F59E0B", i: "🌟" }, { n: "Advanced", min: 12000, c: "#EF4444", i: "🔥" }, { n: "Expert", min: 20000, c: "#EC4899", i: "💎" }];
const LC = { Easy: { fill: "#22C55E", bg: "rgba(34,197,94,.1)", br: "rgba(34,197,94,.32)", tx: "#16A34A" }, Medium: { fill: "#3B82F6", bg: "rgba(59,130,246,.1)", br: "rgba(59,130,246,.32)", tx: "#2563EB" }, Hard: { fill: "#EF4444", bg: "rgba(239,68,68,.1)", br: "rgba(239,68,68,.32)", tx: "#DC2626" } };
const TH = { light: { root: "#f3f5fb", s1: "#edf0f7", s2: "#fff", bd: "rgba(0,0,0,.07)", bdS: "rgba(0,0,0,.13)", txt: "#111827", m: "#6b7280", s: "#4b5563" }, dark: { root: "#0c111a", s1: "#141c2b", s2: "#1c2540", bd: "rgba(255,255,255,.07)", bdS: "rgba(255,255,255,.14)", txt: "#e8edf5", m: "#8b95a8", s: "#9ca3af" } };
const getLv = (xp) => { let l = LVLS[0]; for (const x of LVLS) if ((xp || 0) >= x.min) l = x; return l; };
const getNext = (xp) => { for (const x of LVLS) if ((xp || 0) < x.min) return x; return null; };
const avC = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); const c = ['#3B82F6','#8B5CF6','#EC4899','#EF4444','#F59E0B','#22C55E','#06B6D4']; return c[Math.abs(h) % c.length]; };

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

function AccuracyRing({ accuracy, size = 120, stroke = 8, dark }) {
  const t = TH[dark ? 'dark' : 'light'];
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (accuracy / 100) * circ;
  const color = accuracy >= 80 ? '#22C55E' : accuracy >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.bd} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: t.txt }}>{Math.round(accuracy)}%</span>
        <span style={{ fontSize: 11, color: t.m }}>الدقة</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, dark }) {
  const t = TH[dark ? 'dark' : 'light'];
  return (
    <div style={{ background: t.s2, border: `1px solid ${t.bd}`, borderRadius: 12, padding: '18px 20px', flex: '1 1 0', minWidth: 160, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: t.txt }}>{value}</div>
        <div style={{ fontSize: 13, color: t.m }}>{label}</div>
      </div>
    </div>
  );
}

function BarChart({ data, dark }) {
  const t = TH[dark ? 'dark' : 'light'];
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: t.m }}>{d.value}</span>
          <div style={{ width: '100%', height: `${(d.value / max) * 100}%`, background: d.color || '#3B82F6', borderRadius: 6, minHeight: 4, transition: 'height 0.5s ease' }} />
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
  const [authToken,setAuthToken]=useState(()=>{try{return localStorage.getItem("e5k_token")||null;}catch{return null;}});
  const [syncing,setSyncing]=useState(false);
  const [cloudConnected,setCloudConnected]=useState(!!authToken);
  const [leaderboard,setLeaderboard]=useState([]);
  const [leaderboardRank,setLeaderboardRank]=useState(null);
  const [leaderboardLoading,setLeaderboardLoading]=useState(false);

  async function apiCall(url,opts={},token){
    const t=token||authToken;
    const headers={"Content-Type":"application/json",...(opts.headers||{})};
    if(t)headers["Authorization"]=`Bearer ${t}`;
    const res=await fetch(url,{...opts,headers});
    if(!res.ok)throw new Error(`API ${res.status}`);
    return res.json();
  }

  async function fetchLeaderboard(){
    setLeaderboardLoading(true);
    try{
      const headers={"Content-Type":"application/json"};
      if(authToken)headers["Authorization"]=`Bearer ${authToken}`;
      const res=await fetch("/api/leaderboard",{method:"GET",headers});
      if(res.ok){const d=await res.json();setLeaderboard(d.leaderboard||[]);setLeaderboardRank(d.myRank);}
    }catch(e){console.warn("Leaderboard fetch failed:",e.message);}
    setLeaderboardLoading(false);
  }

  async function cloudPull(token){
    const tk=token||authToken;
    if(!tk)return;
    setSyncing(true);
    try{
      const d=await apiCall("/api/sync/pull",{method:"GET"},tk);
      if(d.progress?.general){
        try{localStorage.setItem("e5k_p13",JSON.stringify(d.progress.general));}catch{}
      }
      if(d.progress?.cs){
        try{localStorage.setItem("e5k_cs13",JSON.stringify(d.progress.cs));}catch{}
      }
      if(d.profile){
        try{localStorage.setItem("e5k_u13",JSON.stringify(d.profile));}catch{}
      }
      if(d.settings){
        try{localStorage.setItem("e5k_s13",JSON.stringify({sound:d.settings.sound!==false,dark:!!d.settings.dark}));}catch{}
      }
      if(Array.isArray(d.perfHistory)){
        try{localStorage.setItem("e5k_perf",JSON.stringify(d.perfHistory.slice(-20)));}catch{}
      }
      setCloudConnected(true);
    }catch(e){console.warn("Desktop cloud pull failed:",e.message);}
    setSyncing(false);
  }

  async function cloudPush(){
    if(!authToken)return;
    try{
      const prog=JSON.parse(localStorage.getItem("e5k_p13")||"{}");
      const csProg=JSON.parse(localStorage.getItem("e5k_cs13")||"{}");
      const cfg=JSON.parse(localStorage.getItem("e5k_s13")||"{}");
      const perf=JSON.parse(localStorage.getItem("e5k_perf")||"[]");
      await apiCall("/api/sync/push",{method:"POST",body:JSON.stringify({general:prog,cs:csProg,settings:cfg,perfHistory:perf})});
    }catch(e){console.warn("Desktop cloud push failed:",e.message);}
  }

  useEffect(()=>{if(authToken)cloudPull();},[]);

  useEffect(()=>{
    if(!authToken)return;
    const interval=setInterval(()=>{cloudPush();},300000);
    return()=>clearInterval(interval);
  },[authToken]);

  useEffect(()=>{
    const handle=()=>{if(document.visibilityState==="visible"&&authToken)cloudPush();};
    document.addEventListener("visibilitychange",handle);
    return()=>document.removeEventListener("visibilitychange",handle);
  },[authToken]);

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
    if (s !== 'grammar' && s !== 'grammar-lesson') {
      setGramTopic(null);
      setGramSection(0);
    }
  };

  const styles = {
    root: { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Cairo', system-ui, -apple-system, sans-serif", background: t.root, color: t.txt, direction: 'rtl' },
    sidebar: { width: 260, minWidth: 260, background: darkMode ? '#080d15' : '#0c111a', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'}`, position: 'relative', zIndex: 10 },
    sidebarLogo: { padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', margin: '2px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : '#8b95a8', background: active ? 'rgba(59,130,246,.2)' : 'transparent', transition: 'all .15s', border: 'none', width: 'calc(100% - 20px)', textAlign: 'right' }),
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { height: 60, minHeight: 60, background: t.s2, borderBottom: `1px solid ${t.bd}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, direction: 'ltr' },
    content: { flex: 1, overflow: 'auto', padding: 28 },
    card: { background: t.s2, border: `1px solid ${t.bd}`, borderRadius: 14, padding: 24, transition: 'box-shadow .2s, border-color .2s' },
    btn: (color = '#3B82F6', bg) => ({ background: bg || `${color}18`, color: color, border: `1px solid ${color}32`, borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }),
    sectionTitle: { fontSize: 20, fontWeight: 700, color: t.txt, marginBottom: 20 },
  };

  const renderHeader = () => (
    <div style={styles.header}>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', background: t.s1, borderRadius: 10, border: `1px solid ${t.bdS}`, padding: '0 12px' }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث في القواعد..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 10px', fontSize: 14, color: t.txt, fontFamily: 'inherit', width: 220, direction: 'rtl' }} />
            <span onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ cursor: 'pointer', fontSize: 16, color: t.m, padding: 4 }}>✕</span>
          </div>
        ) : (
          <button onClick={() => { setSearchOpen(true); setSection('grammar'); }} style={{ background: t.s1, border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 14, color: t.m, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍</span>
            <span style={{ fontSize: 13 }}>بحث...</span>
          </button>
        )}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(!showNotif)} style={{ background: t.s1, border: `1px solid ${t.bd}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 18, position: 'relative' }}>
            🔔
            {progress.streak > 0 && <span style={{ position: 'absolute', top: 4, left: 4, width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />}
          </button>
          {showNotif && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: t.s2, border: `1px solid ${t.bd}`, borderRadius: 12, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,.12)', zIndex: 100 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>الإشعارات</div>
              {progress.streak > 0 && <div style={{ fontSize: 13, color: t.s, padding: '8px 0', borderBottom: `1px solid ${t.bd}` }}>🔥 سلسلة نشاط {progress.streak} يوم!</div>}
              <div style={{ fontSize: 13, color: t.s, padding: '8px 0' }}>📚 اكمل اختبار اليوم!</div>
              <div style={{ fontSize: 13, color: t.m, padding: '8px 0' }}>🌟 حصل على {progress.xp} نقطة خبرة</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.s1, borderRadius: 10, padding: '6px 14px 6px 6px', border: `1px solid ${t.bd}`, cursor: 'pointer' }} onClick={() => nav('profile')}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: lv.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{userName.charAt(0)}</div>
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
        <img src="/logo.png" alt="EN-5000" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>EN-5000</div>
          <div style={{ color: '#6b7280', fontSize: 11 }}>تعلم الإنجليزي</div>
        </div>
      </div>
      <div style={{ padding: '8px 0', flex: 1, overflow: 'auto' }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} style={styles.navItem(section === n.id)} onClick={() => nav(n.id)} onMouseEnter={e => { if (section !== n.id) e.target.style.background = 'rgba(255,255,255,.05)'; }} onMouseLeave={e => { if (section !== n.id) e.target.style.background = 'transparent'; }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(255,255,255,.06)` }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,.04)', border: 'none', color: '#8b95a8', fontSize: 14, width: '100%', marginBottom: 8, fontFamily: 'inherit' }}>
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
        </button>
        <div style={{padding:"8px 16px",borderTop:`1px solid ${darkMode?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`,fontSize:11,color:cloudConnected?"#22C55E":"#9CA3AF",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:cloudConnected?"#22C55E":"#9CA3AF",display:"inline-block"}}/>
          {syncing?"جاري المزامنة...":cloudConnected?"متصل بالسحابة":"محلي فقط"}
        </div>
        <button onClick={()=>cloudPull()} style={{width:"calc(100% - 32px)",padding:"6px",margin:"0 16px",borderRadius:6,border:`1px solid ${darkMode?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`,background:"transparent",color:"#3B82F6",fontSize:11,cursor:"pointer",textAlign:"center",marginBottom:8}}>
          🔄 مزامنة الآن
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#8b95a8', fontSize: 14, transition: 'color .15s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#8b95a8'}>
          <span>📱</span>
          <span>النسخة المحمولة</span>
        </a>
      </div>
    </div>
  );

  const renderHome = () => {
    const weekData = [
      { label: 'س', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'م', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'ت', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'و', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'خ', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'ف', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
      { label: 'س', value: Math.floor(Math.random() * 20) + 5, color: '#3B82F6' },
    ];

    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>مرحباً، {userName}! 👋</h1>
          <p style={{ color: t.m, margin: '6px 0 0', fontSize: 15 }}>استمر في التعلم، أنت على الطريق الصح</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="⭐" label="نقاط الخبرة" value={progress.xp.toLocaleString()} color="#F59E0B" dark={darkMode} />
          <StatCard icon="🔥" label="سلسلة الأيام" value={progress.streak} color="#EF4444" dark={darkMode} />
          <StatCard icon="✅" label="أسئلة صحيحة" value={progress.totalCorrect} color="#22C55E" dark={darkMode} />
          <StatCard icon="📊" label="إجمالي الأسئلة" value={progress.totalAnswered} color="#3B82F6" dark={darkMode} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>مستوى التقدم</h3>
              <span style={{ background: `${lv.c}20`, color: lv.c, padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{lv.i} {lv.n}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <AccuracyRing accuracy={nextLvlProg} size={100} stroke={8} dark={darkMode} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: t.m, marginBottom: 6 }}>{progress.xp} / {nxt ? nxt.min : '∞'} XP</div>
                <div style={{ height: 8, background: t.s1, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(nextLvlProg, 100)}%`, background: `linear-gradient(90deg, ${lv.c}, ${lv.c}cc)`, borderRadius: 4, transition: 'width .8s ease' }} />
                </div>
                {nxt && <div style={{ fontSize: 12, color: t.m, marginTop: 6 }}>المستوى القادم: {nxt.i} {nxt.n}</div>}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>نشاط هذا الأسبوع</h3>
            <BarChart data={weekData} dark={darkMode} />
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>ابدأ التعلم</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '📝', title: 'اختبار الإنجليزي', desc: 'اختبر معلوماتك في الإنجليزي اليومية', color: '#3B82F6', sec: 'quiz' },
            { icon: '📖', title: 'قواعد اللغة', desc: `${GRAMMAR_TOPICS.length} موضوع قواعد مفصل`, color: '#22C55E', sec: 'grammar' },
            { icon: '💻', title: 'اختبار البرمجة', desc: 'تعلم مصطلحات البرمجة بالإنجليزي', color: '#8B5CF6', sec: 'cs-quiz' },
          ].map((c, i) => (
            <div key={i} style={{ ...styles.card, cursor: 'pointer', border: `1px solid ${c.color}22`, transition: 'all .2s' }} onClick={() => nav(c.sec)} onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${c.color}15`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}22`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: t.m }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <div style={{ maxWidth: 700 }}>
      <div style={styles.sectionTitle}>اختبار الإنجليزي 📝</div>
      <div style={styles.card}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>اختبر مستواك في الإنجليزي</h2>
        <p style={{ color: t.m, margin: '0 0 24px', fontSize: 14 }}>اختار مستوى الصعوبة rồi ابدأ الاختبار. الاختبار يتألف من 15 سؤال متعدد الخيارات.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {DIFF_ORDER.map(d => {
            const lc = LC[d];
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${lc.fill}20`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontSize: 28 }}>{DIFF_EMOJI[d]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: lc.tx, fontSize: 16 }}>{DIFF_LABELS[d]}</div>
                  <div style={{ fontSize: 13, color: t.m, marginTop: 2 }}>{d === 'Easy' ? 'أسئلة يومية بسيطة — تحيات، أرقام، ألوان' : d === 'Medium' ? 'أسئلة متوسطة — سفر، شغل، صحة' : 'أسئلة صعبة — تعبيرات، عمل رسمي، أكاديمي'}</div>
                </div>
                <span style={{ color: lc.tx, fontSize: 20 }}>←</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, padding: '14px 18px', background: t.s1, borderRadius: 10, border: `1px solid ${t.bd}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ fontSize: 13, color: t.m }}>للتجربة الكاملة مع الصوت والإيموجي، استخدم النسخة المحمولة من التطبيق</span>
        </div>
      </div>
    </div>
  );

  const renderCSQuiz = () => (
    <div style={{ maxWidth: 700 }}>
      <div style={styles.sectionTitle}>اختبار البرمجة 💻</div>
      <div style={styles.card}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>تعلم مصطلحات البرمجة بالإنجليزي</h2>
        <p style={{ color: t.m, margin: '0 0 24px', fontSize: 14 }}>اختبر معلوماتك في مصطلحات البرمجة والكمبيوتر بالإنجليزي.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {DIFF_ORDER.map(d => {
            const csColors = { Easy: { fill: '#06B6D4', bg: 'rgba(6,182,212,.1)', br: 'rgba(6,182,212,.32)', tx: '#0891B2' }, Medium: { fill: '#8B5CF6', bg: 'rgba(139,92,246,.1)', br: 'rgba(139,92,246,.32)', tx: '#7C3AED' }, Hard: { fill: '#F97316', bg: 'rgba(249,115,22,.1)', br: 'rgba(249,115,22,.32)', tx: '#EA580C' } };
            const lc = csColors[d];
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ fontSize: 28 }}>{d === 'Easy' ? '🐧' : d === 'Medium' ? '⚙️' : '🤖'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: lc.tx, fontSize: 16 }}>{DIFF_LABELS[d]}</div>
                  <div style={{ fontSize: 13, color: t.m, marginTop: 2 }}>{d === 'Easy' ? 'Linux Basics, Git, Developer Phrases' : d === 'Medium' ? 'C/C++, Python, Debugging' : 'AI/ML, Algorithms, Architecture'}</div>
                </div>
                <span style={{ color: lc.tx, fontSize: 20 }}>←</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, padding: '14px 18px', background: t.s1, borderRadius: 10, border: `1px solid ${t.bd}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ fontSize: 13, color: t.m }}>للتجربة الكاملة مع الصوت، استخدم النسخة المحمولة من التطبيق</span>
        </div>
      </div>
    </div>
  );

  const renderGrammar = () => {
    if (gramTopic) {
      const topic = gramTopic;
      const sec = topic.sections[gramSection];
      return (
        <div>
          <button onClick={() => { setGramTopic(null); setGramSection(0); }} style={{ ...styles.btn(t.m, t.s1), marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>→</span> العودة لقائمة المواضيع
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 32 }}>{topic.icon}</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{topic.title}</h2>
              <p style={{ color: t.m, margin: '4px 0 0', fontSize: 13 }}>{sec.title} — {gramSection + 1}/{topic.sections.length}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {topic.sections.map((s, i) => (
              <button key={i} onClick={() => setGramSection(i)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${i === gramSection ? '#3B82F6' : t.bd}`, background: i === gramSection ? '#3B82F6' : 'transparent', color: i === gramSection ? '#fff' : t.m, transition: 'all .15s', fontFamily: 'inherit' }}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={styles.card}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#3B82F6' }}>{sec.title}</h3>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: t.txt }} dangerouslySetInnerHTML={{ __html: sec.content }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button disabled={gramSection === 0} onClick={() => setGramSection(gramSection - 1)} style={{ ...styles.btn(gramSection === 0 ? t.m : '#3B82F6', gramSection === 0 ? t.s1 : undefined), opacity: gramSection === 0 ? 0.4 : 1, cursor: gramSection === 0 ? 'not-allowed' : 'pointer' }}>
              ← القسم السابق
            </button>
            <button disabled={gramSection >= topic.sections.length - 1} onClick={() => setGramSection(gramSection + 1)} style={{ ...styles.btn(gramSection >= topic.sections.length - 1 ? t.m : '#3B82F6', gramSection >= topic.sections.length - 1 ? t.s1 : undefined), opacity: gramSection >= topic.sections.length - 1 ? 0.4 : 1, cursor: gramSection >= topic.sections.length - 1 ? 'not-allowed' : 'pointer' }}>
              القسم التالي →
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 24, height: '100%' }}>
        <div style={{ width: 320, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={styles.sectionTitle}>قواعد اللغة 📖</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button onClick={() => setGramCat(null)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${!gramCat ? '#3B82F6' : t.bd}`, background: !gramCat ? '#3B82F6' : 'transparent', color: !gramCat ? '#fff' : t.m, transition: 'all .15s', fontFamily: 'inherit' }}>
              الكل
            </button>
            {GRAMMAR_CATS.map(cat => {
              const count = GRAMMAR_TOPICS.filter(tp => tp.cat === cat.id).length;
              if (count === 0) return null;
              return (
                <button key={cat.id} onClick={() => setGramCat(gramCat === cat.id ? null : cat.id)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${gramCat === cat.id ? cat.color : t.bd}`, background: gramCat === cat.id ? `${cat.color}20` : 'transparent', color: gramCat === cat.id ? cat.color : t.m, transition: 'all .15s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTopics.map(tp => {
              const cat = GRAMMAR_CATS.find(c => c.id === tp.cat);
              return (
                <div key={tp.id} onClick={() => goGrammarLesson(tp, 0)} style={{ ...styles.card, cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = cat?.color || '#3B82F6'; e.currentTarget.style.background = `${cat?.color || '#3B82F6'}08`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = t.bd; e.currentTarget.style.background = t.s2; }}>
                  <span style={{ fontSize: 24 }}>{tp.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tp.title}</div>
                    <div style={{ fontSize: 11, color: t.m, marginTop: 2 }}>{tp.sections.length} أقسام</div>
                  </div>
                  {cat && <span style={{ fontSize: 10, color: cat.color, background: `${cat.color}15`, padding: '2px 8px', borderRadius: 6 }}>{cat.icon}</span>}
                </div>
              );
            })}
            {filteredTopics.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: t.m, fontSize: 14 }}>
                لا توجد مواضيع تطابق البحث
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ ...styles.card, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 400 }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📖</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: t.m, margin: '0 0 8px' }}>اختر موضوعاً من القائمة</h3>
            <p style={{ fontSize: 13, color: t.s, margin: 0 }}>اضغط على أي موضوع لعرض محتواه التعليمي المفصل</p>
          </div>
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    const diffStats = { Easy: { correct: Math.floor(progress.totalCorrect * 0.5), total: Math.floor(progress.totalAnswered * 0.5) }, Medium: { correct: Math.floor(progress.totalCorrect * 0.35), total: Math.floor(progress.totalAnswered * 0.35) }, Hard: { correct: progress.totalCorrect - Math.floor(progress.totalCorrect * 0.5) - Math.floor(progress.totalCorrect * 0.35), total: progress.totalAnswered - Math.floor(progress.totalAnswered * 0.5) - Math.floor(progress.totalAnswered * 0.35) } };

    return (
      <div>
        <div style={styles.sectionTitle}>التقدم والإنجازات 📊</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={styles.card}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>ملخص الأداء</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <AccuracyRing accuracy={accuracy} size={120} stroke={8} dark={darkMode} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: t.m }}>الإجابات الصحيحة</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#22C55E' }}>{progress.totalCorrect}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: t.m }}>إجمالي الأسئلة</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: t.txt }}>{progress.totalAnswered}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: t.m }}>أفضل سلسلة</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#F59E0B' }}>{progress.bestStreak} 🔥</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>المستوى الحالي</h3>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{lv.i}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: lv.c }}>{lv.n}</div>
              <div style={{ fontSize: 13, color: t.m, marginTop: 4 }}>{progress.xp} نقطة خبرة</div>
              {nxt && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.m, marginBottom: 6 }}>
                    <span>{lv.n}</span>
                    <span>{nxt.n}</span>
                  </div>
                  <div style={{ height: 8, background: t.s1, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(nextLvlProg, 100)}%`, background: `linear-gradient(90deg, ${lv.c}, ${nxt.c})`, borderRadius: 4, transition: 'width .8s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, color: t.m, marginTop: 6 }}>{nxt.min - progress.xp} نقطة للوصول للمستوى التالي</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>الأداء حسب المستوى</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {DIFF_ORDER.map(d => {
              const lc = LC[d];
              const s = diffStats[d];
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <div key={d} style={{ background: lc.bg, border: `1px solid ${lc.br}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{DIFF_EMOJI[d]}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: lc.tx }}>{DIFF_LABELS[d]}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: lc.tx, margin: '10px 0' }}>%{pct}</div>
                  <div style={{ fontSize: 12, color: t.m }}>{s.correct} / {s.total} سؤال</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div style={{ maxWidth: 700 }}>
      <div style={styles.sectionTitle}>الملف الشخصي 👤</div>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${lv.c}, ${lv.c}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 32, boxShadow: `0 4px 20px ${lv.c}30` }}>
            {userName.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{userName}</h2>
            <p style={{ color: t.m, margin: '4px 0 0', fontSize: 14 }}>{userEmail}</p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: `${lv.c}18`, color: lv.c, padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {lv.i} {lv.n}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <StatCard icon="⭐" label="إجمالي النقاط" value={progress.xp.toLocaleString()} color="#F59E0B" dark={darkMode} />
          <StatCard icon="🔥" label="سلسلة الأيام" value={`${progress.streak} يوم`} color="#EF4444" dark={darkMode} />
          <StatCard icon="✅" label="الإجابات الصحيحة" value={progress.totalCorrect} color="#22C55E" dark={darkMode} />
          <StatCard icon="📈" label="نسبة الدقة" value={`${accuracy}%`} color="#3B82F6" dark={darkMode} />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>الإعدادات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: t.s1, borderRadius: 12, border: `1px solid ${t.bd}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{darkMode ? '🌙' : '☀️'}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>الوضع الداكن</div>
                <div style={{ fontSize: 12, color: t.m }}>تبديل بين الوضع الداكن والفاتح</div>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: darkMode ? '#3B82F6' : t.bdS, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: darkMode ? 24 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: t.s1, borderRadius: 12, border: `1px solid ${t.bd}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🔊</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>الصوت</div>
                <div style={{ fontSize: 12, color: t.m }}>تشغيل أو إيقاف أصوات التطبيق</div>
              </div>
            </div>
            <button onClick={() => { const nc = { ...cfg, sound: !cfg.sound }; setCfg(nc); sCfg(nc); }} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: cfg.sound ? '#3B82F6' : t.bdS, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: cfg.sound ? 24 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: t.s1, borderRadius: 12, border: `1px solid ${t.bd}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>✏️</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>تعديل الملف الشخصي</div>
                <div style={{ fontSize: 12, color: t.m }}>تغيير الاسم أو البريد الإلكتروني</div>
              </div>
            </div>
            <span style={{ color: t.m, fontSize: 16 }}>←</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: t.s1, borderRadius: 12, border: `1px solid ${t.bd}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🔄</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>إعادة التعيين</div>
                <div style={{ fontSize: 12, color: t.m }}>مسح جميع البيانات والبدء من جديد</div>
              </div>
            </div>
            <button style={{ ...styles.btn('#EF4444', 'rgba(239,68,68,.08)'), fontSize: 12, padding: '6px 14px' }}>إعادة</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'home': return renderHome();
      case 'quiz': return renderQuiz();
      case 'grammar':
      case 'grammar-lesson': return renderGrammar();
      case 'cs-quiz': return renderCSQuiz();
      case 'progress': return renderProgress();
      case 'leaderboard':
        if(leaderboard.length===0&&!leaderboardLoading)fetchLeaderboard();
        return(
          <div style={{padding:"24px 32px",maxWidth:1200}}>
            <h2 style={{fontSize:22,fontWeight:700,color:darkMode?"#e8edf5":"#111827",marginBottom:20}}>🏆 لوحة الصدارة</h2>
            <div style={{display:"flex",gap:24}}>
              {/* Left: My rank */}
              <div style={{width:320,flexShrink:0}}>
                <div style={{background:"linear-gradient(135deg,rgba(245,158,11,.1),rgba(239,68,68,.1))",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:20,marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:darkMode?"#e8edf5":"#111827",marginBottom:8}}>ترتيبك الحالي</div>
                  {leaderboardRank?<div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:36,fontWeight:800,color:"#F59E0B"}}>#{leaderboardRank}</div>
                    <div>
                      <div style={{fontSize:13,color:darkMode?"#8b95a8":"#6b7280"}}>{(JSON.parse(localStorage.getItem("e5k_p13")||"{}").xp||0).toLocaleString()} XP</div>
                      <div style={{fontSize:13,color:darkMode?"#8b95a8":"#6b7280"}}>{(JSON.parse(localStorage.getItem("e5k_p13")||"{}").bestStreak||0)} streak</div>
                    </div>
                  </div>:<div style={{fontSize:13,color:darkMode?"#8b95a8":"#6b7280"}}>سجّل دخول عشان تشوف ترتيبك</div>}
                </div>
                <div style={{background:darkMode?"#1c2540":"#fff",border:`1px solid ${darkMode?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`,borderRadius:12,padding:20}}>
                  <div style={{fontSize:13,fontWeight:700,color:darkMode?"#e8edf5":"#111827",marginBottom:8}}>📊 كيف بيتحسب الترتيب؟</div>
                  <div style={{fontSize:12,color:darkMode?"#8b95a8":"#6b7280",lineHeight:1.8}}>
                    الترتيب الذكي بيجمع بين:<br/>
                    • <b>60%</b> إجمالي النقاط (XP)<br/>
                    • <b>20%</b> أفضل سلسلة يومية (Streak)<br/>
                    • <b>20%</b> نسبة الإجابة الصحيحة
                  </div>
                </div>
              </div>
              {/* Right: Full leaderboard */}
              <div style={{flex:1}}>
                {leaderboardLoading?<div style={{textAlign:"center",padding:40,color:darkMode?"#8b95a8":"#6b7280"}}>⏳ جاري التحميل...</div>:(
                  <div style={{background:darkMode?"#1c2540":"#fff",border:`1px solid ${darkMode?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`,borderRadius:12,overflow:"hidden"}}>
                    {/* Table header */}
                    <div style={{display:"flex",padding:"12px 20px",borderBottom:`1px solid ${darkMode?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`,background:darkMode?"#141c2b":"#f8fafc",fontSize:11,fontWeight:700,color:darkMode?"#8b95a8":"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>
                      <div style={{width:60}}>الترتيب</div>
                      <div style={{flex:1}}>المستخدم</div>
                      <div style={{width:100,textAlign:"center"}}>المستوى</div>
                      <div style={{width:80,textAlign:"center"}}>🔥 Streak</div>
                      <div style={{width:80,textAlign:"center"}}>🎯 Accuracy</div>
                      <div style={{width:100,textAlign:"center"}}>XP</div>
                    </div>
                    {/* Rows */}
                    {leaderboard.map((u,i)=>{
                      const isMe=u.id===JSON.parse(localStorage.getItem("e5k_u13")||"{}").id;
                      return(
                        <div key={u.id} style={{display:"flex",padding:"12px 20px",borderBottom:`1px solid ${darkMode?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"}`,background:isMe?(darkMode?"rgba(59,130,246,.08)":"rgba(59,130,246,.05)"):"transparent",alignItems:"center",fontSize:13}}>
                          <div style={{width:60,fontWeight:700,color:u.medal?"#F59E0B":darkMode?"#e8edf5":"#111827"}}>
                            {u.medal?<span style={{fontSize:20}}>{u.medal}</span>:<span>#{u.rank}</span>}
                          </div>
                          <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:32,height:32,borderRadius:"50%",background:u.photo?"#000":avC(u.name||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0,overflow:"hidden"}}>
                              {u.photo?<img src={u.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(u.name||"?").charAt(0).toUpperCase()}
                            </div>
                            <span style={{fontWeight:isMe?700:500,color:isMe?"#3B82F6":darkMode?"#e8edf5":"#111827"}}>{u.name}{isMe?" (أنت)":""}</span>
                          </div>
                          <div style={{width:100,textAlign:"center",fontSize:12,color:u.levelColor}}>{u.levelIcon} {u.level}</div>
                          <div style={{width:80,textAlign:"center",fontWeight:600,color:darkMode?"#e8edf5":"#111827"}}>{u.bestStreak}</div>
                          <div style={{width:80,textAlign:"center",color:u.accuracy>=80?"#22C55E":u.accuracy>=50?"#F59E0B":"#EF4444"}}>{u.accuracy}%</div>
                          <div style={{width:100,textAlign:"center",fontWeight:800,color:"#F59E0B"}}>{u.xp.toLocaleString()}</div>
                        </div>
                      );
                    })}
                    {leaderboard.length===0&&<div style={{padding:40,textAlign:"center",color:darkMode?"#8b95a8":"#6b7280"}}>لا يوجد مستخدمين بعد</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; }
        body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,.4); }
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          body::after { content: 'النسخة المحمولة متاحة فقط على الشاشات الصغيرة'; display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 18px; color: #8b95a8; text-align: center; padding: 40px; }
        }
        button { font-family: 'Cairo', system-ui, -apple-system, sans-serif; }
        a { font-family: 'Cairo', system-ui, -apple-system, sans-serif; }
        input { font-family: 'Cairo', system-ui, -apple-system, sans-serif; }
      `}</style>
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
