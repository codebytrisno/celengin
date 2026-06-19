import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function calcProgress(collected: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((collected / target) * 100), 100)
}

export function getStatus(collected: number, target: number): string {
  if (target <= 0) return "Aktif"
  const pct = collected / target
  if (pct >= 1) return "Tercapai ✨"
  if (pct >= 0.75) return "Hampir Selesai"
  if (pct >= 0.5) return "On Track"
  if (pct >= 0.25) return "Lumayan"
  return "Baru Mulai"
}
