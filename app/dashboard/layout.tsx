'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/dashboard/sidebar'
import { LayoutDashboard, Target, PlusCircle, Settings, PiggyBank } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const bottomNav = [
    { icon: LayoutDashboard, name: 'Dashboard', href: '/dashboard' },
    { icon: Target, name: 'Target', href: '/dashboard/target' },
    { icon: PlusCircle, name: 'Tambah', href: '/celengan/baru' },
    { icon: PiggyBank, name: 'Aktivitas', href: '/dashboard/aktivitas' },
    { icon: Settings, name: 'Atur', href: '/dashboard/pengaturan' },
  ]

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden pb-20 lg:pb-0">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-4 py-2 flex justify-around z-40">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
