# PRD – Website Celengan Digital (Frontend)

## 1. Ringkasan Produk
Website celengan digital yang membantu user menabung berdasarkan tujuan (savings goal) dengan tampilan sederhana, modern, dan mudah dipakai di HP maupun desktop. Frontend dibangun dengan Next.js sebagai single-page experience yang cepat dan interaktif.

## 2. Target Pengguna
- Remaja & mahasiswa yang ingin belajar menabung.
- Karyawan muda yang ingin merencanakan tujuan finansial (gadget, liburan, dll).
- Keluarga yang ingin menabung bareng untuk 1 tujuan.

## 3. Tujuan Frontend
- Memudahkan user membuat dan memantau celengan dengan langkah sesedikit mungkin.
- Memberikan visual progress yang jelas dan motivasional.
- UI responsif, ringan, dan bisa dipakai nyaman di koneksi yang pas-pasan.

---

## 4. Halaman & Fitur Utama

### 4.1 Landing Page (`/`)
**Tujuan:** Perkenalan singkat produk dan ajak user login/daftar.
**Elemen:**
- Simple hero section: judul, subjudul, CTA "Mulai Menabung".
- Ilustrasi atau mockup celengan/graph progress.
- Seksi “Cara Kerja” dalam 3 langkah: Buat tujuan → Isi tabungan → Capai target.
- Navbar minimal: Logo, link “Fitur”, “Masuk”.
- Footer: informasi singkat dan link sosial (placeholder).

### 4.2 Auth Pages (`/login`, `/register`)
**Tujuan:** Akses akun dengan friction minimal.
**Elemen:**
- Form login: email + password.
- Form register: nama, email, password.
- Validasi dasar di frontend: required, format email.
- Pesan error jelas dan singkat di bawah input.

### 4.3 Dashboard Celengan (`/dashboard`)
**Tujuan:** Tampilan utama setelah login, fokus ke daftar celengan.
**Elemen:**
- Greeting: “Halo, [Nama]”.
- Ringkasan singkat: Total tabungan, Jumlah celengan aktif.
- List kartu celengan: Nama tujuan, Target vs Terkumpul, Progress bar, Badge status (“On Track”, etc).
- Tombol “+ Buat Celengan Baru”.

### 4.4 Halaman Detail Celengan (`/celengan/[id]`)
**Tujuan:** User melihat detail dan histori tabungan satu celengan.
**Elemen:**
- Header: nama celengan, icon, kategori.
- Progress section: Target, terkumpul, sisa, progress bar besar.
- Tombol aksi: “Tambah Tabungan”, “Ambil Uang”, “Edit Goal”.
- History transaksi (list): Tanggal, nominal, catatan.
- Grafik pertumbuhan tabungan.

### 4.5 Modal / Page Tambah Tabungan
**Tujuan:** Input tabungan dengan cepat.
**Elemen:** Input nominal, tanggal, catatan opsional, tombol simpan.

---

## 5. UX & Desain

### 5.1 Style
- Nuansa simpel dan “clean”, dengan warna utama Teal (#14B8A6) + 3D Claymorphism icons.
- Banyak whitespace, font modern (Inter / Poppins).
- Ikon 3D yang konsisten dan tactile.

### 5.2 Responsiveness
- Mobile-first approach.
- Desktop optimized layouts with sidebar navigation.

---

## 6. Teknologi Frontend
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS.
- **Component Library:** shadcn/ui.

---

## 7. Prioritas Versi 1 (MVP Frontend)
**P0 (Wajib):**
- Landing page, Auth (Login/Register).
- Dashboard list, Detail celengan + history.
- Modal tambah tabungan.
- Responsif dasar.
