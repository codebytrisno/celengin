'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PiggyBank } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/sign-in')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <PiggyBank className="h-12 w-12 text-teal-500 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-500">Mengalihkan...</p>
      </div>
    </div>
  )
}
