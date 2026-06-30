# Celengin

**Celengin** adalah aplikasi tabungan digital yang membantu kamu mencapai target finansial dengan cara yang menyenangkan. **Offline-First** — semua data disimpan di lokal, tidak butuh server.

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=flat-square&logo=capacitor)

## Fitur Utama

- **Offline-First** — Semua data di localStorage, ngga perlu koneksi internet
- **Kelola Target Tabungan** — Buat celengan dengan target nominal, icon, dan gambar
- **Transaksi Mudah** — Deposit dan withdraw dengan format Rupiah
- **Visualisasi Progress** — Grafik interaktif dari Recharts
- **Dark Mode** — UI modern dengan dark mode penuh
- **Import/Export Data** — Backup JSON dan ekspor CSV (merge atau replace)
- **Android App** — APK signed siap install via Capacitor

## Quick Start

```bash
git clone https://github.com/TrisnoSanjaya/celengin.git
cd celengin
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, static export) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Language** | TypeScript 6 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Storage** | localStorage (Offline-First) |
| **Mobile** | Capacitor 8 (Android) |
| **Auth** | Lokal (tanpa server) |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── celengan/          # Detail & edit celengan (query params)
│   ├── celengan/baru/     # Buat celengan baru
│   ├── dashboard/         # Dashboard, target, aktivitas, pengaturan
│   ├── sign-in/ & sign-up/ # Auth lokal
├── components/            # React components
│   ├── dashboard/         # Celengan card, charts, sidebar
│   ├── layout/            # Navbar
│   └── ui/                # Reusable UI (Button, Card, Dialog)
├── lib/
│   ├── db.ts              # localStorage database layer (CRUD)
│   ├── backup.ts          # Export/import JSON & CSV
│   ├── image.ts           # Kompresi gambar ke WebP base64
│   └── auth/              # Auth context (lokal)
└── scripts/               # Tools (generate-icons.mjs)
```

## Android App

Celengin bisa dibuild sebagai Android app menggunakan **Capacitor 8**.

### Build APK

```bash
npm run build
npx cap sync android
npx cap open android
```

Atau langsung build dari CLI:

```bash
cd android
set JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Build AAB (Play Store)

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Deployment

Karena Celengin **Offline-First**, bisa di-deploy ke static hosting mana pun:

```bash
npm run build
```

Output static ada di folder `out/`. Upload ke Vercel, Netlify, GitHub Pages, atau hosting static lainnya.

## License

MIT
