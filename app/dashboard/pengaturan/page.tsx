'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { PiggyBank, Mail, User, Shield, Bell, LogOut, Lock, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function PengaturanPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()
  
  // Change Password State
  const [showForm, setShowForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/sign-in')
  }, [authLoading, user, router])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password baru minimal 6 karakter' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok' })
      return
    }
    if (currentPassword === newPassword) {
      setPassMsg({ type: 'error', text: 'Password baru harus berbeda dari password lama' })
      return
    }

    setSaving(true)
    try {
      // Verifikasi current password dengan login ulang
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      })
      
      if (signInErr) {
        setPassMsg({ type: 'error', text: 'Password saat ini salah' })
        setSaving(false)
        return
      }

      // Update password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateErr) throw updateErr

      setPassMsg({ type: 'success', text: 'Password berhasil diubah!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setShowForm(false), 2000)
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Gagal ubah password' })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    )
  }

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email = user.email || '-'

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Kelola akun dan preferensi kamu</p>
      </div>

      {/* Profile Card */}
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

      {/* Info Akun */}
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
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">Email / Password</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="animate-fade-in-up space-y-3">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Keamanan</h3>

        {/* Ubah Password Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-200 group"
        >
          <div className="p-1.5 sm:p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
            <Lock className="h-4 sm:h-5 w-4 sm:w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">Ubah Password</p>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">Ganti password akun kamu</p>
          </div>
        </button>

        {/* Change Password Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 sm:p-6 animate-scale-in">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Message */}
              {passMsg.text && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  passMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }`}>
                  {passMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {passMsg.text}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); setPassMsg({ type: '', text: '' }) }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-11 bg-gradient-to-br from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 group"
        >
          <div className="p-1.5 sm:p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
            <LogOut className="h-4 sm:h-5 w-4 sm:w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">Keluar</p>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">Keluar dari akun kamu</p>
          </div>
        </button>
      </div>
    </>
  )
}
