'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Coba baca dari localStorage dulu (instant, gak hit server)
      try {
        const cached = localStorage.getItem('sb-session')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.user && parsed.access_token) {
            setUser(parsed.user)
            setSession(parsed)
            // Set user dulu, loading = false biar UI cepet render
            setLoading(false)
          }
        }
      } catch { /* ignore cache miss */ }

      // Verify session dari server (background, gak blocking UI)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (cancelled) return

      if (session) {
        setSession(session)
        setUser(session.user ?? null)
        // Cache ke localStorage
        try {
          localStorage.setItem('sb-session', JSON.stringify(session))
        } catch { /* quota exceeded */ }
      } else {
        setUser(null)
        setSession(null)
        localStorage.removeItem('sb-session')
      }
      
      setLoading(false)
    }

    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return

      if (session) {
        setSession(session)
        setUser(session.user ?? null)
        try { localStorage.setItem('sb-session', JSON.stringify(session)) } catch {}
      } else {
        setUser(null)
        setSession(null)
        localStorage.removeItem('sb-session')
      }
      
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    localStorage.removeItem('sb-session')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
