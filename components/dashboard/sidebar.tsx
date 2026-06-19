'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  LayoutDashboard, 
  PiggyBank, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isLinkActive = (href: string) => pathname === href

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Target Saya', icon: Target, href: '/dashboard/target' },
    { name: 'Aktivitas', icon: PiggyBank, href: '/dashboard/aktivitas' },
    { name: 'Pengaturan', icon: Settings, href: '/dashboard/pengaturan' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <PiggyBank className="h-8 w-8 text-teal-500" />
          <span className="font-heading text-xl font-bold text-slate-800 dark:text-white">
              Celeng<span className="text-teal-500">in</span>
          </span>
        </Link>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-sm border-2 border-teal-200 dark:border-teal-700">
            {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              isLinkActive(link.href)
                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300"
                : "text-slate-600 hover:bg-slate-50 hover:text-teal-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-3">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
          <PlusCircle className="absolute -right-2 -bottom-2 h-20 w-20 text-white/10" />
          <h4 className="font-heading font-bold text-sm mb-1 relative z-10">Mulai Menabung?</h4>
          <p className="text-[10px] text-teal-100 mb-3 relative z-10">Wujudkan mimpimu lebih cepat dengan menabung rutin.</p>
          <Link href="/celengan/baru">
            <button className="bg-white text-teal-600 text-[11px] font-bold px-4 py-2 rounded-lg relative z-10 hover:bg-teal-50 transition-colors w-full">
              + Tambah Celengan
            </button>
          </Link>
        </div>
        
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
