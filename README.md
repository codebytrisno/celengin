# 💰 Celengin

**Celengin** adalah aplikasi tabungan digital modern yang membantu kamu mencapai target finansial dengan cara yang menyenangkan dan interaktif.

![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

---

## ✨ Fitur Utama

- 🎯 **Kelola Target Tabungan** — Buat celengan dengan target nominal, icon custom, dan gambar motivasi
- 💸 **Transaksi Mudah** — Deposit dan withdraw dengan input format Rupiah yang user-friendly
- 📊 **Visualisasi Progress** — Grafik interaktif untuk tracking perjalanan tabunganmu
- 🌙 **Dark Mode** — UI modern dengan dukungan dark mode penuh
- 🔐 **Authentication** — Sign up/sign in aman dengan Supabase Auth
- 📱 **Responsive Design** — Seamless di desktop, tablet, dan mobile
- ⚡ **Real-time Updates** — Data sinkron otomatis tanpa reload halaman
- 🎨 **Modern Icons** — 24 Lucide icons yang clean & konsisten

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ dan npm/pnpm/yarn
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### Installation

```bash
# Clone repository
git clone https://github.com/TrisnoSanjaya/celengin.git
cd celengin

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials kamu
```

### Database Setup

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Tabel Celengans
create table celengans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  target_amount bigint not null,
  collected bigint default 0,
  icon text default 'wallet',
  category text default 'Lainnya',
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabel Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  celengan_id uuid references celengans(id) on delete cascade not null,
  amount bigint not null,
  type text check (type in ('deposit', 'withdraw')) not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table celengans enable row level security;
alter table transactions enable row level security;

-- Policies untuk celengans
create policy "Users can view own celengans"
  on celengans for select
  using (auth.uid() = user_id);

create policy "Users can create own celengans"
  on celengans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own celengans"
  on celengans for update
  using (auth.uid() = user_id);

create policy "Users can delete own celengans"
  on celengans for delete
  using (auth.uid() = user_id);

-- Policies untuk transactions
create policy "Users can view transactions of own celengans"
  on transactions for select
  using (
    exists (
      select 1 from celengans
      where celengans.id = transactions.celengan_id
      and celengans.user_id = auth.uid()
    )
  );

create policy "Users can create transactions for own celengans"
  on transactions for insert
  with check (
    exists (
      select 1 from celengans
      where celengans.id = transactions.celengan_id
      and celengans.user_id = auth.uid()
    )
  );
```

### Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4.0 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel (recommended) |

---

## 📂 Project Structure

```
celengan_digital/
├── app/                    # Next.js App Router pages
│   ├── celengan/          # Celengan CRUD pages
│   ├── dashboard/         # Dashboard user
│   ├── sign-in/           # Auth pages
│   └── sign-up/
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific
│   ├── layout/            # Navbar, Footer
│   └── ui/                # Reusable UI (Button, Card, Dialog)
├── lib/                   # Utilities & configs
│   ├── auth/              # Auth context
│   ├── supabase/          # Supabase client & types
│   └── celengan-icons.tsx # Icon utilities
└── public/                # Static assets
```

---

## 🎨 Features Breakdown

### 1. Dashboard
- Overview semua celengan
- Progress bar & status (aktif/tercapai)
- Quick actions: tambah celengan, deposit, withdraw
- Dark mode toggle

### 2. Celengan Management
- **Buat celengan baru**: Nama, target, icon, kategori, gambar motivasi (upload/URL)
- **Edit celengan**: Update info tanpa kehilangan data transaksi
- **Hapus celengan**: Konfirmasi dialog dengan warning

### 3. Transaksi
- **Deposit**: Tambah uang ke celengan
- **Withdraw**: Tarik dana dengan validasi saldo
- Format Rupiah otomatis (1.000.000)
- Quick amount buttons (50K, 100K, 200K, 500K)
- History transaksi dengan filter

### 4. Visualisasi
- Progress bar dinamis
- Grafik line chart (trend tabungan)
- Statistik: total collected, target, persentase

---

## 🔒 Security

- Row Level Security (RLS) di Supabase
- User hanya bisa akses data milik sendiri
- Auth token management otomatis
- Secure environment variables

---

## 📝 Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables
4. Deploy! 🎉

### Manual Build

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Kalau ada ide fitur atau bug report:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

**Trisno Sanjaya**

Dibuat dengan ❤️ untuk semua yang ingin mengelola keuangan dengan lebih baik.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [Supabase](https://supabase.com) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS Framework
- [Lucide](https://lucide.dev) - Beautiful & Consistent Icons
- [Recharts](https://recharts.org) - Composable Charting Library

---

⭐ **Star repo ini kalau kamu suka!** Bantu orang lain menemukan Celengin 🚀
