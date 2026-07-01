'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { CelenginIcon } from '@/components/ui/celengin-icon'
import { Button } from '@/components/ui/button'
import { User, Menu, X, LayoutDashboard, Home, LogOut, Moon, Sun, Globe, Heart } from 'lucide-react'
import { useTheme } from '@/lib/theme/theme-context'
import { useLanguage } from '@/lib/i18n/language-context'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/celengan')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled
        ? 'border-slate-200 bg-white/95 shadow-sm dark:border-slate-700 dark:bg-slate-900/95'
        : 'border-slate-100 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80'
    } backdrop-blur-md animate-slide-down`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={isDashboard ? '/dashboard' : '/'} className="flex items-center gap-2">
            <CelenginIcon className="h-7 w-7 text-teal-500 dark:text-teal-400" />
            <span className="font-heading text-xl font-bold text-slate-800 dark:text-white">
              Celeng<span className="text-teal-500 dark:text-teal-400">in</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
                Fitur
              </Link>
            )}
            {/* Theme Toggle - always visible */}
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800 transition-all"
              title={t('navbar.darkMode')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Language Toggle - always visible */}
            <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800 transition-all"
              title={t('navbar.language')}>
              <Globe className="h-3.5 w-3.5" />
              <span>{language === 'id' ? 'EN' : 'ID'}</span>
            </button>
            {!loading && user ? (
              <>
                {isDashboard && (
                  <Link href="/" className="text-sm font-medium text-slate-600 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
                    Beranda
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
                  Dashboard
                </Link>
                <a 
                  href="https://sociabuzz.com/trisnosanjaya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  <span>Donasi</span>
                </a>
                {!isDashboard && (
                <div className="flex items-center gap-2">
                  {/* Profile Avatar */}
                  <div className="flex items-center gap-2 bg-teal-50 rounded-full px-3 py-1.5 dark:bg-slate-800">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs text-slate-600 max-w-[100px] truncate dark:text-slate-300">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut} className="text-xs dark:text-slate-300 dark:border-slate-600">
                    Keluar
                  </Button>
                </div>
                )}
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
                  Masuk
                </Link>
                <Link href="/register">
                  <Button variant="clay" size="md">Mulai Menabung</Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Drawer */}
            <div className="fixed top-16 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl md:hidden animate-slide-down dark:bg-slate-800 dark:border-slate-700">
              <div className="p-4 space-y-3">
                {/* Profile Section (if logged in) */}
                {user && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 mb-2 dark:bg-slate-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate dark:text-white">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                {!loading && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        pathname === '/dashboard'
                          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/"
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        pathname === '/'
                          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span className="font-medium">Beranda</span>
                    </Link>
                    <a
                      href="https://sociabuzz.com/trisnosanjaya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all shadow-sm"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                      <span className="font-semibold">Donasi</span>
                    </a>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full text-left dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Keluar</span>
                    </button>
                  </>
                ) : !loading ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Masuk</span>
                    </Link>
                    <Link href="/register" className="block">
                      <Button variant="clay" size="lg" className="w-full justify-center">
                        Mulai Menabung
                      </Button>
                    </Link>
                  </>
                ) : null}

                {/* Theme & Language Toggles (Mobile) */}
                <div className="flex items-center gap-2 p-3 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={toggleTheme} className="flex-1 flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all dark:text-slate-400 dark:hover:bg-slate-700">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="text-sm font-medium">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                  </button>
                  <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                    className="flex-1 flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all dark:text-slate-400 dark:hover:bg-slate-700">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">{language === 'id' ? 'English' : 'Indonesia'}</span>
                  </button>
                </div>

                {/* Fitur (hanya di landing page) */}
                {!isDashboard && (
                  <Link
                    href="/#features"
                    className="block p-3 text-sm text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Fitur
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
