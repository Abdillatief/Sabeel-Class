# دليل رفع ونشر مشروع "سبيل القرآن" على كلاود فلار (Cloudflare Pages)

تم تجهيز المشروع بالكامل ليعمل بأعلى كفاءة وسرعة على شبكة **Cloudflare Pages** العالمية، مع دعم كامل للـ SPA Routing والتخزين المؤقت وحماية الرؤوس (Headers).

---

## الملفات التي تم إعدادها تلقائياً للمشروع:
1. `public/_redirects`: لضمان عمل التوجيه الداخلي (Single Page App) بدون ظهور أخطاء 404 عند تحديث أي صفحة أو الرابط المباشر.
2. `public/_headers`: لضبط التخزين السريع (Edge Caching) للأصول والخطوط مع تفعيل أمان المتصفح وتصريح المايكروفون لنظام التسميع.
3. `public/manifest.json` & `public/favicon.svg`: لدعم تثبيت الموقع كتطبيق ويب (PWA) على الهواتف والكمبيوتر.
4. `wrangler.toml`: ملف التوافق المباشر مع Cloudflare CLI.

---

## طرق الرفع والنشر على Cloudflare Pages (اختر الطريقة الأنسب لك):

### 🌟 الطريقة الأولى: الربط المباشر مع GitHub (الأفضل والموصى بها - تحديث تلقائي)
1. قم برفع هذا المشروع إلى حسابك على **GitHub** أو **GitLab**.
2. سجّل الدخول إلى لوحة تحكم [Cloudflare Dashboard](https://dash.cloudflare.com).
3. من القائمة الجانبية، اضغط على **Workers & Pages**.
4. اضغط على زر **Create application** ثم اختر تبويب **Pages**.
5. اختر **Connect to Git** ثم حدد مستودع المشروع (Repository).
6. في صفحة إعدادات البناء (Build settings)، أدخل القيم التالية:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - *(اختياري موصى به)* في قسم **Environment variables**، أضف متغير:
     - الاسم: `NODE_VERSION`
     - القيمة: `20`
7. اضغط على **Save and Deploy**.
8. في غضون دقيقة، سيتم بناء موقعك وسيعطيك كلاود فلار رابطاً مجانياً بصيغة:
   `https://sabeel-quran.pages.dev`
   ويمكنك ربط دومينك الخاص (Custom Domain) بضغطة زر مجاناً وبشهادة SSL تلقائية.

---

### 📦 الطريقة الثانية: السحب والإفلات المباشر (Direct Upload - بدون كود أو Git)
1. على جهازك، قم بتنفيذ أمر البناء:
   ```bash
   npm run build
   ```
2. سينتج مجلد جديد باسم `dist` يحتوي على ملفات الموقع الجاهزة.
3. افتح [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **Create application** > **Pages**.
4. اختر تبويب **Upload assets**.
5. اكتب اسم المشروع (مثلاً: `sabeel-quran`).
6. اسحب مجلد `dist` بالكامل وأفلته في المربع المخصص، ثم اضغط **Deploy site**.
7. سيعمل موقعك فوراً وبشكل مباشر!

---

### 💻 الطريقة الثالثة: الرفع عبر سطر الأوامر (Cloudflare Wrangler CLI)
إذا كنت تفضل النشر عبر الـ Terminal:
```bash
# 1. تثبيت الحزم والبناء
npm run build

# 2. النشر على كلاود فلار
npx wrangler pages deploy dist --project-name=sabeel-quran
```
سيرشدك الأمر لتسجيل الدخول بحساب كلاود فلار لمرة واحدة، ثم يقوم برفع المشروع مباشرة.
