'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, PiggyBank, User } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Daftar - Celengin'
  }, [])

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const name = fullName.trim()
    if (!name) {
      setError('Nama lengkap wajib diisi')
      setLoading(false)
      return
    }

    const user = {
      id: 'local-user-id',
      email: name.toLowerCase().replace(/\s+/g, '.') + '@celengin.local',
      user_metadata: { full_name: name },
    }

    localStorage.setItem('celengin_user', JSON.stringify(user))
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-500 text-white mb-4 shadow-lg shadow-teal-500/30">
            <PiggyBank className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white text-center">Daftar</h1>
          <p className="text-slate-500 dark:text-slate-400">Buat profil untuk mulai menabung</p>
        </div>

        <Card variant="clay" className="animate-scale-in">
          <CardContent className="pt-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Kamu</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" variant="clay" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Mulai Menabung'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sudah punya profil?{' '}
                <Link href="/sign-in" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Masuk
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
