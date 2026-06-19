export type Database = {
  public: {
    Tables: {
      celengans: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          icon?: string
          category?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          icon?: string
          category?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          celengan_id: string
          amount: number
          note: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          celengan_id: string
          amount: number
          note?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          celengan_id?: string
          amount?: number
          note?: string | null
          date?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_collected: {
        Args: { celengan_id: string }
        Returns: number
      }
    }
  }
}

export type Celengan = Database['public']['Tables']['celengans']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
