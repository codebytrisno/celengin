'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PiggyBank, Mail, User, Shield, LogOut, Upload, FileJson, FileSpreadsheet, AlertTriangle } from 'lucide-react'
import { exportJSON, exportCelengansCSV, exportTransactionsCSV, importFromJSON } from '@/lib/backup'

export default function PengaturanPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/sign-in')
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    )
  }

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email = user.email || '-'

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = importFromJSON(data, importMode)
      setImportResult(result)
    } catch {
      setImportResult({ success: false, message: 'File JSON tidak valid' })
    }

    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Kelola profil kamu</p>
      </div>

      <Card variant="clay" className="mb-4 sm:mb-6 animate-scale-in">
        <CardContent className="p-4 sm:pt-6 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-lg sm:text-2xl border-2 border-teal-200 dark:border-teal-700">
              {name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-800 dark:text-white truncate">
                {name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="animate-fade-in-up mb-4 sm:mb-6">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Informasi Akun</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <User className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Nama</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Email</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Shield className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Login Via</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">Lokal (Offline)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up mb-4 sm:mb-6">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Pencadangan Data</h3>
        <Card variant="clay" className="mb-3">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
              Ekspor semua data celengan dan transaksi sebagai cadangan.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="clay" size="sm" onClick={exportJSON}>
                <FileJson className="h-3.5 w-3.5 mr-1.5" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportCelengansCSV}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                CSV Celengan
              </Button>
              <Button variant="outline" size="sm" onClick={exportTransactionsCSV}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                CSV Transaksi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-in-up mb-4 sm:mb-6">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Pemulihan Data</h3>
        <Card variant="clay" className="mb-3">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
              Impor file backup JSON untuk memulihkan data.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Gabung</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Ganti Semua</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="clay" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {importing ? 'Mengimpor...' : 'Pilih File JSON'}
              </Button>
              {importMode === 'replace' && (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Semua data akan diganti
                </span>
              )}
            </div>

            {importResult && (
              <div className={`mt-3 p-3 rounded-xl text-xs sm:text-sm ${
                importResult.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {importResult.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-in-up space-y-3">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 group"
        >
          <div className="p-1.5 sm:p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <LogOut className="h-4 sm:h-5 w-4 sm:w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">Keluar</p>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">Hapus profil dan data lokal</p>
          </div>
        </button>
      </div>
    </>
  )
}
