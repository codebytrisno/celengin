import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'

const SVG = readFileSync('public/icon.svg')
const COLORS = { bg: '#14b8a6', fg: '#ffffff' }

const ICON_SIZES = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

const ADAPTIVE_FG_SIZES = [
  { dir: 'mipmap-anydpi-v26', size: 108, legacy: false },
]

const BASE = 'android/app/src/main/res'

// Generate standard launcher icons
for (const { dir, size } of ICON_SIZES) {
  const outDir = join(BASE, dir)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  await sharp(SVG).resize(size, size).png().toFile(join(outDir, 'ic_launcher.png'))
  await sharp(SVG).resize(size, size).png().toFile(join(outDir, 'ic_launcher_round.png'))
  console.log(`  ${dir}/ic_launcher.png (${size}x${size})`)
}

// Generate adaptive icon foreground (white icon on transparent bg)
const ADAPTIVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <g transform="translate(4,4)">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="28" fill="${COLORS.fg}"/>
      <ellipse cx="50" cy="48" rx="24" ry="20" fill="transparent"/>
      <circle cx="42" cy="45" r="3" fill="${COLORS.bg}"/>
      <circle cx="58" cy="45" r="3" fill="${COLORS.bg}"/>
      <path d="M 35 54 Q 50 60 65 54" stroke="${COLORS.bg}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="48" y="30" width="4" height="12" rx="2" fill="${COLORS.bg}"/>
      <circle cx="50" cy="28" r="4" fill="#fbbf24"/>
    </svg>
  </g>
</svg>`

for (const { dir } of ADAPTIVE_FG_SIZES) {
  const outDir = join(BASE, dir)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  await sharp(Buffer.from(ADAPTIVE_SVG)).resize(108, 108).png().toFile(join(outDir, 'ic_launcher_foreground.png'))
  console.log(`  ${dir}/ic_launcher_foreground.png`)
}

// Adaptive background (just solid color)
const BG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <rect width="108" height="108" rx="0" fill="${COLORS.bg}"/>
</svg>`

for (const { dir } of ADAPTIVE_FG_SIZES) {
  const outDir = join(BASE, dir)
  await sharp(Buffer.from(BG_SVG)).resize(108, 108).png().toFile(join(outDir, 'ic_launcher_background.png'))
  console.log(`  ${dir}/ic_launcher_background.png`)
}

// Adaptive icon XML (already exists, but ensure it's correct)
const ADAPTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@mipmap/ic_launcher_background"/>
  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`

writeFileSync(join(BASE, 'mipmap-anydpi-v26', 'ic_launcher.xml'), ADAPTIVE_XML)
writeFileSync(join(BASE, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), ADAPTIVE_XML)
console.log('  mipmap-anydpi-v26/ic_launcher.xml')
console.log('  mipmap-anydpi-v26/ic_launcher_round.xml')

// Splash screen icon (for center)
const SPLASH_DIR = join(BASE, 'drawable')
if (!existsSync(SPLASH_DIR)) mkdirSync(SPLASH_DIR, { recursive: true })
await sharp(SVG).resize(192, 192).png().toFile(join(SPLASH_DIR, 'splash_icon.png'))
console.log('  drawable/splash_icon.png (192x192)')

console.log('\n✅ All icons generated!')
