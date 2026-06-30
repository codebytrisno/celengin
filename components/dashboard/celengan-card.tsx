'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah, calcProgress, getStatus } from '@/lib/utils'
import { ArrowRight, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { deleteCelengan } from '@/lib/db'
import { CelenganIconRenderer } from '@/lib/celengan-icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface CelenganCardProps {
  id: string
  title: string
  target: number
  collected: number
  icon?: string
  onDelete?: () => void
}

export function CelenganCard({ id, title, target, collected, icon = 'wallet', onDelete }: CelenganCardProps) {
  const progress = calcProgress(collected, target)
  const status = getStatus(collected, target)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  function handleDelete() {
    setDeleting(true)
    setMenuOpen(false)

    deleteCelengan(id)

    setShowDeleteDialog(false)
    if (onDelete) onDelete()
  }

  function toggleMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  return (
    <>
    <Card variant="default" className={`shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative dark:border-slate-700 dark:bg-slate-800 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link href={`/celengan?id=${id}`} className="block">
        <CardContent className="p-5 pt-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-700 grid place-items-center clay-3d-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0">
                <CelenganIconRenderer name={icon} className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {title}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  progress >= 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                }`}>
                  {status}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }}
                  />
                  
                  <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-scale-in">
                    <button
                      onClick={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/celengan/edit?id=${id}`)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        setMenuOpen(false)
                        setShowDeleteDialog(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full text-left transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatRupiah(collected)}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Target {formatRupiah(target)}</span>
            </div>
            <Progress value={collected} max={target} showLabel={false} size="md" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{progress}% Tercapai</span>
            <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
              Lihat Detail <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </div>
        </CardContent>
      </Link>
      
      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      )}
    </Card>

    <ConfirmDialog
      open={showDeleteDialog}
      title="Hapus Celengan?"
      description={`Celengan "${title}" dan semua transaksinya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
      confirmLabel="Ya, Hapus"
      cancelLabel="Batal"
      variant="danger"
      loading={deleting}
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteDialog(false)}
    />
  </>
  )
}
