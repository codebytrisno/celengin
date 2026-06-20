# Tauri 2 + Next.js SSR Setup - Celengin

## Arsitektur

Celengin menggunakan pola **Remote WebView**:
- Next.js jalan di server (Vercel prod / localhost:3000 dev)
- Tauri Android app = WebView shell yang load URL remote
- Tidak ada bundel Next.js di APK
- App butuh internet untuk jalan

```
Next.js Server (192.168.1.2:3000 / Vercel)
    ↓ HTTP/HTTPS
Tauri Android App (WebView)
    ↓
APK File
```

## Konfigurasi

### IP Lokal PC: `192.168.1.2`

URL yang dipakai:
- **Dev**: `http://192.168.1.2:3000`
- **Prod**: `https://celengin-nyno.vercel.app`

### File Penting

1. **`src-tauri/tauri.conf.json`**
   - `devUrl`: URL dev server
   - `frontendDist`: Folder dummy (`../public`)
   - `app.windows[0].url`: URL yang dibuka WebView

2. **`src-tauri/src/lib.rs`**
   - Logic untuk switch dev/prod URL
   - Dev: `http://192.168.1.2:3000`
   - Prod: `https://celengin-nyno.vercel.app`

3. **`src-tauri/gen/android/app/build.gradle.kts`**
   - Line 29: `usesCleartextTraffic = true` (debug)
   - Line 20: `usesCleartextTraffic = false` (release)

## Development

### Persiapan

1. Pastikan Next.js dev server jalan:
   ```bash
   npm run dev
   ```

2. Device Android dan PC harus **satu Wi-Fi**

3. Test URL dari browser Android:
   ```
   http://192.168.1.2:3000
   ```

### Jalankan di Android

```bash
# Connect device via USB (enable USB debugging)
# atau jalankan Android Emulator

npx tauri android dev
```

**Apa yang terjadi:**
- Tauri compile Rust → APK debug
- Install ke device/emulator
- App terbuka, WebView load `http://192.168.1.2:3000`
- Hot reload Next.js tetap jalan (refresh manual di app)

## Production Build

### Build APK

**Cara 1: Via Tauri CLI (Gagal karena symlink issue di Windows)**
```bash
npx tauri android build --release
```

**Cara 2: Via Gradle Manual (WORKING)**
```bash
# Copy Rust library yang sudah di-compile
mkdir -p src-tauri/gen/android/app/src/main/jniLibs/arm64-v8a
cp src-tauri/target/aarch64-linux-android/release/libapp_lib.so src-tauri/gen/android/app/src/main/jniLibs/arm64-v8a/

# Build dengan Gradle (skip rust build task)
cd src-tauri/gen/android
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="C:/Users/TrisnoSanjaya/AppData/Local/Android/Sdk"
./gradlew assembleArm64Release -x rustBuildArm64Release -x rustBuildArmRelease
```

**Lokasi APK:**
```
src-tauri/gen/android/app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk
```

**Size:** ~11 MB (ARM64 only)

### Install Manual

```bash
adb install src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk
```

## Switch Dev/Prod URL

### Cara 1: Edit `lib.rs` (Manual)

Edit `src-tauri/src/lib.rs`:
```rust
if cfg!(debug_assertions) {
    "http://192.168.1.2:3000".to_string()  // Dev
} else {
    "https://celengin-nyno.vercel.app".to_string()  // Prod
}
```

### Cara 2: Environment Variable

```bash
CELENGIN_URL=https://celengin-nyno.vercel.app npx tauri android build --release
```

## Troubleshooting

### WebView Blank/Putih
- Cek logs: `npx tauri android dev` (lihat console)
- Test URL di Chrome Android
- Pastikan Wi-Fi sama antara PC dan device

### "net::ERR_CLEARTEXT_NOT_PERMITTED"
- Sudah diatasi di `build.gradle.kts` line 29
- Debug build otomatis izinkan HTTP

### APK Crash on Launch
- Build ulang: `npx tauri android build --release`
- Cek logs: `adb logcat | grep Tauri`

### IP Berubah
Kalau IP PC berubah (ganti Wi-Fi), update 3 tempat:
1. `src-tauri/tauri.conf.json` → `devUrl` dan `app.windows[0].url`
2. `src-tauri/src/lib.rs` → URL dev
3. Cek IP baru: `ipconfig` (Ethernet adapter → IPv4 Address)

## Keterbatasan

❌ **App butuh internet 100%**
- Tidak ada offline mode
- Kalau server down → app blank

❌ **Performance bergantung network**
- First load lambat
- Konsumsi data lebih besar

❌ **No native features**
- Tidak bisa akses camera, GPS, storage native
- Butuh bridge custom + Tauri commands

✅ **Kelebihan**
- Deploy cepat (update Next.js → langsung semua user dapat)
- 1 codebase untuk web & mobile
- APK size kecil (~5-10MB)

## Checklist Pre-Deploy

- [ ] Next.js production di Vercel sudah deploy
- [ ] Test Vercel URL dari browser: `https://celengin-nyno.vercel.app`
- [ ] `src-tauri/src/lib.rs` URL prod sudah benar
- [ ] Icon di `src-tauri/icons/` sudah diganti (tidak pakai default)
- [ ] Test APK di device fisik (bukan hanya emulator)
- [ ] APK signed untuk Google Play (butuh keystore)

## Commands Cheatsheet

```bash
# Install dependencies
npm install

# Dev: Next.js
npm run dev

# Dev: Android (Next.js harus jalan dulu)
npx tauri android dev

# Build: Production APK
npx tauri android build --release

# Install APK ke device
adb install <path-to-apk>

# Logs
adb logcat | grep Tauri

# Cek IP PC
ipconfig
```

---

**Setup Date**: 2026-06-20  
**IP PC**: 192.168.1.2  
**Next.js Dev**: http://192.168.1.2:3000  
**Next.js Prod**: https://celengin-nyno.vercel.app
