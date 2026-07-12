# 🚀 EN-5000 — دليل النشر المجاني

## 📁 ملفات المشروع
```
eng5000/
├── src/
│   ├── App.jsx          ← التطبيق الرئيسي
│   └── main.jsx         ← نقطة الدخول
├── api/
│   └── chat.js          ← Serverless function للـ API
├── public/
│   ├── index.html       ← الصفحة الرئيسية + SEO
│   ├── sitemap.xml      ← للـ Google
│   └── robots.txt       ← للـ Google
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## 🆓 النشر المجاني خطوة بخطوة

### الخطوة 1 — احصل على Anthropic API Key (مجاناً)
1. روح على **https://console.anthropic.com**
2. عمل حساب جديد
3. روح Settings → API Keys
4. اعمل **Create Key** → انسخ المفتاح
> ✅ Anthropic بيدي $5 رصيد مجاني للحسابات الجديدة

---

### الخطوة 2 — ارفع الكود على GitHub (مجاناً)
1. روح **https://github.com** → عمل حساب لو مالكش
2. اعمل **New Repository** — اسمه `en-5000`
3. حمّل كل الملفات للـ repo
4. أو استخدم Git:
```bash
git init
git add .
git commit -m "🚀 EN-5000 initial deploy"
git remote add origin https://github.com/USERNAME/en-5000.git
git push -u origin main
```

---

### الخطوة 3 — انشر على Vercel (مجاناً 100%)
1. روح **https://vercel.com** → Sign up with GitHub
2. اضغط **"Add New Project"**
3. اختار الـ repo `en-5000`
4. اضغط **"Environment Variables"** وأضف:
   ```
   ANTHROPIC_API_KEY = sk-ant-api03-xxxxx
   ```
5. اضغط **"Deploy"** → انتظر دقيقة

> 🎉 التطبيق هيبقى على: `https://en-5000.vercel.app`

---

### الخطوة 4 — ربط الدومين (اختياري — ~$10/سنة)
**لو عايز `https://eng5000phrases.com/ar`:**

1. اشتري الدومين من **Namecheap.com** (~$9/سنة)
2. في Vercel → Project Settings → **Domains**
3. أضف `eng5000phrases.com`
4. Vercel هيديك **DNS records** — حطها في Namecheap
5. انتظر 24 ساعة → الدومين يشتغل

**بديل مجاني تماماً:**
- استخدم `en-5000.vercel.app` — بيشتغل فوراً بدون دومين

---

### الخطوة 5 — Google Search (مجاناً)
1. روح **https://search.google.com/search-console**
2. أضف الدومين بتاعك
3. اضغط **"Submit Sitemap"** وحط: `https://eng5000phrases.com/sitemap.xml`
4. انتظر 1-2 أسبوع → التطبيق يظهر في Google

---

## 💰 ملخص التكاليف

| الخدمة | التكلفة |
|--------|---------|
| Vercel Hosting | **مجاناً** |
| Vercel Serverless Functions | **مجاناً** (100k calls/month) |
| GitHub | **مجاناً** |
| Google Search Console | **مجاناً** |
| Anthropic API | **$5 رصيد مجاني** ← بعدين ~$0.01/كويز |
| Domain `eng5000phrases.com` | **~$9/سنة** (اختياري) |

---

## 🧪 تجربة محلية (Development)
```bash
cd eng5000
npm install
cp .env.example .env.local
# عدّل .env.local وحط API Key بتاعك
npm run dev
# افتح: http://localhost:3000
```

---

## ⚡ بعد النشر — نصايح SEO
- اعمل صفحات social media (Facebook/Instagram) وحط رابط التطبيق
- اشارك في مجموعات تعليم الإنجليزية
- الـ meta tags جاهزة للـ Google والـ WhatsApp sharing
- sitemap.xml هيساعد Google يلاقي التطبيق بسرعة

---

## 📞 الدعم
أي مشكلة في النشر؟ ارجع لـ Claude وقوله المشكلة 🤝
