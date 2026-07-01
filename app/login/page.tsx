'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PiggyBank, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ full_name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Masuk - Celengin'
    try {
      const raw = localStorage.getItem('celengin_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser({ full_name: parsed.user_metadata?.full_name || parsed.email?.split('@')[0] || 'User' })
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  function handleContinue() {
    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-500 text-white mb-4 shadow-lg shadow-teal-500/30">
            <PiggyBank className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white text-center">Masuk</h1>
          <p className="text-slate-500 dark:text-slate-400">Lanjutkan menabung</p>
        </div>

        <Card variant="clay" className="animate-scale-in">
          <CardContent className="pt-8">
            {user ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-2xl border-2 border-teal-200 dark:border-teal-700 mx-auto">
                  {user.full_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-slate-800 dark:text-white">{user.full_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Klik tombol di bawah untuk melanjutkan</p>
                </div>
                <Button variant="clay" size="lg" className="w-full" onClick={handleContinue}>
                  Lanjut ke Dashboard
                </Button>
                <button
                  onClick={() => { localStorage.removeItem('celengin_user'); window.location.reload() }}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  Ganti Profil
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 inline-flex mx-auto">
                  <User className="h-8 w-8 text-teal-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">Belum ada profil tersimpan</p>
                <Link href="/register">
                  <Button variant="clay" size="lg" className="w-full">
                    Buat Profil Baru
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
