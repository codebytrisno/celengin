'use client'

import {
  Wallet, Home, Car, Plane, Laptop, GraduationCap,
  Heart, Cake, Gamepad2, Baby, Bike, Smartphone,
  Music, Dumbbell, Pill, Camera, Watch, Gift,
  Mountain, Coffee, Shirt, BookOpen, Gem, Briefcase,
  type LucideIcon,
} from 'lucide-react'

export type IconOption = {
  name: string
  label: string
  icon: LucideIcon
}

export const CELENGAN_ICONS: IconOption[] = [
  { name: 'wallet',        label: 'Tabungan',    icon: Wallet },
  { name: 'home',          label: 'Rumah',       icon: Home },
  { name: 'car',           label: 'Mobil',       icon: Car },
  { name: 'plane',         label: 'Liburan',     icon: Plane },
  { name: 'laptop',        label: 'Gadget',      icon: Laptop },
  { name: 'graduation-cap',label: 'Pendidikan',  icon: GraduationCap },
  { name: 'heart',         label: 'Kesehatan',   icon: Heart },
  { name: 'cake',          label: 'Ulang Tahun', icon: Cake },
  { name: 'gamepad-2',     label: 'Gaming',      icon: Gamepad2 },
  { name: 'baby',          label: 'Anak',        icon: Baby },
  { name: 'bike',          label: 'Motor',       icon: Bike },
  { name: 'smartphone',    label: 'HP',          icon: Smartphone },
  { name: 'music',         label: 'Musik',       icon: Music },
  { name: 'dumbbell',      label: 'Olahraga',    icon: Dumbbell },
  { name: 'pill',          label: 'Obat',        icon: Pill },
  { name: 'camera',        label: 'Kamera',      icon: Camera },
  { name: 'watch',         label: 'Jam',         icon: Watch },
  { name: 'gift',          label: 'Hadiah',      icon: Gift },
  { name: 'mountain',      label: 'Alam',        icon: Mountain },
  { name: 'coffee',        label: 'Cafe',        icon: Coffee },
  { name: 'shirt',         label: 'Fashion',     icon: Shirt },
  { name: 'book-open',     label: 'Kuliah',      icon: BookOpen },
  { name: 'gem',           label: 'Nikah',       icon: Gem },
  { name: 'briefcase',     label: 'Bisnis',      icon: Briefcase },
]

/** Map icon name → Lucide component */
const iconMap = new Map<string, LucideIcon>(
  CELENGAN_ICONS.map(i => [i.name, i.icon])
)

/** Default icon kalau name tidak ditemukan */
const DEFAULT_ICON: LucideIcon = Wallet

/**
 * Render icon dari string yang tersimpan di DB.
 * Backward-compatible: kalau string bukan icon name yang dikenal,
 * anggap sebagai emoji lama dan render langsung.
 */
export function CelenganIconRenderer({
  name,
  className = 'h-6 w-6',
  size,
}: {
  name: string
  className?: string
  size?: number
}) {
  const LucideComp = iconMap.get(name)

  // Kalau bukan icon yang dikenal → render sebagai emoji (backward compat)
  if (!LucideComp) {
    return <span className={`leading-none ${className}`} style={{ fontSize: size }}>{name}</span>
  }

  return <LucideComp className={className} size={size} strokeWidth={1.75} />
}
