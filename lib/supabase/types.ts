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
