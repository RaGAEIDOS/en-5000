import { useState, useEffect } from 'react';

const LIGHT = {
  bg: '#f0f4f8',
  card: 'rgba(255,255,255,0.85)',
  cardBorder: 'rgba(0,0,0,0.06)',
  text: '#1a1a2e',
  textSec: '#555',
  navBg: 'rgba(240,244,248,0.8)',
  footerBg: '#e2e8f0',
  faqBg: 'rgba(255,255,255,0.9)',
  testimonialBg: 'rgba(255,255,255,0.9)',
  statBg: 'rgba(255,255,255,0.15)',
  stepCard: 'rgba(255,255,255,0.9)',
  flagBg: 'rgba(255,255,255,0.95)',
  flagItemBg: '#f8fafc',
};

const DARK = {
  bg: '#0c111a',
  card: 'rgba(20,28,43,0.85)',
  cardBorder: 'rgba(59,130,246,0.1)',
  text: '#e8ecf1',
  textSec: '#94a3b8',
  navBg: 'rgba(12,17,26,0.8)',
  footerBg: '#080d14',
  faqBg: 'rgba(20,28,43,0.9)',
  testimonialBg: 'rgba(20,28,43,0.9)',
  statBg: 'rgba(59,130,246,0.08)',
  stepCard: 'rgba(20,28,43,0.9)',
  flagBg: 'rgba(20,28,43,0.95)',
  flagItemBg: 'rgba(30,41,59,0.6)',
};

const S = {};

S.page = (dark, c) => ({
  fontFamily: "'Cairo', sans-serif",
  background: c.bg,
  color: c.text,
  minHeight: '100vh',
  overflowX: 'hidden',
  transition: 'background 0.4s, color 0.4s',
  direction: 'rtl',
});

S.nav = (c) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: c.navBg,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${c.cardBorder}`,
  padding: '0 2rem',
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'background 0.4s',
});

S.navLogo = {
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#3B82F6',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  userSelect: 'none',
};

S.navLinks = {
  display: 'flex',
  gap: '2rem',
  alignItems: 'center',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

S.navLink = (c) => ({
  color: c.text,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'color 0.3s',
  position: 'relative',
  padding: '0.25rem 0',
});

S.navActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

S.toggleBtn = (c) => ({
  background: 'none',
  border: `2px solid ${c.cardBorder}`,
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: c.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s',
  flexShrink: 0,
});

S.ctaSmall = {
  background: '#3B82F6',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '0.6rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 700,
  fontFamily: "'Cairo', sans-serif",
  cursor: 'pointer',
  transition: 'all 0.3s',
  whiteSpace: 'nowrap',
};

S.hero = (c) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '70px',
});

S.heroBg = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/2560px-Flag_of_Egypt.svg.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.18,
  filter: 'blur(2px)',
  animation: 'heroZoom 20s ease-in-out infinite alternate',
};

S.heroOverlay = (dark) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: dark
    ? 'linear-gradient(180deg, rgba(12,17,26,0.92) 0%, rgba(12,17,26,0.75) 50%, rgba(12,17,26,0.95) 100%)'
    : 'linear-gradient(180deg, rgba(240,244,248,0.88) 0%, rgba(240,244,248,0.7) 50%, rgba(240,244,248,0.92) 100%)',
});

S.heroContent = {
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  maxWidth: '900px',
  padding: '2rem',
};

S.heroBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  color: '#fff',
  padding: '0.5rem 1.2rem',
  borderRadius: '50px',
  fontSize: '0.85rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  animation: 'fadeInUp 0.8s ease',
  boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
};

S.heroTitle = (c) => ({
  fontSize: 'clamp(2.2rem, 5vw, 4rem)',
  fontWeight: 900,
  lineHeight: 1.2,
  marginBottom: '1rem',
  color: c.text,
  animation: 'fadeInUp 0.8s ease 0.1s both',
});

S.heroSub = (c) => ({
  fontSize: 'clamp(1rem, 2vw, 1.3rem)',
  color: c.textSec,
  lineHeight: 1.8,
  marginBottom: '2rem',
  maxWidth: '650px',
  margin: '0 auto 2rem',
  animation: 'fadeInUp 0.8s ease 0.2s both',
});

S.heroBtns = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: '3rem',
  animation: 'fadeInUp 0.8s ease 0.3s both',
};

S.btnPrimary = {
  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '1rem 2.5rem',
  fontSize: '1.15rem',
  fontWeight: 800,
  fontFamily: "'Cairo', sans-serif",
  cursor: 'pointer',
  transition: 'all 0.3s',
  boxShadow: '0 4px 25px rgba(59,130,246,0.35)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
};

S.btnSecondary = (c) => ({
  background: 'transparent',
  color: c.text,
  border: `2px solid ${c.text}`,
  borderRadius: '14px',
  padding: '1rem 2.5rem',
  fontSize: '1.15rem',
  fontWeight: 800,
  fontFamily: "'Cairo', sans-serif",
  cursor: 'pointer',
  transition: 'all 0.3s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
});

S.statsRow = (c) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: '2rem',
  flexWrap: 'wrap',
  animation: 'fadeInUp 0.8s ease 0.4s both',
});

S.statItem = (c) => ({
  textAlign: 'center',
  padding: '1rem 1.5rem',
  borderRadius: '16px',
  background: c.statBg,
  backdropFilter: 'blur(10px)',
  minWidth: '120px',
  border: `1px solid ${c.cardBorder}`,
});

S.statNum = {
  fontSize: '1.8rem',
  fontWeight: 900,
  color: '#3B82F6',
  display: 'block',
};

S.statLabel = (c) => ({
  fontSize: '0.85rem',
  color: c.textSec,
  fontWeight: 600,
});

S.section = (c) => ({
  padding: '5rem 2rem',
  maxWidth: '1200px',
  margin: '0 auto',
});

S.sectionTitle = (c) => ({
  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
  fontWeight: 900,
  textAlign: 'center',
  marginBottom: '1rem',
  color: c.text,
});

S.sectionSub = (c) => ({
  textAlign: 'center',
  color: c.textSec,
  fontSize: '1.05rem',
  marginBottom: '3rem',
  maxWidth: '600px',
  margin: '0 auto 3rem',
  lineHeight: 1.7,
});

S.featureGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem',
};

S.featureCard = (c) => ({
  background: c.card,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${c.cardBorder}`,
  borderRadius: '20px',
  padding: '2rem',
  transition: 'all 0.35s ease',
  cursor: 'default',
  position: 'relative',
  overflow: 'hidden',
});

S.featureIcon = {
  fontSize: '2.5rem',
  marginBottom: '1rem',
  display: 'block',
};

S.featureTitle = (c) => ({
  fontSize: '1.2rem',
  fontWeight: 800,
  marginBottom: '0.6rem',
  color: c.text,
});

S.featureDesc = (c) => ({
  fontSize: '0.95rem',
  color: c.textSec,
  lineHeight: 1.7,
});

S.flagsSection = (c) => ({
  padding: '5rem 2rem',
  background: c.card,
  backdropFilter: 'blur(12px)',
  borderTop: `1px solid ${c.cardBorder}`,
  borderBottom: `1px solid ${c.cardBorder}`,
});

S.flagsInner = {
  maxWidth: '1200px',
  margin: '0 auto',
};

S.flagsGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.2rem',
};

S.flagItem = (c, isMain) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.4rem',
  padding: isMain ? '1rem 2rem' : '0.5rem',
  background: c.flagItemBg,
  borderRadius: isMain ? '20px' : '14px',
  border: isMain ? '2px solid #3B82F6' : `1px solid ${c.cardBorder}`,
  transition: 'all 0.3s',
  cursor: 'default',
  flexShrink: 0,
});

S.flagImg = (isMain) => ({
  width: isMain ? '80px' : '40px',
  height: isMain ? '54px' : '27px',
  borderRadius: '4px',
  objectFit: 'cover',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
});

S.flagName = (c) => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  color: c.textSec,
});

S.grammarGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.2rem',
};

S.grammarCard = (c) => ({
  background: c.card,
  border: `1px solid ${c.cardBorder}`,
  borderRadius: '16px',
  padding: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  transition: 'all 0.3s',
  cursor: 'default',
});

S.grammarIcon = {
  fontSize: '2rem',
  flexShrink: 0,
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.1)',
};

S.grammarTitle = (c) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: c.text,
  marginBottom: '0.2rem',
});

S.grammarCount = (c) => ({
  fontSize: '0.8rem',
  color: '#3B82F6',
  fontWeight: 600,
});

S.stepsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
  maxWidth: '1000px',
  margin: '0 auto',
};

S.stepCard = (c) => ({
  background: c.stepCard,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${c.cardBorder}`,
  borderRadius: '20px',
  padding: '2.5rem 2rem',
  textAlign: 'center',
  transition: 'all 0.3s',
});

S.stepNum = {
  fontSize: '3rem',
  marginBottom: '1rem',
};

S.stepTitle = (c) => ({
  fontSize: '1.3rem',
  fontWeight: 800,
  color: c.text,
  marginBottom: '0.6rem',
});

S.stepDesc = (c) => ({
  color: c.textSec,
  fontSize: '0.95rem',
  lineHeight: 1.7,
});

S.testimonialsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem',
};

S.testimonialCard = (c) => ({
  background: c.testimonialBg,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${c.cardBorder}`,
  borderRadius: '20px',
  padding: '2rem',
  transition: 'all 0.3s',
});

S.stars = {
  color: '#FBBF24',
  fontSize: '1.1rem',
  marginBottom: '0.8rem',
  letterSpacing: '2px',
};

S.testimonialQuote = (c) => ({
  fontSize: '1rem',
  lineHeight: 1.8,
  color: c.text,
  marginBottom: '1rem',
  fontStyle: 'italic',
});

S.testimonialAuthor = {
  fontWeight: 700,
  color: '#3B82F6',
  fontSize: '0.95rem',
};

S.faqList = {
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

S.faqItem = (c, open) => ({
  background: c.faqBg,
  border: `1px solid ${open ? '#3B82F6' : c.cardBorder}`,
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s',
});

S.faqQ = (c) => ({
  padding: '1.2rem 1.5rem',
  fontWeight: 700,
  fontSize: '1.05rem',
  color: c.text,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  width: '100%',
  fontFamily: "'Cairo', sans-serif",
  textAlign: 'right',
});

S.faqA = (c) => ({
  padding: '0 1.5rem 1.2rem',
  color: c.textSec,
  fontSize: '0.95rem',
  lineHeight: 1.8,
  borderTop: `1px solid ${c.cardBorder}`,
  paddingTop: '1rem',
});

S.faqArrow = (open) => ({
  transition: 'transform 0.3s',
  transform: open ? 'rotate(180deg)' : 'rotate(0)',
  fontSize: '1.2rem',
  flexShrink: 0,
  marginLeft: '1rem',
});

S.ctaSection = (dark) => ({
  padding: '5rem 2rem',
  background: dark
    ? 'linear-gradient(135deg, #1e3a5f 0%, #0c111a 50%, #1a1040 100%)'
    : 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #ede9fe 100%)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
});

S.ctaTitle = (c) => ({
  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
  fontWeight: 900,
  color: c.text,
  marginBottom: '2rem',
});

S.footer = (c) => ({
  background: c.footerBg,
  borderTop: `1px solid ${c.cardBorder}`,
  padding: '3rem 2rem 1.5rem',
  transition: 'background 0.4s',
});

S.footerInner = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'start',
  gap: '2rem',
};

S.footerCol = {
  minWidth: '200px',
};

S.footerLogo = {
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#3B82F6',
  marginBottom: '0.5rem',
};

S.footerText = (c) => ({
  color: c.textSec,
  fontSize: '0.9rem',
  lineHeight: 1.7,
});

S.footerLinks = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

S.footerLink = (c) => ({
  color: c.textSec,
  textDecoration: 'none',
  fontSize: '0.9rem',
  display: 'block',
  padding: '0.3rem 0',
  cursor: 'pointer',
  transition: 'color 0.3s',
});

S.footerSocials = {
  display: 'flex',
  gap: '0.8rem',
  marginTop: '0.5rem',
};

S.socialIcon = (c) => ({
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: c.cardBorder,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s',
});

S.footerBottom = (c) => ({
  textAlign: 'center',
  color: c.textSec,
  fontSize: '0.85rem',
  marginTop: '2rem',
  paddingTop: '1rem',
  borderTop: `1px solid ${c.cardBorder}`,
});

const features = [
  { icon: '\u{1F5E3}\uFE0F', title: 'التحدث بالعربي المصري', desc: 'اسمع الجمل واتكلم باللكنة المصرية الصحيحة. تسجيل صوتي ومقارنة فورية مع النطق الأصلي.' },
  { icon: '\u{1F9E0}', title: 'تعلم بالذكاء الاصطناعي', desc: 'معلم AI بيفهم مستواك وي Adapt الأسئلة حسب قوتك وضعفك. تعلم بسرعة وأ效率更高.' },
  { icon: '\u{1F4D6}', title: 'قواعد مفصّلة', desc: '33 موضوع في قواعد الإنجليزي بالعربي الفصيح. كل قاعدة بأمثلة تطبيقية وتمارين تفاعلية.' },
  { icon: '\u{1F4BB}', title: 'إنجليزي للمبرمجين', desc: 'Linux, Git, C++, Python, AI/ML — اتعلم المصطلحات التقنية اللي محتاجها في الشغل والـ CS.' },
  { icon: '\u{1F3AE}', title: 'تعليم باللعبة', desc: ' نظام XP وstreaks ومستويات. كل يوم أسئلة جديدة، اكسب نقاط، واترقى للمستويات العليا.' },
  { icon: '\u{1F30D}', title: 'ترجمة فورية', desc: 'اضغط على أي كلمة وترجمها فوراً. قاموس مدمج مع أمثلة_usage وشروحات بالعربي.' },
];

const countries = [
  { code: 'eg', name: 'مصر', main: true },
  { code: 'sa', name: 'السعودية' },
  { code: 'iq', name: 'العراق' },
  { code: 'jo', name: 'الأردن' },
  { code: 'lb', name: 'لبنان' },
  { code: 'ps', name: 'فلسطين' },
  { code: 'sy', name: 'سوريا' },
  { code: 'ae', name: 'الإمارات' },
  { code: 'kw', name: 'الكويت' },
  { code: 'qa', name: 'قطر' },
  { code: 'bh', name: 'البحرين' },
  { code: 'om', name: 'عُمان' },
  { code: 'ly', name: 'ليبيا' },
  { code: 'tn', name: 'تونس' },
  { code: 'dz', name: 'الجزائر' },
  { code: 'ma', name: 'المغرب' },
  { code: 'sd', name: 'السودان' },
];

const grammarTopics = [
  { icon: '\u23F1\uFE0F', title: 'الأزمنة (Tenses)', count: '12 قسم فرعي' },
  { icon: '\u{1F4A1}', title: 'الشروط (Conditionals)', count: '4 أنواع' },
  { icon: '\u2699\uFE0F', title: 'المبني للمجهول (Passive)', count: '5 أزمنة' },
  { icon: '\u{1F6E0}\uFE0F', title: 'الأفعال المساعدة (Modals)', count: '10 استخدامات' },
  { icon: '\u{1F4AC}', title: 'الكلام المنقول (Reported Speech)', count: '6 قواعد' },
  { icon: '\u{1F4D6}', title: 'ال gerunds والـ infinitives', count: '8 موضوعات' },
  { icon: '\u{1F517}', title: 'الجمل الوصفية (Relative Clauses)', count: '5 أنواع' },
];

const steps = [
  { num: '1\uFE0F\u20E3', title: 'اختر مستواك', desc: 'ابدأ من أي مستوى — مبتدئ أو متوسط أو متقدم. الإختبار ال initialised يحدد مستواك بدقة.' },
  { num: '2\uFE0F\u20E3', title: 'تعلم كل يوم', desc: 'كل يوم أسئلة جديدة مولّدة بالذكاء الاصطناعي. تعلم في 15-20 دقيقة بس!' },
  { num: '3\uFE0F\u20E3', title: 'تابع تقدمك', desc: 'شوف تقدمك بالـ XP والـ streaks والمستويات. احصل على شهادات إنجاز كل ما تخلص موضوع.' },
];

const testimonials = [
  { stars: 5, quote: 'التطبيق ده غيّر حياتي! كنت بخاف أتكلم إنجليزي في الشغل، دلوقتي بتكلم مع العملاء بثقة تامة. شكراً EN-5000!', name: 'أحمد محمد — مهندس برمجيات' },
  { stars: 5, quote: 'أحسن تطبيق إنجليزي لقيته. القواعد بالعربي منظمة جداً والمصطلحات التقنية ساعدتني أحسن في شغلي.', name: 'سارة حسن — مبرمجة' },
  { stars: 4, quote: 'ابني عنده 12 سنة وبيتعلم على التطبيق. نظام اللعبة بيخليه متحمس كل يوم يفتح يحل. شكرًا على المحتوى الرائع!', name: 'منى عبد الرحمن — أم' },
];

const faqs = [
  { q: 'التطبيق مجاني فعلاً؟', a: 'أيوه، التطبيق مجاني 100% بدون أي اشتراكات مخفية. كل المحتوى متاح بدون ما تدفع حاجة.' },
  { q: 'ازاي الذكاء الاصطناعي بيساعدني أتعلم؟', a: 'الـ AI بيتبع مستواك وبيفهم فين نقاط ضعفك. كل أسئلة مصممة خصوصاً ليك، وبيركز على المواضيع اللي محتاج تتمرن عليها أكتر.' },
  { q: 'الإنجليزي للمبرمجين إيه بالظبط؟', a: 'فيه قسم خاص بالمصطلحات التقنية زي Linux وGit وPython والـ AI/ML. هتتعلم إزاي تكتب وتفهم الكود والـ documentation بالإنجليزي.' },
  { q: 'محتاج أنترنت عشان أستخدم التطبيق؟', a: 'معظم المحتوى متاح offline بعد ماتحمله مرة. بس الميزات اللي فيها AI محتاجة نت.' },
  { q: 'التطبيق بيشتغل على أي موبايل؟', a: 'أيوه، التطبيق بيشتغل على Android وiOS والمتصفح كمان. تقدر تتعلم من أي جهاز عندك.' },
  { q: 'هتبقى فيه محتوى جديد؟', a: 'أكيد! بنضيف محتوى جديد كل أسبوع. قواعد جديدة، أسئلة، ومصطلحات تقنية. الإشعارات هتنزلك كل ما يبقى فيه حاجة جديدة.' },
];

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showArticle, setShowArticle] = useState(false);

  const c = dark ? DARK : LIGHT;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNav(false);
  };

  const goApp = () => { window.location.hash = '#app'; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes pulse { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.05); } }
        @keyframes float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-8px); } }
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hero-stats { gap: 1rem !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        .feature-card:hover { transform: translateY(-6px) !important; box-shadow: 0 12px 40px rgba(59,130,246,0.15) !important; }
        .step-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(59,130,246,0.12) !important; }
        .testimonial-card:hover { transform: translateY(-4px) !important; }
        .grammar-card:hover { transform: translateY(-3px) !important; border-color: #3B82F6 !important; }
        .flag-item:hover { transform: scale(1.1) !important; }
        .cta-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px rgba(59,130,246,0.4) !important; }
        .secondary-btn:hover { background: ${dark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)'} !important; border-color: #3B82F6 !important; color: #3B82F6 !important; }
        .toggle-btn:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important; }
        .social-icon:hover { background: #3B82F6 !important; color: #fff !important; transform: translateY(-2px); }
        .footer-link:hover { color: #3B82F6 !important; }
        .nav-link-item:hover { color: #3B82F6 !important; }
        .scroll-animate { animation: fadeInUp 0.7s ease both; }
      `}</style>

      <div style={S.page(dark, c)}>
        {/* NAVBAR */}
        <nav style={{ ...S.nav(c), boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none' }}>
          <div style={S.navLogo} onClick={goApp}>
            <img src="/logo.png" alt="EN-5000" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            <span>EN-5000</span>
          </div>
          <ul className="nav-links-desktop" style={S.navLinks}>
            {[
              { label: 'المميزات', id: 'features' },
              { label: 'القواعد', id: 'grammar' },
              { label: 'الدول', id: 'flags' },
              { label: 'الأسئلة', id: 'faq' },
            ].map((l) => (
              <li key={l.id}>
                <span
                  className="nav-link-item"
                  style={S.navLink(c)}
                  onClick={() => scrollTo(l.id)}
                  onMouseEnter={(e) => (e.target.style.color = '#3B82F6')}
                  onMouseLeave={(e) => (e.target.style.color = c.text)}
                >
                  {l.label}
                </span>
              </li>
            ))}
          </ul>
          <div style={S.navActions}>
            <button
              className="toggle-btn"
              style={S.toggleBtn(c)}
              onClick={() => setDark(!dark)}
              title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {dark ? '\u2600\uFE0F' : '\u{1F319}'}
            </button>
            <button className="cta-btn" style={S.ctaSmall} onClick={goApp}>
              {'\u{1F310}'} ابدأ الآن
            </button>
            <button
              className="mobile-menu-btn"
              style={{ ...S.toggleBtn(c), display: 'none' }}
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? '\u2715' : '\u2630'}
            </button>
          </div>
        </nav>

        {/* MOBILE NAV OVERLAY */}
        {mobileNav && (
          <div
            style={{
              position: 'fixed', top: 70, left: 0, right: 0, bottom: 0,
              background: dark ? 'rgba(12,17,26,0.97)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)', zIndex: 999, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem',
            }}
          >
            {[
              { label: 'المميزات', id: 'features' },
              { label: 'القواعد', id: 'grammar' },
              { label: 'الدول', id: 'flags' },
              { label: 'الأسئلة', id: 'faq' },
            ].map((l) => (
              <span key={l.id} style={{ fontSize: '1.3rem', fontWeight: 700, color: c.text, cursor: 'pointer' }} onClick={() => scrollTo(l.id)}>
                {l.label}
              </span>
            ))}
          </div>
        )}

        {/* HERO */}
        <section style={S.hero(c)}>
          <div style={S.heroBg} />
          <div style={S.heroOverlay(dark)} />
          <div style={S.heroContent}>
            <div style={S.heroBadge}>
              {'\u2728'} AI Powered Learning
            </div>
            <h1 style={S.heroTitle(c)}>
              {'\u{1F1EA}\u{1F1EC}'} اتعلم إنجليزي زي المحترفين
            </h1>
            <p style={S.heroSub(c)}>
              تطبيق ذكي مصري — 5000 جملة، قواعد مفصّلة، وأسلوب تعليمي ممتع. ابدأ رحلتك في تعلم الإنجليزي مع معلم AI بيفهمك ويعلمك بالعربي المصري.
            </p>
            <div style={S.heroBtns}>
              <button className="cta-btn" style={S.btnPrimary} onClick={goApp}>
                {'\u{1F680}'} ابدأ مجاناً
              </button>
              <button
                className="secondary-btn"
                style={S.btnSecondary(c)}
                onClick={() => scrollTo('grammar')}
              >
                {'\u{1F4D6}'} شوف القواعد
              </button>
            </div>
            <div className="hero-stats" style={S.statsRow(c)}>
              {[
                { num: '5,000+', label: 'جملة وعبارة' },
                { num: '33+', label: 'موضوع قواعد' },
                { num: '100%', label: 'مجاني' },
                { num: '24/7', label: 'معلم AI' },
              ].map((s, i) => (
                <div key={i} style={S.statItem(c)}>
                  <span style={S.statNum}>{s.num}</span>
                  <span style={S.statLabel(c)}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={S.section(c)}>
          <h2 style={S.sectionTitle(c)}>
            {'\u2728'} ليه EN-5000؟
          </h2>
          <p style={S.sectionSub(c)}>
            مش مجرد تطبيق كلام — فيه كل اللي محتاجه عشان تتعلم إنجليزي من الصفر وتوصل لمستوى احترافي.
          </p>
          <div style={S.featureGrid}>
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card scroll-animate"
                style={{
                  ...S.featureCard(c),
                  animationDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.cardBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={S.featureIcon}>{f.icon}</span>
                <h3 style={S.featureTitle(c)}>{f.title}</h3>
                <p style={S.featureDesc(c)}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FLAGS */}
        <section id="flags" style={S.flagsSection(c)}>
          <div style={S.flagsInner}>
            <h2 style={S.sectionTitle(c)}>
              {'\u{1F30D}'} تعلّم بالعربي — من كل الدول
            </h2>
            <p style={S.sectionSub(c)}>
              محتوى مصمم للعربيين في كل مكان. مهما كانت دولتك، هتلاقي المحتوى مناسب ليك.
            </p>
            <div style={S.flagsGrid}>
              {countries.map((co) => (
                <div
                  key={co.code}
                  className="flag-item"
                  style={S.flagItem(c, co.main)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.12)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w80/${co.code}.png`}
                    alt={co.name}
                    style={S.flagImg(co.main)}
                    loading="lazy"
                  />
                  <span style={S.flagName(c)}>{co.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GRAMMAR */}
        <section id="grammar" style={S.section(c)}>
          <h2 style={S.sectionTitle(c)}>
            {'\u{1F4DA}'} قواعد الإنجليزي المتقدمة
          </h2>
          <p style={S.sectionSub(c)}>
            33 موضوع في قواعد الإنجليزي، كل واحد مفصّل بالعربي الفصيح مع أمثلة وتمارين.
          </p>
          <div style={S.grammarGrid}>
            {grammarTopics.map((g, i) => (
              <div
                key={i}
                className="grammar-card"
                style={{ ...S.grammarCard(c), animationDelay: `${i * 0.08}s` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.cardBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={S.grammarIcon}>{g.icon}</div>
                <div>
                  <div style={S.grammarTitle(c)}>{g.title}</div>
                  <div style={S.grammarCount(c)}>{g.count}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={S.section(c)}>
          <h2 style={S.sectionTitle(c)}>
            {'\u{1F4A1}'} ازاي تبدأ؟
          </h2>
          <p style={S.sectionSub(c)}>
            3 خطوات بسيطة وابدأ تتعلم إنجليزي من غير ما تصرف فلوس.
          </p>
          <div style={S.stepsGrid}>
            {steps.map((st, i) => (
              <div
                key={i}
                className="step-card scroll-animate"
                style={{ ...S.stepCard(c), animationDelay: `${i * 0.15}s` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.cardBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={S.stepNum}>{st.num}</div>
                <h3 style={S.stepTitle(c)}>{st.title}</h3>
                <p style={S.stepDesc(c)}>{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={S.section(c)}>
          <h2 style={S.sectionTitle(c)}>
            {'\u{1F4DD}'} المستخدمين بيقولوا إيه
          </h2>
          <p style={S.sectionSub(c)}>
            آلاف المستخدمين اتعلموا بالتطبيق. شوف تجاربهم.
          </p>
          <div style={S.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial-card scroll-animate"
                style={{
                  ...S.testimonialCard(c),
                  animationDelay: `${i * 0.12}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.cardBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={S.stars}>{'\u2605'.repeat(t.stars)}{'\u2606'.repeat(5 - t.stars)}</div>
                <p style={S.testimonialQuote(c)}>"{t.quote}"</p>
                <span style={S.testimonialAuthor}>{t.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={S.section(c)}>
          <h2 style={S.sectionTitle(c)}>
            {'\u2753'} الأسئلة الشائعة
          </h2>
          <p style={S.sectionSub(c)}>
            عندك سؤال؟ هنا هتلاقي الإجابة.
          </p>
          <div style={S.faqList}>
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={S.faqItem(c, isOpen)}>
                  <button
                    style={S.faqQ(c)}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = c.text)}
                  >
                    <span>{f.q}</span>
                    <span style={S.faqArrow(isOpen)}>{'\u25BC'}</span>
                  </button>
                  {isOpen && (
                    <div style={S.faqA(c)}>
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section style={S.ctaSection(dark)}>
          <h2 style={S.ctaTitle(c)}>
            {'\u{1F680}'} جاهز تبدأ رحلتك؟
          </h2>
          <p style={{ color: c.textSec, fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            انضم لآلاف المصريين اللي اتعلموا إنجليزي مع EN-5000. مجاني تماماً!
          </p>
          <button
            className="cta-btn"
            style={{
              ...S.btnPrimary,
              padding: '1.2rem 3rem',
              fontSize: '1.3rem',
              animation: 'pulse 2s infinite',
            }}
            onClick={goApp}
          >
            {'\u{1F449}'} ابدأ الآن مجاناً
          </button>
        </section>

        {/* ARTICLE */}
        <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: c.card, backdropFilter: 'blur(12px)', border: `1px solid ${c.cardBorder}`, borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s' }}>
            {/* Article Banner Image */}
            <div style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden' }}>
              <img src="/article-banner.png" alt="حراس الضاد" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(to top, ${c.card} 0%, transparent 100%)` }} />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', right: '1.5rem' }}>
                <span style={{ display: 'inline-block', background: 'rgba(59,130,246,0.9)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{'\u{1F4DD}'} مقال تحليلي</span>
              </div>
            </div>
            {/* Article Header */}
            <div style={{ padding: '1.5rem 2.5rem 1.5rem', borderBottom: `1px solid ${c.cardBorder}` }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: c.text, lineHeight: 1.4, marginBottom: '0.8rem' }}>
                حراس الضاد: لماذا يعد الحفاظ على الهوية العربية ضرورة وجودية في عصر العولمة؟
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: c.textSec, fontWeight: 600 }}>{'\u{1F4DD}'} مقال تحليلي</span>
                <span style={{ fontSize: '0.85rem', color: c.textSec }}>{'\u2022'}</span>
                <span style={{ fontSize: '0.85rem', color: c.textSec, fontWeight: 600 }}>{'\u{1F4D6}'} الهوية العربية والعولمة</span>
              </div>
            </div>

            {/* Collapsible Content */}
            {showArticle && (
              <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
                {/* Intro */}
                <p style={{ fontSize: '1.1rem', lineHeight: 2.1, color: c.text, marginBottom: '2rem', fontWeight: 500 }}>
                  تعيش الأمة العربية اليوم في خضم تحولات رقمية وفكرية متسارعة، جعلت من العالم قرية إلكترونية صغيرة تذوب فيها الحدود الجغرافية. وفي ظل هذا التدفق الثقافي الهائل، برزت تساؤلات جوهرية حول مفهوم الهوية العربية ومدى قدرتها الصمود؛ إذ لم يعد التمسك بها مجرد شكل من أشكال التغني بالماضي، بل تحول إلى صمام أمان وجودي لحماية الأمن القومي، والتماسك الاجتماعي، والسيادة المعرفية للشعوب من المحيط إلى الخليج.
                </p>

                {/* Section 1 */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginTop: '2.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(59,130,246,0.2)' }}>
                  مفهوم الهوية العربية وأبعادها الحضارية
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 2.1, color: c.text, marginBottom: '1.2rem' }}>
                  الهوية العربية ليست قالباً جامداً أو مجرد عرق، بل هي منظومة حيوية تتشكل من ثلاثة أركان رئيسية:
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '0.2rem' }}>{'\u{1F4D6}'}</span>
                    <div>
                      <strong style={{ color: c.text, fontSize: '1.05rem' }}>اللغة العربية (الضاد):</strong>
                      <span style={{ color: c.textSec, fontSize: '1rem' }}> الوعاء المعرفي والفكري الذي يربط العربي بجذوره</span>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '0.2rem' }}>{'\u{1F3DB}\uFE0F'}</span>
                    <div>
                      <strong style={{ color: c.text, fontSize: '1.05rem' }}>التراث المادي واللامادي:</strong>
                      <span style={{ color: c.textSec, fontSize: '1rem' }}> الآداب، الفنون، العادات، والتقاليد</span>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '0.2rem' }}>{'\u2728'}</span>
                    <div>
                      <strong style={{ color: c.text, fontSize: '1.05rem' }}>القيم والأخلاق:</strong>
                      <span style={{ color: c.textSec, fontSize: '1rem' }}> المنظومة القيمة المستمدة من الدين والتقاليد الأصيلة</span>
                    </div>
                  </li>
                </ul>

                {/* Section 2 */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginTop: '2.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(59,130,246,0.2)' }}>
                  أهمية الحفاظ على الهوية العربية
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'أ.', text: 'حماية الأمن الفكري ومقاومة الاستلاب الثقافي', color: '#22C55E' },
                    { label: 'ب.', text: 'صون الروابط الدينية والروحية', color: '#3B82F6' },
                    { label: 'ج.', text: 'تعزيز التماسك الاجتماعي والاستقرار الإقليمي', color: '#8B5CF6' },
                    { label: 'د.', text: 'تحقيق التوازن بين الأصالة والمعاصرة', color: '#F59E0B' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.2rem', borderRadius: '14px', border: `1px solid ${c.cardBorder}`, background: c.flagItemBg }}>
                      <span style={{ fontWeight: 800, color: item.color, fontSize: '1.1rem', minWidth: '24px' }}>{item.label}</span>
                      <span style={{ color: c.text, fontSize: '1rem', lineHeight: 1.9 }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Section 3 */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginTop: '2.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(59,130,246,0.2)' }}>
                  أبرز التحديات التي تواجه الهوية في العصر الرقمي
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 2.1, color: c.text, marginBottom: '1rem' }}>
                  في ظل التحولات السريعة، تواجه الهوية العربية تحديات جسيمة تتطلب وعياً عميقاً واستجابة فعّالة:
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{'\u{1F4CA}'}</span>
                    <div>
                      <strong style={{ color: c.text }}>تراجع المحتوى الرقمي العربي</strong>
                      <p style={{ color: c.textSec, fontSize: '0.95rem', lineHeight: 1.9, margin: '0.3rem 0 0' }}>ergo، يمثل المحتوى العربي على الإنترنت نسبة محدودة مقارنة بلغات أخرى، مما يضع العربي في موقع متواضع من المشهد الرقمي العالمي.</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{'\u{1F50D}'}</span>
                    <div>
                      <strong style={{ color: c.text }}>تزييف التاريخ والوعي</strong>
                      <p style={{ color: c.textSec, fontSize: '0.95rem', lineHeight: 1.9, margin: '0.3rem 0 0' }}>ergo، انتشار المغالطات والمعلومات المضللة حول التاريخ العربي والحضاري يهدد الوعي الذاتي لدى الأجيال الجديدة.</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 1.2rem', background: c.flagItemBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}` }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{'\u{1F468}\u200D\u{1F469}\u200D\u{1F467}'}</span>
                    <div>
                      <strong style={{ color: c.text }}>الفجوة الجيلية واللغات الهجينة</strong>
                      <p style={{ color: c.textSec, fontSize: '0.95rem', lineHeight: 1.9, margin: '0.3rem 0 0' }}>ergo، تزايد الخلط بين العربية واللهجات الدارجة أو اللغات الأجنبية في المحتوى الرقمي يضعف من قوة اللغة العربية الم标准ية.</p>
                    </div>
                  </li>
                </ul>

                {/* Section 4 */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginTop: '2.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(59,130,246,0.2)' }}>
                  آليات عملية لحماية هويتنا الثقافية
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { icon: '\u{1F3EB}', num: '1', title: 'تطوير المناهج التعليمية', desc: 'إدراج مفاهيم الهوية والثقافة العربية في المناهج بشكل متكامل وتفاعلي.' },
                    { icon: '\u{1F4BB}', num: '2', title: 'إثراء المحتوى الرقمي', desc: 'إنشاء محتوى عربي أصيل عالي الجودة يليق بثقافة الأمة ويعكس قيمها.' },
                    { icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F466}', num: '3', title: 'التوعية الأسرية والإعلامية', desc: 'تعزيز الدور الأسرة والإعلام في غرس الوعي culturalي لدى الأجيال الصاعدة.' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '1.5rem', background: c.flagItemBg, borderRadius: '16px', border: `1px solid ${c.cardBorder}`, textAlign: 'center' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block', marginBottom: '0.5rem' }}>{item.num}</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: c.text, marginBottom: '0.5rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: c.textSec, lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Conclusion */}
                <div style={{ marginTop: '2rem', padding: '1.5rem 1.8rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', borderRadius: '16px', border: `1px solid rgba(59,130,246,0.15)` }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3B82F6', marginBottom: '0.6rem' }}>{'\u{1F4A1}'} الخاتمة</h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 2.1, color: c.text, fontWeight: 500 }}>
                    إن الهوية العربية ليست عبئاً من الماضي نتركه خلفنا لندخل بوابة المستقبل، بل هي البوصلة التي ترشدنا وتضمن تميزنا الإنساني.
                  </p>
                </div>

                {/* Sources */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${c.cardBorder}` }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: c.textSec, marginBottom: '0.6rem' }}>{'\u{1F4DA}'} مراجع ومصادر</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {[
                      'UNESCO — Cultural Diversity and Identity in the Digital Age (2023)',
                      'Arab League Educational, Cultural and Scientific Organization (ALECSO)',
                      'Oxford Research Encyclopedia — Arabic Language and Globalization',
                      'المنظمة العربية للتربية والثقافة والعلوم (ألكسو) — تقرير الهوية الثقافية العربية 2022',
                    ].map((src, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: c.textSec, lineHeight: 1.6 }}>
                        {i + 1}. {src}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Read More / Collapse Button */}
            <div style={{ padding: '0 2.5rem 2rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowArticle(!showArticle)}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.9rem 2.5rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.25)';
                }}
              >
                {showArticle ? '\u{1F448} إخفاء المقال' : '\u{1F4D6} اقرأ المقال كاملاً'}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={S.footer(c)}>
          <div style={S.footerInner}>
            <div style={S.footerCol}>
              <div style={{ ...S.footerLogo, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/logo.png" alt="EN-5000" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                <span>EN-5000</span>
              </div>
              <p style={S.footerText(c)}>
                تطبيق ذكي مجاني لتعلم الإنجليزي. مصمم للمصريين والعرب مع AI coaching.
              </p>
              <div style={S.footerSocials}>
                {['\u{1F426}', '\u{1F4F7}', '\u{1F4E2}', '\u{1F4AC}'].map((icon, i) => (
                  <div
                    key={i}
                    className="social-icon"
                    style={S.socialIcon(c)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3B82F6';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = c.cardBorder;
                      e.currentTarget.style.color = c.text;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            <div style={S.footerCol}>
              <h4 style={{ color: c.text, marginBottom: '0.8rem', fontWeight: 800 }}>روابط سريعة</h4>
              <ul style={S.footerLinks}>
                {[
                  { label: 'المميزات', id: 'features' },
                  { label: 'القواعد', id: 'grammar' },
                  { label: 'الدول', id: 'flags' },
                  { label: 'الأسئلة الشائعة', id: 'faq' },
                ].map((l) => (
                  <li key={l.id}>
                    <span
                      className="footer-link"
                      style={S.footerLink(c)}
                      onClick={() => scrollTo(l.id)}
                    >
                      {l.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={S.footerCol}>
              <h4 style={{ color: c.text, marginBottom: '0.8rem', fontWeight: 800 }}>تواصل معانا</h4>
              <ul style={S.footerLinks}>
                <li><span className="footer-link" style={S.footerLink(c)}>تواصل معانا</span></li>
                <li><span className="footer-link" style={S.footerLink(c)}>الشروط والأحكام</span></li>
                <li><span className="footer-link" style={S.footerLink(c)}>سياسة الخصوصية</span></li>
              </ul>
            </div>
            <div style={S.footerCol}>
              <h4 style={{ color: c.text, marginBottom: '0.8rem', fontWeight: 800 }}>حمّل التطبيق</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { icon: '\u{1F4F1}', label: 'App Store' },
                  { icon: '\u26A1', label: 'Google Play' },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1rem', borderRadius: '10px',
                      background: c.cardBorder, color: c.text,
                      cursor: 'pointer', transition: 'all 0.3s', fontWeight: 600, fontSize: '0.9rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3B82F6';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = c.cardBorder;
                      e.currentTarget.style.color = c.text;
                    }}
                  >
                    {s.icon} {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={S.footerBottom(c)}>
            {'\u00A9'} 2024 EN-5000 — eng5000phrases. {'\u2764\uFE0F'} في مصر.
          </div>
        </footer>
      </div>
    </>
  );
}
