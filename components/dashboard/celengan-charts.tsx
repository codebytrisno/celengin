'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import type { Transaction } from '@/lib/supabase/types'

interface CelenganChartsProps {
  collected: number
  target: number
  transactions: Transaction[]
}

export function CelenganCharts({ collected, target, transactions }: CelenganChartsProps) {
  const remaining = Math.max(0, target - collected)
  const progress = Math.min(100, (collected / target) * 100)

  // Data untuk pie chart
  const pieData = [
    { name: 'Terkumpul', value: collected },
    { name: 'Sisa Target', value: remaining },
  ]

  // Data untuk bar chart (transaksi per hari, last 7 days)
  const getLast7Days = () => {
    const data: { [key: string]: number } = {}
    const today = new Date()

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
      data[key] = 0
    }

    // Sum transactions per day
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date)
      const key = txDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
      if (key in data) {
        data[key] += tx.amount
      }
    })

    return Object.entries(data).map(([date, amount]) => ({
      date,
      amount,
    }))
  }

  const barData = getLast7Days()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
      {/* Pie Chart - Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-heading font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 text-sm sm:text-base">Progress Penabungan</h3>
        
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill="#14b8a6" />
                <Cell fill="#e2e8f0" />
              </Pie>
              <Tooltip 
                formatter={(value) => formatRupiah(value as number)}
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-teal-500" />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Terkumpul</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-teal-600">{formatRupiah(collected)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300" />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Sisa Target</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">{formatRupiah(remaining)}</span>
          </div>
          <div className="pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden min-w-[80px] sm:min-w-[100px]">
                <div 
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-teal-600 min-w-[36px] sm:min-w-[40px]">{progress.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - Transaksi 7 Hari */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-heading font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 text-sm sm:text-base">Aktivitas 7 Hari Terakhir</h3>
        
        {barData.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                width={40}
              />
              <Tooltip 
                formatter={(value) => formatRupiah(value as number)}
                labelFormatter={(label) => `Tanggal: ${label}`}
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#14b8a6" 
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Belum ada transaksi dalam 7 hari terakhir</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
