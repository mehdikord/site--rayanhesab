# رایان حساب صبا

سایت و پنل مدیریت رایان حساب صبا — Next.js 16 (App Router)، Prisma 7، MySQL 8.

## راه‌اندازی محلی

```bash
npm install
cp .env.example .env        # مقادیر را تکمیل کنید
npx prisma generate
npm run dev
```

- سایت: `http://localhost:3000`
- پنل مدیریت: `http://localhost:3000/admins` (ورود با موبایل و رمز مدیر)
- برای تست خرید بدون درگاه در محیط توسعه: `PAYMENT_DEV_FAKE=true` (در production نادیده گرفته می‌شود).

## استقرار (production)

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

متغیرهای ضروری (جزئیات در `.env.example`):

| متغیر | توضیح |
| --- | --- |
| `DATABASE_URL` | اتصال MySQL |
| `SESSION_SECRET` | حداقل ۳۲ کاراکتر تصادفی؛ بدون آن پنل مدیریت بالا نمی‌آید |
| `NEXT_PUBLIC_SITE_URL` | آدرس عمومی سایت (sitemap، متادیتا و آدرس بازگشت درگاه) |
| `ZARINPAL_MERCHANT_ID` | مرچنت زرین‌پال؛ بدون آن خرید دوره‌های غیررایگان غیرفعال است |
| `ZARINPAL_SANDBOX` | `true` برای محیط آزمایشی زرین‌پال |
| `STORAGE_DIR` | محل ذخیره تصاویر آپلودی و رزومه‌ها (روی دیسک پایدار؛ پیش‌فرض `./storage`) |

## ساختار

- `app/(site)` — صفحات عمومی سایت (همه داده‌ها از دیتابیس، از طریق `app/lib/site-data.ts`)
- `app/admins` — پنل مدیریت (احراز هویت با کوکی امضاشده + بررسی وضعیت مدیر در دیتابیس)
- `app/lib/commerce.ts` — قوانین کوپن، محاسبه فاکتور و ثبت‌نام خودکار پس از پرداخت
- `app/lib/payment/zarinpal.ts` — اتصال درگاه؛ بازگشت از درگاه: `app/payment/callback`
- `app/lib/storage.ts` — ذخیره فایل؛ تصاویر عمومی از `/uploads/...`، رزومه‌ها فقط برای مدیر

## نکات عملیاتی

- محدودیت نرخ (ورود مدیر، فرم‌ها، کوپن) در حافظه هر پروسه است؛ در صورت اجرای چند نمونه، به Redis منتقل شود.
- پوشه `STORAGE_DIR` را در بکاپ‌ها لحاظ کنید.
- پرداخت با کیف پول تا راه‌اندازی حساب کاربری مشتریان غیرفعال است.
