'use client'

import { useEffect, useState } from 'react'
import { onSyncState, pullFromServer, syncNow, type SyncState } from '@/features/progress/store'

const LABEL: Record<SyncState, string> = {
  lokal: 'tersimpan di perangkat',
  menyinkron: 'menyinkron…',
  tersinkron: 'progres tersimpan',
  offline: 'offline, tersimpan di perangkat',
  'tanpa-akun': 'tersimpan di perangkat (masuk untuk sinkron)',
}

const ICON: Record<SyncState, string> = {
  lokal: '◌',
  menyinkron: '↻',
  tersinkron: '✓',
  offline: '⇣',
  'tanpa-akun': '◌',
}

export function SyncBadge() {
  const [state, setState] = useState<SyncState>('lokal')

  useEffect(() => {
    const unsubscribe = onSyncState(setState)
    void pullFromServer().then(() => syncNow())
    return unsubscribe
  }, [])

  return (
    <p className="text-teks-samar flex items-center gap-1.5 text-sm" aria-live="polite">
      <span aria-hidden>{ICON[state]}</span>
      {LABEL[state]}
    </p>
  )
}
