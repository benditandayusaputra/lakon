'use client'

import { useEffect, useState } from 'react'
import { Check, CircleDashed, RefreshCw, WifiOff, type LucideIcon } from 'lucide-react'
import { onSyncState, pullFromServer, syncNow, type SyncState } from '@/features/progress/store'

const LABEL: Record<SyncState, string> = {
  lokal: 'tersimpan di perangkat',
  menyinkron: 'menyinkron…',
  tersinkron: 'progres tersimpan',
  offline: 'offline, tersimpan di perangkat',
  'tanpa-akun': 'tersimpan di perangkat (masuk untuk sinkron)',
}

const ICON: Record<SyncState, LucideIcon> = {
  lokal: CircleDashed,
  menyinkron: RefreshCw,
  tersinkron: Check,
  offline: WifiOff,
  'tanpa-akun': CircleDashed,
}

export function SyncBadge() {
  const [state, setState] = useState<SyncState>('lokal')

  useEffect(() => {
    const unsubscribe = onSyncState(setState)
    void pullFromServer().then(() => syncNow())
    return unsubscribe
  }, [])

  const Ikon = ICON[state]
  return (
    <p className="text-teks-samar flex items-center gap-1.5 text-sm" aria-live="polite">
      <Ikon aria-hidden className="h-4 w-4 shrink-0" />
      {LABEL[state]}
    </p>
  )
}
