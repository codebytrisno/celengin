import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/auth-context'
import { ThemeProvider } from '@/lib/theme/theme-context'
import { LanguageProvider } from '@/lib/i18n/language-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Celengin - Capai Tabungan & Impianmu',
  description: 'Celengin - Aplikasi celengan digital yang bikin kamu semangat nabung. Pantau target, lacak progres, raih impianmu!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-slate-50 min-h-screen selection:bg-teal-200 dark:bg-slate-900 dark:selection:bg-teal-600 transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
