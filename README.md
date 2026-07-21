<div dir="rtl" align="center">

# 🚀 EN-5000 — تعلم إنجليزي بالعربي

### تطبيق ذكي لتعلم الإنجليزي للمصريين — بالذكاء الاصطناعي، قواعد مفصّلة، و5000 جملة عملية

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://enar5000.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Live:** [enar5000.vercel.app](https://enar5000.vercel.app) · **Desktop:** [enar5000.vercel.app/#/desktop](https://enar5000.vercel.app/#/desktop)

</div>

---

## screenshots

<!-- Replace these with actual screenshot files -->
<!-- ![Landing Page](screenshots/landing.png) -->
<!-- ![Mobile App](screenshots/mobile.png) -->
<!-- ![Desktop App](screenshots/desktop.png) -->
<!-- ![Grammar Section](screenshots/grammar.png) -->
<!-- ![Quiz Mode](screenshots/quiz.png) -->

| Landing Page | Mobile App | Desktop App |
|:---:|:---:|:---:|
| <!-- ![Landing](screenshots/landing.png) --> *Landing page with Egyptian flag hero* | <!-- ![Mobile](screenshots/mobile.png) --> *Mobile quiz experience* | <!-- ![Desktop](screenshots/desktop.png) --> *Desktop dashboard with sidebar* |
| <!-- ![Grammar](screenshots/grammar.png) --> *33 grammar topics with Standard Arabic* | <!-- ![Quiz](screenshots/quiz.png) --> *AI-powered adaptive questions* | <!-- ![Progress](screenshots/progress.png) --> *Progress tracking & analytics* |

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🗣️ **النطق بالعربي** | كل جملة بالإنجليزي مع النطق بالحروف العربية |
| 🧠 **ذكاء اصطناعي** | أسئلة متكيفة بالـ AI من Google Gemini |
| 📖 **قواعد متقدمة** | 33 موضوع قاعدة بالعربي الفصيح (Essential + Intermediate) |
| 💻 **إنجليزي للمبرمجين** | Linux, Git, C++, Python, AI/ML, DevOps |
| 🎮 **تعليم باللعبة** | XP، streaks، مستويات، وأسئلة يومية |
| 🌍 **ترجمة فورية** | اضغط على أي كلمة ترجمتها فوراً |
| 🌙 **وضع ليلي** | تصميم مريح للعين بالليل |
| 🔄 **سنك حسابات** | البيانات بت同步 بين الأجهزة |
| 📱 **موبايل + ديسكتوب** | تجربة مخصصة لكل جهاز |

---

## 📱三种 تجارب استخدام

### 🏠 Landing Page (`/`)
صفحة تسويقية كاملة مع علم مصر الكبير، مميزات التطبيق، شهادات المستخدمين، وأسئلة شائعة.

### 📱 Mobile Version (`/#/app`)
التطبيق الرئيسي — كويزات ذكية، قواعد مفصّلة، ترجمة فورية، و追跡 التقدم.

### 🖥️ Desktop Version (`/#/desktop`)
نسخة ديسكتوب محسّنة مع sidebar، لوحة تحكم، وعرض مزدوج للقواعد.

---

## 📁 هيكل المشروع

```
en-5000/
├── src/
│   ├── App.jsx              ← التطبيق الرئيسي (موبايل)
│   ├── LandingPage.jsx      ← الصفحة التعريفية
│   ├── DesktopApp.jsx       ← نسخة الديسكتوب
│   ├── grammarData.js       ← 33 موضوع قاعدة (فصحى)
│   └── main.jsx             ← نقطة الدخول
├── api/
│   ├── chat.js              ← Gemini AI function
│   ├── auth/                ← التسجيل وتسجيل الدخول
│   └── sync/                ← سنك البيانات السحابي
├── public/
│   ├── index.html           ← الصفحة + SEO meta
│   ├── sitemap.xml          ← لمحركات البحث
│   └── robots.txt
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## 🛠️ التقنيات

- **Frontend:** React 18 + Vite + Inline Styles
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Neon PostgreSQL
- **AI:** Google Gemini 2.0 Flash
- **Auth:** JWT + bcrypt
- **Deployment:** Vercel (auto-deploy on push)
- **Font:** Cairo (Google Fonts)

---

## 🚀 النشر المجاني خطوة بخطوة

### 1. احصل على Gemini API Key
1. روح على [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. سجل دخول بحساب Google
3. اضغط **"Create API Key"**
4. انسخ المفتاح

> ✅ Google بيدي رصيد مجاني شهرياً

### 2. ارفع الكود على GitHub
```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/en-5000.git
git push -u origin main
```

### 3. انشر على Vercel
1. روح [vercel.com](https://vercel.com) → Sign up with GitHub
2. اضغط **"Add New Project"** واختار `en-5000`
3. أضف Environment Variable: `GEMINI_API_KEY`
4. اضغط **"Deploy"**

> 🎉 التطبيق هيبقى على: `https://en-5000.vercel.app`

### 4. ربط الدومين (اختياري)
1. اشتري دومين من [Namecheap.com](https://namecheap.com) (~$9/سنة)
2. في Vercel → Project Settings → **Domains**
3. أضف الدومين وحط الـ DNS records

---

## 💰 ملخص التكاليف

| الخدمة | التكلفة |
|--------|---------|
| Vercel Hosting | **مجاني** |
| Vercel Serverless Functions | **مجاني** (100k calls/month) |
| Neon PostgreSQL | **مجاني** (512MB) |
| GitHub | **مجاني** |
| Google Gemini API | **مجاني** (مع رصيد شهري) |
| Domain | **~$9/سنة** (اختياري) |

---

## 🧪 تجربة محلية

```bash
git clone https://github.com/YOUR_USERNAME/en-5000.git
cd en-5000
npm install
cp .env.example .env.local
# عدّل .env.local وحط API Key
npm run dev
# افتح: http://localhost:5173
```

---

## 🗂️ قواعد الإنجليزي (33 موضوع)

### الأساسيات (15 موضوع — بالعامية المصرية)
الأزمنة الأساسية، المقالات، الضمائر، الصفات، أفعال المساعدة، الجمل الشرطية، المبني للمجهول، الجمل الوصفية، المصدر والفعل الناقص، أنواع الأسئلة، النفي، حروف الجر، حروف الربط، الأفعال المركبة، قواعد الكتابة

### المتقدمة (18 موضوع — بالفصحى)
المضارع المستمر والبسيط المتقدم، الماضي البسيط والمستمر، المضارع التام، المستقبل، أفعال المساعدة المتقدمة، الجمل الشرطية والترجيم، المبني للمجهول المتقدم، الكلام المنقول، الأسئلة المتقدمة، المصدر والفعل الناقص المتقدم، الأسماء والمقالات، الضمائر والمحددات، جمل الوصل، الصفات والظرف، حروف الربط المتقدمة، حروف الجر المتقدمة، الأفعال المركبة، قواعد الكتابة الإنجليزية

---

## 📞 الدعم

لأي مشكلة أو اقتراح، افتح [Issue](https://github.com/RaGAEIDOS/en-5000/issues) على GitHub.

---

<div dir="rtl" align="center">

**صُنع بـ ❤️ في مصر 🇪🇬**

</div>
