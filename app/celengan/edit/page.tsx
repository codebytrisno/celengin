'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getCelengan, updateCelengan } from '@/lib/db'
import { formatRupiah } from '@/lib/utils'
import { CELENGAN_ICONS } from '@/lib/celengan-icons'
import { compressImage, blobToBase64 } from '@/lib/image'

const CATEGORIES = ['Lainnya', 'Rumah', 'Kendaraan', 'Liburan', 'Pendidikan', 'Teknologi', 'Kesehatan', 'Hiburan']

export default function EditCelenganWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    }>
      <EditCelenganPage />
    </Suspense>
  )
}

function EditCelenganPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

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
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    if (!id) return
    loadCelengan()
  }, [authLoading, user, id, router])

  useEffect(() => {
    document.title = 'Edit Celengan - Celengin'
  }, [])

  function loadCelengan() {
    if (!id) return
    const data = getCelengan(id)
    if (!data) { setError('Celengan tidak ditemukan'); setLoading(false); return }
    setTitle(data.title)
    setTargetAmount(data.target_amount.toString())
    setDisplayTarget(formatRupiah(data.target_amount))
    setIcon(data.icon || 'wallet')
    setCategory(data.category || 'Lainnya')
    setImageUrl(data.image_url || '')
    setLoading(false)
  }

  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setTargetAmount(raw)
    setDisplayTarget(raw ? formatRupiah(parseInt(raw)) : '')
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressedBlob = await compressImage(file)
      const base64 = await blobToBase64(compressedBlob)
      setImageFile(file)
      setImagePreview(URL.createObjectURL(compressedBlob))
      setImageUrl(base64)
    } catch {
      setError('Gagal memproses gambar')
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError('')
    setSaving(true)
    try {
      if (!title.trim()) throw new Error('Nama celengan tidak boleh kosong')
      const amount = parseInt(targetAmount)
      if (!targetAmount || amount <= 0) throw new Error('Target harus lebih dari 0')
      updateCelengan(id, {
        title: title.trim(),
        target_amount: amount,
        icon,
        category,
        image_url: imageUrl || null,
      })
      router.push(`/celengan?id=${id}`)
    } catch (err: any) {
      setError(err.message || 'Gagal simpan perubahan')
      setSaving(false)
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Trash2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">ID celengan tidak ditemukan</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="clay" size="md">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    )
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
          <Link href={`/celengan?id=${id}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
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
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Celengan</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Liburan ke Bali"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500" required />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gambar</label>
                <div className="flex items-start gap-4">
                  {(imagePreview || imageUrl) && imageUrl.startsWith('data:') ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src={imagePreview || imageUrl} alt="Preview"
                        className="w-full h-full object-cover" />
                      <button type="button" onClick={removeImage}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : imageUrl && !imageUrl.startsWith('data:') ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src={imageUrl} alt="Preview"
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
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-400 mt-1.5">Format: JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all">
                  {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href={`/celengan?id=${id}`} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">Batal</Button>
                </Link>
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 bg-gradient-to-br from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
