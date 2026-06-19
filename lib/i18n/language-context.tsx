'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'id' | 'en'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  id: {
    // Navbar
    'navbar.features': 'Fitur',
    'navbar.dashboard': 'Dashboard',
    'navbar.home': 'Beranda',
    'navbar.logout': 'Keluar',
    'navbar.login': 'Masuk',
    'navbar.signup': 'Mulai Menabung',
    'navbar.language': 'Bahasa',
    'navbar.darkMode': 'Mode Gelap',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Kelola semua celenganmu di sini',
    'dashboard.createBtn': 'Buat Celengan',
    'dashboard.totalCollected': 'Total Terkumpul',
    'dashboard.totalTarget': 'Total Target',
    'dashboard.numCelengans': 'Jumlah Celengan',
    'dashboard.noCelengans': 'Belum ada celengan',
    'dashboard.startSaving': 'Mulai menabung sekarang!',
    
    // Settings
    'settings.title': 'Pengaturan',
    'settings.subtitle': 'Kelola akun dan preferensi kamu',
    'settings.accountInfo': 'Informasi Akun',
    'settings.security': 'Keamanan',
    'settings.name': 'Nama',
    'settings.email': 'Email',
    'settings.loginVia': 'Login Via',
    'settings.changePassword': 'Ubah Password',
    'settings.changePasswordDesc': 'Ganti password akun kamu',
    'settings.currentPassword': 'Password Saat Ini',
    'settings.newPassword': 'Password Baru',
    'settings.confirmPassword': 'Konfirmasi Password Baru',
    'settings.savePassword': 'Simpan Password',
    'settings.cancel': 'Batal',
    'settings.passwordSuccess': 'Password berhasil diubah!',
    'settings.passwordError': 'Gagal ubah password',
    'settings.logout': 'Keluar',
    'settings.logoutDesc': 'Keluar dari akun kamu',
    
    // Edit Celengan
    'edit.title': 'Edit Celengan',
    'edit.subtitle': 'Ubah informasi celenganmu',
    'edit.name': 'Nama Celengan',
    'edit.target': 'Target (Rp)',
    'edit.image': 'Gambar',
    'edit.emoji': 'Emoji',
    'edit.category': 'Kategori',
    'edit.save': 'Simpan Perubahan',
    'edit.back': 'Kembali',
  },
  en: {
    // Navbar
    'navbar.features': 'Features',
    'navbar.dashboard': 'Dashboard',
    'navbar.home': 'Home',
    'navbar.logout': 'Logout',
    'navbar.login': 'Login',
    'navbar.signup': 'Start Saving',
    'navbar.language': 'Language',
    'navbar.darkMode': 'Dark Mode',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Manage all your piggy banks here',
    'dashboard.createBtn': 'Create Piggy Bank',
    'dashboard.totalCollected': 'Total Collected',
    'dashboard.totalTarget': 'Total Target',
    'dashboard.numCelengans': 'Number of Piggy Banks',
    'dashboard.noCelengans': 'No piggy banks yet',
    'dashboard.startSaving': 'Start saving now!',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences',
    'settings.accountInfo': 'Account Information',
    'settings.security': 'Security',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.loginVia': 'Login Via',
    'settings.changePassword': 'Change Password',
    'settings.changePasswordDesc': 'Change your account password',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmPassword': 'Confirm New Password',
    'settings.savePassword': 'Save Password',
    'settings.cancel': 'Cancel',
    'settings.passwordSuccess': 'Password changed successfully!',
    'settings.passwordError': 'Failed to change password',
    'settings.logout': 'Logout',
    'settings.logoutDesc': 'Logout from your account',
    
    // Edit Celengan
    'edit.title': 'Edit Piggy Bank',
    'edit.subtitle': 'Update your piggy bank information',
    'edit.name': 'Piggy Bank Name',
    'edit.target': 'Target (Rp)',
    'edit.image': 'Image',
    'edit.emoji': 'Emoji',
    'edit.category': 'Category',
    'edit.save': 'Save Changes',
    'edit.back': 'Back',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('id')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null
    const initial = saved || 'id'
    setLang(initial)
    setMounted(true)
  }, [])

  function setLanguage(lang: Language) {
    setLang(lang)
    localStorage.setItem('language', lang)
  }

  function t(key: string): string {
    return translations[language]?.[key] || translations['id']?.[key] || key
  }

  if (!mounted) return children

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return default during SSR/build time
    return { language: 'id' as const, setLanguage: () => {}, t: (key: string) => key }
  }
  return context
}
