'use client'

import type { Celengan, Transaction } from './db'

export type BackupData = {
  version: 1
  exported_at: string
  user: Record<string, unknown> | null
  celengans: Celengan[]
  transactions: Transaction[]
}

function getStorageKey(key: string): string {
  try {
    return localStorage.getItem(key) || '[]'
  } catch {
    return '[]'
  }
}

export function getBackupData(): BackupData {
  const celengansRaw = getStorageKey('celengin_celengans')
  const transactionsRaw = getStorageKey('celengin_transactions')
  const userRaw = localStorage.getItem('celengin_user')

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    user: userRaw ? JSON.parse(userRaw) : null,
    celengans: JSON.parse(celengansRaw),
    transactions: JSON.parse(transactionsRaw),
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportJSON() {
  const data = getBackupData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `celengin-backup-${data.exported_at.slice(0, 10)}.json`)
}

export function exportCelengansCSV() {
  const data = getBackupData()
  const rows = data.celengans.map(c => {
    const collected = data.transactions
      .filter(t => t.celengan_id === c.id)
      .reduce((s, t) => s + t.amount, 0)
    return {
      id: c.id,
      title: c.title,
      target_amount: c.target_amount,
      collected,
      remaining: Math.max(0, c.target_amount - collected),
      icon: c.icon,
      category: c.category,
      created_at: c.created_at,
    }
  })

  const headers = ['id', 'title', 'target_amount', 'collected', 'remaining', 'icon', 'category', 'created_at']
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = (r as Record<string, unknown>)[h]
        if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) return `"${v.replace(/"/g, '""')}"`
        return String(v)
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `celengin-celengans-${data.exported_at.slice(0, 10)}.csv`)
}

export function exportTransactionsCSV() {
  const data = getBackupData()
  const celenganMap = new Map(data.celengans.map(c => [c.id, c.title]))

  const rows = data.transactions.map(t => ({
    id: t.id,
    celengan_id: t.celengan_id,
    celengan_title: celenganMap.get(t.celengan_id) || '',
    amount: t.amount,
    type: t.amount > 0 ? 'deposit' : 'withdraw',
    note: t.note || '',
    date: t.date,
    created_at: t.created_at,
  }))

  const headers = ['id', 'celengan_id', 'celengan_title', 'amount', 'type', 'note', 'date', 'created_at']
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = (r as Record<string, unknown>)[h]
        if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) return `"${v.replace(/"/g, '""')}"`
        return String(v)
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `celengin-transactions-${data.exported_at.slice(0, 10)}.csv`)
}

export function importFromJSON(
  data: unknown,
  mode: 'merge' | 'replace'
): { success: boolean; message: string } {
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'File tidak valid' }
  }

  const backup = data as Partial<BackupData>

  if (backup.version !== 1) {
    return { success: false, message: 'Format backup tidak dikenal' }
  }

  if (!Array.isArray(backup.celengans) || !Array.isArray(backup.transactions)) {
    return { success: false, message: 'Data celengan atau transaksi tidak ditemukan' }
  }

  try {
    if (mode === 'replace') {
      localStorage.setItem('celengin_celengans', JSON.stringify(backup.celengans))
      localStorage.setItem('celengin_transactions', JSON.stringify(backup.transactions))
      if (backup.user) {
        localStorage.setItem('celengin_user', JSON.stringify(backup.user))
      }
      return {
        success: true,
        message: `Berhasil mengganti data dengan ${backup.celengans.length} celengan dan ${backup.transactions.length} transaksi`,
      }
    }

    const existingCelengans: Celengan[] = JSON.parse(localStorage.getItem('celengin_celengans') || '[]')
    const existingIds = new Set(existingCelengans.map(c => c.id))
    let addedCelengans = 0

    for (const c of backup.celengans) {
      if (!existingIds.has(c.id)) {
        existingCelengans.push(c)
        addedCelengans++
      }
    }

    const existingTransactions: Transaction[] = JSON.parse(localStorage.getItem('celengin_transactions') || '[]')
    const existingTxIds = new Set(existingTransactions.map(t => t.id))
    let addedTransactions = 0

    for (const t of backup.transactions) {
      if (!existingTxIds.has(t.id)) {
        existingTransactions.push(t)
        addedTransactions++
      }
    }

    localStorage.setItem('celengin_celengans', JSON.stringify(existingCelengans))
    localStorage.setItem('celengin_transactions', JSON.stringify(existingTransactions))

    return {
      success: true,
      message: `Berhasil menggabungkan data: ${addedCelengans} celengan baru, ${addedTransactions} transaksi baru ditambahkan`,
    }
  } catch (e) {
    return { success: false, message: `Gagal mengimpor: ${e instanceof Error ? e.message : 'error tidak dikenal'}` }
  }
}
