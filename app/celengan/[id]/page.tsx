'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { PiggyBank, ArrowLeft, Plus, Minus, Calendar, ArrowUpRight, ArrowDownRight, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { formatRupiah, formatDate, calcProgress } from '@/lib/utils'
import { CelenganCharts } from '@/components/dashboard/celengan-charts'
import { CelenganIconRenderer } from '@/lib/celengan-icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Celengan, Transaction } from '@/lib/supabase/types'

const CATEGORIES = [
  'Elektronik', 'Kendaraan', 'Properti', 'Pendidikan',
  'Liburan', 'Kesehatan', 'Investasi', 'Hobi', 'Keluarga', 'Lainnya',
]

export default function DetailCelenganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [celengan, setCelengan] = useState<(Celengan & { collected: number }) | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState<false | 'deposit' | 'withdraw'>(false)
  const [editingCategory, setEditingCategory] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    loadData()
  }, [authLoading, user, id, router])

  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!showMenu) return
    const handleClick = () => setShowMenu(false)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showMenu])

  // Update document title
  useEffect(() => {
    if (celengan) {
      document.title = `${celengan.title} - Celengin`
    }
  }, [celengan])

  async function loadData() {
    if (!user) return

    const { data: goal, error: goalErr } = await supabase
      .from('celengans')
      .select('*')
      .eq('id', id)
      .single()

    if (goalErr || !goal) {
      setError('Celengan tidak ditemukan')
      setLoading(false)
      return
    }

    if (goal.user_id !== user.id) {
      setError('Anda tidak memiliki akses ke celengan ini')
      setLoading(false)
      return
    }

    const { data: collected } = await supabase.rpc('get_collected', { celengan_id: id })
    const totalCollected = (collected as number) || 0

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('celengan_id', id)
      .order('date', { ascending: false })
      .limit(50)

    setCelengan({ ...goal, collected: totalCollected })
    setTransactions(txs || [])
    setLoading(false)
  }

  async function updateCategory(newCategory: string) {
    if (!celengan || newCategory === celengan.category) {
      setEditingCategory(false)
      return
    }

    setSavingCategory(true)

    const { error: updateErr } = await supabase
      .from('celengans')
      .update({ category: newCategory })
      .eq('id', id)

    setSavingCategory(false)
    setEditingCategory(false)

    if (updateErr) {
      alert('Gagal update kategori: ' + updateErr.message)
      return
    }

    loadData()
  }

  async function handleDelete() {
    if (!celengan) return

    setDeleting(true)

    // Hapus semua transaksi dulu
    await supabase.from('transactions').delete().eq('celengan_id', id)

    // Hapus celengan
    const { error: deleteErr } = await supabase
      .from('celengans')
      .delete()
      .eq('id', id)

    setDeleting(false)
    setShowDeleteDialog(false)

    if (deleteErr) {
      alert('Gagal menghapus: ' + deleteErr.message)
      return
    }

    router.push('/dashboard')
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-6" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mb-6" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !celengan) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
            <div className="text-center py-20">
              <PiggyBank className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{error || 'Celengan tidak ditemukan'}</p>
              <Link href="/dashboard">
                <Button variant="clay" size="md" className="mt-4">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const progress = calcProgress(celengan.collected, celengan.target_amount)
  const remaining = celengan.target_amount - celengan.collected

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Back */}
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>

          {/* Image Banner */}
          {celengan.image_url && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm">
              <img
                src={celengan.image_url}
                alt={celengan.title}
                className="w-full h-48 sm:h-64 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center clay-3d-sm">
                <CelenganIconRenderer name={celengan.icon} className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{celengan.title}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    progress >= 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                  }`}>
                    {progress >= 100 ? 'Selesai' : 'Aktif'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{celengan.category}</p>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(!editingCategory)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    title="Edit kategori"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
                {editingCategory && (
                  <div className="mt-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                      {savingCategory ? 'Menyimpan...' : 'Pilih Kategori'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateCategory(cat)}
                          disabled={savingCategory}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            cat === celengan.category
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 ring-1 ring-teal-500 dark:ring-teal-400'
                              : 'bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-400'
                          } ${savingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 mt-2 px-1"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {/* Action Buttons */}
              <Button variant="clay" size="md" onClick={() => setShowModal('deposit')}>
                <Plus className="h-4 w-4 mr-1" /> Tabung
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowModal('withdraw')}
                disabled={celengan.collected <= 0}
                className="dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Minus className="h-4 w-4 mr-1" /> Tarik
              </Button>

              {/* More Menu (Edit & Delete) */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="md"
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                  className="px-2.5 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden animate-scale-in">
                    <Link
                      href={`/celengan/${id}/edit`}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Pencil className="h-4 w-4 text-slate-400" />
                      Edit Celengan
                    </Link>
                    <button
                      onClick={() => { setShowMenu(false); setShowDeleteDialog(true) }}
                      disabled={deleting}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? 'Menghapus...' : 'Hapus Celengan'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <Card variant="clay" className="mb-8">
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center sm:text-left">
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Terkumpul</p>
                  <p className="font-heading text-4xl font-bold text-teal-600 dark:text-teal-400">{formatRupiah(celengan.collected)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Target</p>
                  <p className="font-heading text-2xl font-bold text-slate-800 dark:text-white">{formatRupiah(celengan.target_amount)}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Sisa</p>
                  <p className="font-heading text-2xl font-bold text-slate-400 dark:text-slate-500">{formatRupiah(remaining <= 0 ? 0 : remaining)}</p>
                </div>
              </div>

              {/* Large Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{progress}%</span>
                </div>
                <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>0%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          {celengan && transactions && (
            <CelenganCharts 
              collected={celengan.collected}
              target={celengan.target_amount}
              transactions={transactions}
            />
          )}

          {/* History Card */}
          <Card variant="default" className="mt-8">
            <CardContent className="pt-6">
              <h2 className="font-heading text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-500" />
                History Transaksi
              </h2>
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 dark:text-slate-500">Belum ada transaksi</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Mulai menabung untuk target ini!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {tx.amount > 0
                            ? <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                            : <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tx.note || (tx.amount > 0 ? 'Menabung' : 'Penarikan')}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(tx.date)}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal Tabung / Tarik */}
      {showModal && (
        <TransaksiModal
          type={showModal}
          celenganId={id}
          maxWithdraw={celengan.collected}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            loadData()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Hapus Celengan?"
        description={`Celengan "${celengan.title}" dan semua data transaksinya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}

function TransaksiModal({
  type,
  celenganId,
  maxWithdraw,
  onClose,
  onSuccess,
}: {
  type: 'deposit' | 'withdraw'
  celenganId: string
  maxWithdraw: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [rawAmount, setRawAmount] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const isDeposit = type === 'deposit'

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setRawAmount(raw)
    setDisplayAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '')
  }

  function setQuickAmount(value: number) {
    setRawAmount(value.toString())
    setDisplayAmount(value.toLocaleString('id-ID'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nominal = parseInt(rawAmount)
    if (!rawAmount || nominal <= 0) return

    if (!isDeposit && nominal > maxWithdraw) {
      alert('Nominal penarikan melebihi saldo yang tersedia')
      return
    }

    setSubmitting(true)

    const finalAmount = isDeposit ? nominal : -nominal

    const { error: txError } = await supabase.from('transactions').insert({
      celengan_id: celenganId,
      amount: finalAmount,
      note: note || null,
      date: new Date().toISOString(),
    })

    setSubmitting(false)

    if (txError) {
      alert('Gagal menyimpan: ' + txError.message)
      return
    }

    onSuccess()
  }

  const quickAmounts = isDeposit
    ? [50000, 100000, 200000, 500000]
    : [50000, 100000, 200000, 500000].filter(v => v <= maxWithdraw)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <Card variant="default" className="shadow-2xl dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-slate-800 dark:text-white">
                {isDeposit ? '💰 Tambah Tabungan' : '💸 Tarik Dana'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nominal {isDeposit ? 'Tabungan' : 'Penarikan'} *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 dark:text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-lg font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                  />
                </div>
                {!isDeposit && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Saldo tersedia: <span className="font-semibold text-teal-600 dark:text-teal-400">{formatRupiah(maxWithdraw)}</span>
                  </p>
                )}
                {/* Quick Amount Buttons */}
                {quickAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setQuickAmount(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          rawAmount === val.toString()
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 ring-1 ring-teal-500 dark:ring-teal-400'
                            : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-400'
                        }`}
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                    {!isDeposit && maxWithdraw > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuickAmount(maxWithdraw)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          rawAmount === maxWithdraw.toString()
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 ring-1 ring-orange-500 dark:ring-orange-400'
                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                        }`}
                      >
                        Semua
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan (opsional)</label>
                <input
                  type="text"
                  placeholder={isDeposit ? 'Misal: gaji bulan Juni' : 'Misal: bayar uang muka'}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="lg" className="flex-1 dark:border-slate-600 dark:text-slate-300" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="clay"
                  size="lg"
                  className={`flex-1 ${!isDeposit ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)]' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : (isDeposit ? 'Simpan' : 'Tarik Dana')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
