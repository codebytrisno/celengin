'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Sparkles, ImagePlus, X, Link2, Loader2 } from 'lucide-react'
import { CELENGAN_ICONS, CelenganIconRenderer } from '@/lib/celengan-icons'

const CATEGORIES = [
  'Elektronik', 'Kendaraan', 'Properti', 'Pendidikan',
  'Liburan', 'Kesehatan', 'Investasi', 'Hobi', 'Keluarga', 'Lainnya',
]

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      const MAX = 1200
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height / width) * MAX)
          width = MAX
        } else {
          width = Math.round((width / height) * MAX)
          height = MAX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Gagal kompres'))
        },
        'image/webp',
        0.7
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal load'))
    }

    img.src = url
  })
}

export default function BaruCelenganPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('wallet')
  const [category, setCategory] = useState('Lainnya')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  useEffect(() => {
    document.title = 'Buat Celengan Baru - Celengin'
  }, [])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedBlob = await compressImage(file)
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^.]+$/, '.webp'),
        { type: 'image/webp' }
      )

      const previewUrl = URL.createObjectURL(compressedFile)
      setImageFile(compressedFile)
      setImagePreview(previewUrl)
      setImageUrl('')
      setError('')
    } catch {
      setError('Gagal memproses gambar, coba file lain')
    }
  }

  function removeImage() {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setImageUrl('')
    setFileInputKey(k => k + 1)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile || !user) return null

    setUploading(true)
    const fileName = `${user.id}/${Date.now()}.webp`

    const { data, error: uploadErr } = await supabase.storage
      .from('celengin-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      })

    setUploading(false)

    if (uploadErr) {
      console.warn('Upload ke Supabase Storage gagal:', uploadErr.message)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('celengin-images')
      .getPublicUrl(data.path)

    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const nominal = parseInt(targetAmount.replace(/\./g, ''))
    if (!title.trim()) { setError('Nama celengan wajib diisi'); return }
    if (!nominal || nominal <= 0) { setError('Target nominal harus diisi'); return }

    setSubmitting(true)
    setError('')

    let finalImageUrl = imageUrl || null
    if (imageFile) {
      const uploaded = await uploadImage()
      if (uploaded) {
        finalImageUrl = uploaded
      }
    }

    const celenganId = crypto.randomUUID()

    const { error: dbError } = await supabase.from('celengans').insert({
      id: celenganId,
      user_id: user.id,
      title: title.trim(),
      target_amount: nominal,
      icon: selectedIcon,
      category,
      image_url: finalImageUrl,
    })

    setSubmitting(false)

    if (dbError) {
      setError(`Gagal membuat celengan: ${dbError.message}`)
      return
    }

    router.push(`/celengan/${celenganId}`)
    router.refresh()
  }

  function formatInput(value: string) {
    const num = value.replace(/\./g, '').replace(/\D/g, '')
    if (!num) return ''
    return new Intl.NumberFormat('id-ID').format(parseInt(num))
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-teal-500" />
            <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Buat Celengan Baru</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Buat target tabungan baru untuk impianmu</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gambar Motivasi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gambar Motivasi</label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : useUrlInput ? (
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://contoh.com/gambar.jpg"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                  />
                  {imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt="Preview URL"
                        className="w-full h-36 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setUseUrlInput(false); setImageUrl('') }}
                    className="text-xs text-teal-600 hover:text-teal-700 mt-2 font-medium"
                  >
                    Upload file
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 group cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
                      <ImagePlus className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        Upload Gambar
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Otomatis dikompres ke WebP · maks 1200px</p>
                    </div>
                  </button>
                  <input
                    key={fileInputKey}
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setUseUrlInput(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 mt-2 font-medium"
                  >
                    Atau pakai URL gambar
                  </button>
                </div>
              )}
            </div>

            {/* Nama Celengan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Celengan *</label>
              <input
                type="text"
                placeholder="Contoh: MacBook Air M4"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-base font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                autoFocus
              />
            </div>

            {/* Target Nominal */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Nominal *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 dark:text-slate-400">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1.000.000"
                  value={formatInput(targetAmount)}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-lg font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Icon</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {CELENGAN_ICONS.map((item) => {
                  const IconComp = item.icon
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        selectedIcon === item.name
                          ? 'bg-teal-100 dark:bg-teal-900/50 ring-2 ring-teal-500 scale-105 shadow-md'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                      }`}
                      title={item.label}
                    >
                      <IconComp
                        className={`h-5 w-5 ${
                          selectedIcon === item.name
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className={`text-[9px] font-medium leading-none ${
                        selectedIcon === item.name
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      category === cat
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 ring-2 ring-teal-500'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="clay" size="lg" className="flex-1" disabled={submitting || uploading}>
                {submitting || uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploading ? 'Upload Gambar...' : 'Menyimpan...'}
                  </span>
                ) : (
                  'Buat Celengan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
