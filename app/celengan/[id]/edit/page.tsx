'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Celengan } from '@/lib/supabase/types'
import { formatRupiah } from '@/lib/utils'
import { CELENGAN_ICONS } from '@/lib/celengan-icons'

const CATEGORIES = ['Lainnya', 'Rumah', 'Kendaraan', 'Liburan', 'Pendidikan', 'Teknologi', 'Kesehatan', 'Hiburan']

export default function EditCelenganPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [displayTarget, setDisplayTarget] = useState('')
  const [icon, setIcon] = useState('wallet')
  const [category, setCategory] = useState('Lainnya')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [celengan, setCelengan] = useState<Celengan | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    loadCelengan()
  }, [authLoading, user, router])

  useEffect(() => {
    if (celengan) {
      document.title = `Edit ${celengan.title} - Celengin`
    }
  }, [celengan])

  async function loadCelengan() {
    if (!user) return
    try {
      const { data, error: err } = await supabase
        .from('celengans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (err) throw err
      if (!data) { setError('Celengan tidak ditemukan'); setLoading(false); return }
      setCelengan(data as Celengan)
      setTitle(data.title)
      setTargetAmount(data.target_amount.toString())
      setDisplayTarget(formatRupiah(data.target_amount))
      setIcon(data.icon || 'wallet')
      setCategory(data.category || 'Lainnya')
      setImageUrl(data.image_url || '')
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Gagal load celengan')
      setLoading(false)
    }
  }

  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setTargetAmount(raw)
    setDisplayTarget(raw ? formatRupiah(parseInt(raw)) : '')
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return imageUrl || null
    setUploading(true)
    try {
      const ext = imageFile.name.split('.').pop() || 'webp'
      const fileName = `${user!.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('celengin-images')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: true })
      if (uploadErr) throw uploadErr
      const { data: { publicUrl } } = supabase.storage
        .from('celengin-images')
        .getPublicUrl(fileName)
      return publicUrl
    } catch (err: any) {
      console.error('Upload error:', err)
      return imageUrl || null
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!title.trim()) throw new Error('Nama celengan tidak boleh kosong')
      const amount = parseInt(targetAmount)
      if (!targetAmount || amount <= 0) throw new Error('Target harus lebih dari 0')
      const finalImage = await uploadImage()
      const { error: err } = await (supabase as any)
        .from('celengans')
        .update({ title: title.trim(), target_amount: amount, icon, category, image_url: finalImage, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user?.id)
      if (err) throw err
      router.push(`/celengan/${id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal simpan perubahan')
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Link href={`/celengan/${id}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Edit Celengan</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Ubah informasi celenganmu</p>
        </div>
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium mb-6">{error}</div>
        )}
        <Card variant="clay" className="dark:bg-slate-800">
          <CardContent className="pt-8">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Celengan</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Liburan ke Bali"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" required />
              </div>

              {/* Target with Rupiah format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">Rp</span>
                  <input type="text" value={displayTarget} onChange={handleTargetChange}
                    placeholder="1.000.000"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" required />
                </div>
                {targetAmount && (
                  <p className="text-xs text-slate-400 mt-1.5">Nilai: Rp{formatRupiah(parseInt(targetAmount))}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gambar</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  {(imagePreview || imageUrl) ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src={imagePreview || imageUrl} alt="Preview"
                        className="w-full h-full object-cover" />
                      <button type="button" onClick={removeImage}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-shrink-0 bg-slate-50">
                      <Upload className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-teal-300 dark:hover:border-teal-500 transition-all cursor-pointer gap-2">
                      <Upload className="h-4 w-4" />
                      {imageFile ? imageFile.name : 'Pilih Gambar'}
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-400 mt-1.5">Format: JPG, PNG, WEBP. Maks 5MB</p>
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {CELENGAN_ICONS.map((item) => {
                    const IconComp = item.icon
                    return (
                      <button key={item.name} type="button" onClick={() => setIcon(item.name)}
                        className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                          icon === item.name
                            ? 'bg-teal-100 dark:bg-teal-900/50 ring-2 ring-teal-500 scale-105'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        title={item.label}
                      >
                        <IconComp
                          className={`h-5 w-5 ${
                            icon === item.name
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                          strokeWidth={1.75}
                        />
                        <span className={`text-[8px] font-medium leading-none ${
                          icon === item.name
                            ? 'text-teal-700 dark:text-teal-300'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all">
                  {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Link href={`/celengan/${id}`} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">Batal</Button>
                </Link>
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 h-12 bg-gradient-to-br from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30">
                  {saving || uploading ? <><Loader2 className="h-4 w-4 animate-spin" />{uploading ? 'Upload...' : 'Menyimpan...'}</> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
