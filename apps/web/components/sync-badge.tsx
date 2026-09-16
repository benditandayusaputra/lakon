'use client'

import { useEffect, useState } from 'react'
import { Check, CircleDashed, RefreshCw, WifiOff, type LucideIcon } from 'lucide-react'
import { onSyncState, type SyncState } from '@/features/progress/store'

const LABEL: Record<SyncState, string> = {
  menyimpan: 'menyimpan…',
  tersimpan: 'progres tersimpan',
  gagal: 'belum tersimpan, mencoba lagi',
  offline: 'offline, menunggu koneksi',
  'tanpa-akun': 'masuk untuk menyimpan progres',
}

const ICON: Record<SyncState, LucideIcon> = {
  menyimpan: RefreshCw,
  tersimpan: Check,
  gagal: CircleDashed,
  offline: WifiOff,
  'tanpa-akun': CircleDashed,
}

export function SyncBadge() {
  const [state, setState] = useState<SyncState>('tersimpan')

  useEffect(() => onSyncState(setState), [])

  const Ikon = ICON[state]
  return (
    <p className="text-teks-samar flex items-center gap-1.5 text-sm" aria-live="polite">
      <Ikon aria-hidden className="h-4 w-4 shrink-0" />
      {LABEL[state]}
    </p>
  )
}
