'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type LocalUser = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

type AuthContextType = {
  user: LocalUser | null
  session: unknown
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('celengin_user')
      if (raw) {
        const parsed = JSON.parse(raw) as LocalUser
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem('celengin_user')
    }
    setLoading(false)
  }, [])

  const signOut = async () => {
    localStorage.removeItem('celengin_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, session: null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
