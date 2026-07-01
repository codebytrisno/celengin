'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { PiggyBank, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { getCelengans, getTransactionsByCelenganIds } from '@/lib/db'
import type { Transaction } from '@/lib/db'

type ActivityItem = {
  id: string
  date: string
  amount: number
  note: string | null
  celengan_title: string
  celengan_icon: string
  type: 'deposit' | 'withdrawal'
}

export default function AktivitasPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'semua' | 'deposit' | 'withdrawal'>('semua')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    loadActivities()
  }, [authLoading, user, router])

  function loadActivities() {
    const goals = getCelengans()

    if (goals.length === 0) {
      setLoading(false)
      return
    }

    const ids = goals.map(g => g.id)
    const transactions = getTransactionsByCelenganIds(ids)

    const celenganMap = new Map(goals.map(g => [g.id, g]))
    const items: ActivityItem[] = transactions.map((t: Transaction) => {
      const cel = celenganMap.get(t.celengan_id)
      return {
        id: t.id,
        date: t.date,
        amount: Math.abs(t.amount),
        note: t.note || null,
        celengan_title: cel?.title || 'Unknown',
        celengan_icon: cel?.icon || 'wallet',
        type: t.amount >= 0 ? 'deposit' : 'withdrawal',
      }
    })

    setActivities(items)
    setLoading(false)
  }

  const filtered = filter === 'semua'
    ? activities
    : activities.filter(a => a.type === filter)

  const totalDeposit = activities.filter(a => a.type === 'deposit').reduce((s, a) => s + a.amount, 0)
  const totalWithdrawal = activities.filter(a => a.type === 'withdrawal').reduce((s, a) => s + a.amount, 0)

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Aktivitas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Riwayat transaksi tabungan kamu</p>
      </div>

      {!loading && activities.length > 0 && (
        <div className="animate-scale-in grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="clay">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Transaksi</p>
                <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">{activities.length} kali</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="clay">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Deposit</p>
                <p className="font-heading text-lg font-bold text-green-600">{formatRupiah(totalDeposit)}</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="clay">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Tarik</p>
                <p className="font-heading text-lg font-bold text-red-600">{formatRupiah(totalWithdrawal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {(['semua', 'deposit', 'withdrawal'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'semua' ? 'Semua' : f === 'deposit' ? 'Deposit' : 'Penarikan'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <Wallet className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada aktivitas</p>
          <p className="text-slate-400 text-sm mt-1">Mulai menabung untuk melihat riwayat transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-in-up bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                item.type === 'deposit' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.type === 'deposit'
                  ? <ArrowUpRight className="h-5 w-5" />
                  : <ArrowDownRight className="h-5 w-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.type === 'deposit' ? 'Menabung' : 'Penarikan'} — {item.celengan_icon} {item.celengan_title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(item.date)}
                  {item.note && <span className="ml-2">· {item.note}</span>}
                </p>
              </div>
              <div className={`text-right flex-shrink-0 ${
                item.type === 'deposit' ? 'text-green-600' : 'text-red-600'
              }`}>
                <p className="font-heading font-bold text-sm">
                  {item.type === 'deposit' ? '+' : '-'}{formatRupiah(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
