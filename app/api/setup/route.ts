import { NextResponse } from 'next/server'

export async function POST() {
  const results: { step: string; success: boolean; message: string }[] = []

  // 1. Add image_url column
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/add_column_if_not_exists`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          table_name: 'celengans',
          column_name: 'image_url',
          column_type: 'TEXT',
        }),
      }
    )
    if (res.ok) {
      results.push({ step: 'add_column', success: true, message: 'Kolom image_url berhasil ditambahkan' })
    } else {
      // RPC not found — need to run SQL manually
      results.push({
        step: 'add_column',
        success: false,
        message: 'Tidak bisa tambah kolom via API. Jalankan SQL manual di Supabase SQL Editor.',
      })
    }
  } catch {
    results.push({
      step: 'add_column',
      success: false,
      message: 'Gagal terkoneksi ke Supabase.',
    })
  }

  // 2. Create storage bucket
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          id: 'celengin-images',
          name: 'celengin-images',
          public: true,
        }),
      }
    )
    if (res.ok) {
      results.push({ step: 'create_bucket', success: true, message: 'Bucket celengin-images berhasil dibuat' })
    } else {
      const err = await res.json().catch(() => ({}))
      results.push({
        step: 'create_bucket',
        success: false,
        message: `Gagal buat bucket: ${err.message || 'butuh service_role key'}.`,
      })
    }
  } catch {
    results.push({
      step: 'create_bucket',
      success: false,
      message: 'Gagal terkoneksi ke Supabase Storage.',
    })
  }

  const allOk = results.every((r) => r.success)

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'partial',
      message: allOk
        ? 'Setup berhasil!'
        : 'Setup sebagian gagal, SQL manual diperlukan (lihat file supabase/migrations/)',
      results,
    },
    { status: allOk ? 200 : 200 }
  )
}
