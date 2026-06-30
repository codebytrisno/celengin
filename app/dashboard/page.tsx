'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CelenganCard } from '@/components/dashboard/celengan-card'
import { Wallet, TrendingUp, PiggyBank, PlusCircle, Target, Plus } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { getCelengans } from '@/lib/db'
import type { Celengan } from '@/lib/db'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [celengans, setCelengans] = useState<(Celengan & { collected: number })[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    loadData()
  }, [authLoading, user, router])

  useEffect(() => {
    document.title = 'Dashboard - Celengin'
  }, [])

  function loadData() {
    setLoading(true)
    const data = getCelengans()
    setCelengans(data)
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const totalCollected = celengans.reduce((s, c) => s + c.collected, 0)
  const totalTarget = celengans.reduce((s, c) => s + c.target_amount, 0)
  const activeGoals = celengans.filter(c => c.collected < c.target_amount).length

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Kelola semua celenganmu di sini</p>
        </div>
        <Link href="/celengan/baru" className="w-full sm:w-auto sm:mr-0">
          <Button variant="clay" size="lg" className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            Buat Celengan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card variant="clay">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Terkumpul</p>
                <p className="font-heading text-2xl font-bold text-teal-600">{formatRupiah(totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="clay">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Target</p>
                <p className="font-heading text-2xl font-bold text-blue-600">{formatRupiah(totalTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="clay">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Aktif</p>
                <p className="font-heading text-2xl font-bold text-orange-600">{activeGoals} target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="font-heading text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-teal-500" />
          Daftar Celengan
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : celengans.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200">
            <PlusCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-2">Belum ada celengan</p>
            <p className="text-slate-400 text-sm mb-6">Mulai menabung dengan membuat celengan pertama kamu</p>
            <Link href="/celengan/baru">
              <Button variant="clay" size="md">
                <Plus className="h-4 w-4 mr-2" />
                Buat Celengan Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {celengans.map((celengan, i) => (
              <div key={celengan.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <CelenganCard
                  id={celengan.id}
                  title={celengan.title}
                  target={celengan.target_amount}
                  collected={celengan.collected}
                  icon={celengan.icon}
                  onDelete={loadData}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
