import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Crosshair, Wallet, Trophy, Target, PiggyBank, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Celengin — menabung jadi seru
            </div>
            <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Capai <span className="text-teal-500">Impian Finansial</span>
              <br />
              dengan <span className="text-teal-500">Celengin</span>
            </h1>
            <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Aplikasi celengan digital yang bikin kamu semangat nabung. Pantau target, lacak progres, raih impianmu!
            </p>
            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button variant="clay" size="lg">Buat Akun Gratis</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">Masuk</Button>
              </Link>
            </div>
          </div>
          <div className="animate-fade-in-up delay-400 mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden clay-3d p-1">
              <div className="bg-gradient-to-r from-teal-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-700 clay-3d-sm group-hover:scale-110 transition-transform duration-300">
                      <Crosshair className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-slate-800 dark:text-white">Set Tujuan</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Tentukan target tabungan kamu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-700 clay-3d-sm group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-slate-800 dark:text-white">Isi Celengan</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Tambahkan tabungan kapan saja</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-700 clay-3d-sm group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="h-8 w-8 text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-slate-800 dark:text-white">Capai Target</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Raih impian finansialmu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16" id="features">
          <h2 className="animate-fade-in-up font-heading text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Cara Kerjanya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Buat Tujuan', desc: 'Tentukan nama tujuan, target nominal, dan timeline tabunganmu.', icon: Target },
              { step: '2', title: 'Isi Tabungan', desc: 'Tambahkan tabungan kapan saja melalui aplikasi yang responsif.', icon: PiggyBank },
              { step: '3', title: 'Pantau Progress', desc: 'Lihat progress visual dan grafik pertumbuhan tabunganmu.', icon: BarChart3 },
            ].map((item, i) => (
              <div key={item.step} className="animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 150}ms` }}>
                <Card variant="clay" className="text-center hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-8 pb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 mb-4">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="animate-fade-in-up py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Siap Mulai Menabung?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Gabung dengan ribuan pengguna yang sudah mencapai tujuan finansial mereka.
            </p>
            <Link href="/sign-up">
              <Button variant="clay" size="lg">Mulai Sekarang Gratis</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <PiggyBank className="h-7 w-7 text-teal-500" />
              <span className="font-heading text-xl font-bold text-slate-800 dark:text-white">
                Celeng<span className="text-teal-500">in</span>
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Celengin. Dibuat Trisno Sanjaya dengan ❤️ untuk semua.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
