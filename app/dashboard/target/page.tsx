'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { CelenganCard } from '@/components/dashboard/celengan-card'
import { Button } from '@/components/ui/button'
import { Plus, Search, PiggyBank } from 'lucide-react'
import { getCelengans } from '@/lib/db'
import type { Celengan } from '@/lib/db'

export default function TargetPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [celengans, setCelengans] = useState<(Celengan & { collected: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    const data = getCelengans()
    setCelengans(data)
    setLoading(false)
  }, [authLoading, user, router])

  const filtered = celengans.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Target Saya</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola semua celengan dan target tabunganmu</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 sm:flex-none w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari celengan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <Link href="/celengan/baru">
          <Button variant="clay" size="md">
            <Plus className="h-4 w-4 mr-1" /> Buat Baru
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <PiggyBank className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada celengan</p>
          <p className="text-slate-400 text-sm mt-1">Buat celengan pertama kamu sekarang!</p>
          <Link href="/celengan/baru">
            <Button variant="clay" size="md" className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Buat Celengan Baru
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((celengan, i) => (
            <div key={celengan.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CelenganCard
                id={celengan.id}
                title={celengan.title}
                target={celengan.target_amount}
                collected={celengan.collected}
                icon={celengan.icon}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && celengans.length > 0 && (
        <div className="animate-fade-in-up mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold font-heading text-teal-600">{celengans.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Target</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold font-heading text-green-600">
              {celengans.filter(c => c.collected >= c.target_amount).length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tercapai ✨</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold font-heading text-orange-600">
              {celengans.filter(c => c.collected < c.target_amount && c.collected > 0).length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dalam Progres</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold font-heading text-slate-600">
              {celengans.filter(c => c.collected === 0).length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Belum Dimulai</p>
          </div>
        </div>
      )}
    </>
  )
}
