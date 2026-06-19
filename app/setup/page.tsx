'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Database, Shield, CheckCircle, AlertTriangle, Copy } from 'lucide-react'

const SQL = `-- ============================================================
-- SQL lengkap buat setup semua yang lo butuh
-- Aman dijalanin berkali-kali (pake DROP IF EXISTS semua)
-- ============================================================

-- 1. Kolom image_url
ALTER TABLE celengans ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. RLS: INSERT celengans
DROP POLICY IF EXISTS "Users can insert own celengans" ON celengans;
CREATE POLICY "Users can insert own celengans" ON celengans FOR INSERT
TO authenticated WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- 3. RLS: SELECT celengans
DROP POLICY IF EXISTS "Users can view own celengans" ON celengans;
CREATE POLICY "Users can view own celengans" ON celengans FOR SELECT
TO authenticated USING (user_id = auth.jwt() ->> 'sub');

-- 4. RLS: UPDATE celengans (buat edit kategori dll)
DROP POLICY IF EXISTS "Users can update own celengans" ON celengans;
CREATE POLICY "Users can update own celengans" ON celengans FOR UPDATE
TO authenticated USING (user_id = auth.jwt() ->> 'sub')
WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- 5. RLS: DELETE celengans
DROP POLICY IF EXISTS "Users can delete own celengans" ON celengans;
CREATE POLICY "Users can delete own celengans" ON celengans FOR DELETE
TO authenticated USING (user_id = auth.jwt() ->> 'sub');

-- 6. RLS: INSERT transactions
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM celengans WHERE celengans.id = transactions.celengan_id
          AND celengans.user_id = auth.jwt() ->> 'sub')
);

-- 7. RLS: SELECT transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM celengans WHERE celengans.id = transactions.celengan_id
          AND celengans.user_id = auth.jwt() ->> 'sub')
);

-- 8. Storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('celengin-images', 'celengin-images', true, false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Auth users upload images" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'celengin-images');

DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public view images" ON storage.objects FOR SELECT
TO public USING (bucket_id = 'celengin-images');

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users delete own images" ON storage.objects FOR DELETE
TO authenticated USING (
  bucket_id = 'celengin-images'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);`

export default function SetupPage() {
  const { user, loading: authLoading } = useAuth()
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{ step: string; ok: boolean; msg: string }[] | null>(null)
  const router = useRouter()

  async function runSetup() {
    setTesting(true)
    setResults(null)

    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([{ step: 'api', ok: false, msg: 'Gagal connect ke API setup' }])
    }
    setTesting(false)
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 mb-6 transition-colors">
          ← Kembali
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Database className="h-6 w-6 text-teal-500" />
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Setup Database</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Jalanin SQL ini sekali doang di Supabase, abis itu semua fitur langsung jalan.</p>

        {/* Steps */}
        <div className="grid gap-4 mb-8">
          <Card variant="clay">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Buka Supabase SQL Editor</h3>
                  <a
                    href="https://supabase.com/dashboard/project/wgihlrvplyjxvuvqisbg/sql/new"
                    target="_blank"
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm underline underline-offset-2"
                  >
                    supabase.com/dashboard/project/.../sql/new ↗
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="clay">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300 shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Copy SQL di bawah</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Klik tombol Copy, atau select all → Ctrl+C</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="clay">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300 shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Paste & Run di SQL Editor</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ctrl+V → klik Run atau Ctrl+Enter. Selesai!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SQL Block */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-800">
            <span className="text-xs text-slate-400 font-mono">migration.sql</span>
            <button
              onClick={copySQL}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-5 text-sm text-slate-300 font-mono leading-relaxed overflow-x-auto">
            <code>{SQL}</code>
          </pre>
        </div>

        {/* Auto Setup Button */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Atau coba setup otomatis (mungkin gagal kalo gak ada service_role key):</p>
          <Button variant="clay" size="lg" onClick={runSetup} disabled={testing}>
            {testing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Mengecek...
              </span>
            ) : (
              'Coba Setup Otomatis'
            )}
          </Button>

          {results && (
            <div className="mt-4 space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                  r.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {r.ok ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                  <span>{r.msg}</span>
                </div>
              ))}
              {results.some(r => !r.ok) && (
                <p className="text-xs text-slate-400 mt-2">
                  ⚠️ Setup otomatis gabisa karena cuma punya anon key. Lo harus jalanin SQL manual di atas.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
