'use client'

export type Celengan = {
  id: string
  user_id: string
  title: string
  target_amount: number
  icon: string
  category: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  celengan_id: string
  amount: number
  note: string | null
  date: string
  created_at: string
}

const KEYS = {
  celengans: 'celengin_celengans',
  transactions: 'celengin_transactions',
}

function generateId(): string {
  return crypto.randomUUID()
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Celengans ──

export function getCelengans(): (Celengan & { collected: number })[] {
  const list = read<Celengan>(KEYS.celengans)
  return list.map(c => ({ ...c, collected: getCollected(c.id) }))
}

export function getCelengan(id: string): (Celengan & { collected: number }) | null {
  const list = read<Celengan>(KEYS.celengans)
  const c = list.find(x => x.id === id)
  if (!c) return null
  return { ...c, collected: getCollected(id) }
}

export function createCelengan(
  data: Pick<Celengan, 'title' | 'target_amount'> & Partial<Pick<Celengan, 'icon' | 'category' | 'image_url'>> & { user_id?: string }
): Celengan {
  const list = read<Celengan>(KEYS.celengans)
  const now = new Date().toISOString()
  const item: Celengan = {
    id: generateId(),
    user_id: data.user_id || 'local-user',
    title: data.title,
    target_amount: data.target_amount,
    icon: data.icon || 'wallet',
    category: data.category || 'Lainnya',
    image_url: data.image_url ?? null,
    created_at: now,
    updated_at: now,
  }
  list.push(item)
  write(KEYS.celengans, list)
  return item
}

export function updateCelengan(id: string, data: Partial<Celengan>): boolean {
  const list = read<Celengan>(KEYS.celengans)
  const idx = list.findIndex(c => c.id === id)
  if (idx === -1) return false
  list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() }
  write(KEYS.celengans, list)
  return true
}

export function deleteCelengan(id: string): void {
  const list = read<Celengan>(KEYS.celengans)
  write(KEYS.celengans, list.filter(c => c.id !== id))
  const txs = read<Transaction>(KEYS.transactions)
  write(KEYS.transactions, txs.filter(t => t.celengan_id !== id))
}

// ── Transactions ──

export function getTransactions(celenganId: string): Transaction[] {
  const list = read<Transaction>(KEYS.transactions)
  return list
    .filter(t => t.celengan_id === celenganId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50)
}

export function getTransactionsByCelenganIds(ids: string[]): Transaction[] {
  if (ids.length === 0) return []
  const idSet = new Set(ids)
  const list = read<Transaction>(KEYS.transactions)
  return list
    .filter(t => idSet.has(t.celengan_id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50)
}

export function createTransaction(
  data: Pick<Transaction, 'celengan_id' | 'amount'> & Partial<Pick<Transaction, 'note' | 'date'>>
): Transaction {
  const list = read<Transaction>(KEYS.transactions)
  const item: Transaction = {
    id: generateId(),
    celengan_id: data.celengan_id,
    amount: data.amount,
    note: data.note ?? null,
    date: data.date ?? new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
  list.push(item)
  write(KEYS.transactions, list)
  return item
}

export function getCollected(celenganId: string): number {
  const txs = read<Transaction>(KEYS.transactions)
  return txs
    .filter(t => t.celengan_id === celenganId)
    .reduce((sum, t) => sum + t.amount, 0)
}
