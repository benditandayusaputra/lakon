'use client'

export type Arah = 'deaf' | 'service'

export type SignProgressEntry = {
  key: string
  signId: string
  direction: Arah
  status: 'belum' | 'berlatih' | 'dikuasai' | 'dinilai-sendiri'
  attempts: number
  updatedAt: number
  synced: boolean
}

export type RunEntry = {
  id: string
  scenarioId: string
  direction: Arah
  durationMs: number
  mastered: string[]
  needsRepeat: string[]
  completedAt: number
  synced: boolean
}

export type SyncState = 'lokal' | 'menyinkron' | 'tersinkron' | 'offline' | 'tanpa-akun'

const DB_NAME = 'lakon-progress'

const kunciSign = (direction: Arah, signId: string) => `${direction}:${signId}`

export type CheckpointEntry = {
  key: string
  scenarioId: string
  direction: Arah
  state: string
  updatedAt: number
}

const kunciCheckpoint = (direction: Arah, scenarioId: string) => `${direction}:${scenarioId}`

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3)
    request.onupgradeneeded = (event) => {
      const db = request.result
      if (event.oldVersion < 1) {
        db.createObjectStore('runs', { keyPath: 'id' })
      }
      if (event.oldVersion < 3 && !db.objectStoreNames.contains('checkpoints')) {
        db.createObjectStore('checkpoints', { keyPath: 'key' })
      }
      if (event.oldVersion < 1) {
        db.createObjectStore('signs', { keyPath: 'key' })
        return
      }
      const upgrade = request.transaction!
      const lama = upgrade.objectStore('signs')
      const baca = lama.getAll() as IDBRequest<Record<string, unknown>[]>
      baca.onsuccess = () => {
        const entries = baca.result
        db.deleteObjectStore('signs')
        const baru = db.createObjectStore('signs', { keyPath: 'key' })
        for (const entry of entries) {
          const direction = (entry.direction as Arah | undefined) ?? 'deaf'
          const signId = String(entry.signId)
          baru.put({ ...entry, direction, key: kunciSign(direction, signId) })
        }
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB gagal'))
  })

const tx = async <T>(
  storeName: 'signs' | 'runs' | 'checkpoints',
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const request = work(transaction.objectStore(storeName))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB gagal'))
    transaction.oncomplete = () => db.close()
  })
}

export const listSignProgress = async (direction?: Arah) => {
  const semua = await tx<SignProgressEntry[]>(
    'signs',
    'readonly',
    (store) => store.getAll() as IDBRequest<SignProgressEntry[]>,
  )
  return direction ? semua.filter((entry) => entry.direction === direction) : semua
}

export const listRuns = () =>
  tx<RunEntry[]>('runs', 'readonly', (store) => store.getAll() as IDBRequest<RunEntry[]>)

export const saveSignProgress = async (
  entry: Omit<SignProgressEntry, 'key' | 'updatedAt' | 'synced'>,
): Promise<void> => {
  await tx('signs', 'readwrite', (store) =>
    store.put({
      ...entry,
      key: kunciSign(entry.direction, entry.signId),
      updatedAt: Date.now(),
      synced: false,
    }),
  )
  scheduleSync()
}

export const saveRun = async (run: Omit<RunEntry, 'id' | 'synced'>): Promise<void> => {
  await tx('runs', 'readwrite', (store) =>
    store.put({
      ...run,
      id: `${run.completedAt}-${Math.random().toString(36).slice(2, 8)}`,
      synced: false,
    }),
  )
  scheduleSync()
}

export const bacaCheckpoint = async <T>(
  scenarioId: string,
  direction: Arah,
): Promise<{ state: T; updatedAt: number } | null> => {
  const key = kunciCheckpoint(direction, scenarioId)
  const lokal = await tx<CheckpointEntry | undefined>(
    'checkpoints',
    'readonly',
    (store) => store.get(key) as IDBRequest<CheckpointEntry | undefined>,
  ).catch(() => undefined)
  let server: { state: string; updatedAt: number } | null = null
  try {
    const response = await fetch(
      `/api/checkpoint?scenarioId=${encodeURIComponent(scenarioId)}&direction=${direction}`,
    )
    if (response.ok) {
      const data = (await response.json()) as {
        checkpoint: { state: string; updatedAt: number } | null
      }
      server = data.checkpoint
    }
  } catch {
    server = null
  }
  const pilih = server && (!lokal || server.updatedAt > lokal.updatedAt) ? server : lokal
  if (!pilih) return null
  try {
    return { state: JSON.parse(pilih.state) as T, updatedAt: pilih.updatedAt }
  } catch {
    return null
  }
}

let checkpointTimer: number | null = null
let checkpointTertunda: CheckpointEntry | null = null

export const tulisCheckpoint = async (
  scenarioId: string,
  direction: Arah,
  state: unknown,
): Promise<void> => {
  const entry: CheckpointEntry = {
    key: kunciCheckpoint(direction, scenarioId),
    scenarioId,
    direction,
    state: JSON.stringify(state),
    updatedAt: Date.now(),
  }
  await tx('checkpoints', 'readwrite', (store) => store.put(entry))
  checkpointTertunda = entry
  if (checkpointTimer !== null) window.clearTimeout(checkpointTimer)
  checkpointTimer = window.setTimeout(() => {
    checkpointTimer = null
    const kirim = checkpointTertunda
    checkpointTertunda = null
    if (!kirim) return
    void fetch('/api/checkpoint', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scenarioId: kirim.scenarioId,
        direction: kirim.direction,
        state: kirim.state,
        updatedAt: kirim.updatedAt,
      }),
    }).catch(() => {})
  }, 1200)
}

export const hapusCheckpoint = async (scenarioId: string, direction: Arah): Promise<void> => {
  if (checkpointTimer !== null) {
    window.clearTimeout(checkpointTimer)
    checkpointTimer = null
    checkpointTertunda = null
  }
  await tx('checkpoints', 'readwrite', (store) =>
    store.delete(kunciCheckpoint(direction, scenarioId)),
  )
  await fetch('/api/checkpoint', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenarioId, direction }),
  }).catch(() => {})
}

export const clearAllProgress = async () => {
  await tx('signs', 'readwrite', (store) => store.clear())
  await tx('runs', 'readwrite', (store) => store.clear())
  await tx('checkpoints', 'readwrite', (store) => store.clear()).catch(() => {})
  try {
    await fetch('/api/progress', { method: 'DELETE' })
  } catch {
    return
  }
}

type SyncListener = (state: SyncState) => void
const listeners = new Set<SyncListener>()
let currentState: SyncState = 'lokal'
let syncTimer: number | null = null

const setState = (state: SyncState) => {
  currentState = state
  for (const listener of listeners) listener(state)
}

export const onSyncState = (listener: SyncListener) => {
  listeners.add(listener)
  listener(currentState)
  return () => {
    listeners.delete(listener)
  }
}

const markSynced = async (signs: SignProgressEntry[], runs: RunEntry[]) => {
  for (const sign of signs) {
    await tx('signs', 'readwrite', (store) => store.put({ ...sign, synced: true }))
  }
  for (const run of runs) {
    await tx('runs', 'readwrite', (store) => store.put({ ...run, synced: true }))
  }
}

export const syncNow = async (): Promise<void> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setState('offline')
    return
  }
  const signs = (await listSignProgress()).filter((entry) => !entry.synced)
  const runs = (await listRuns()).filter((entry) => !entry.synced)
  if (signs.length === 0 && runs.length === 0) {
    if (currentState === 'lokal' || currentState === 'menyinkron') setState('tersinkron')
    return
  }
  setState('menyinkron')
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        signs: signs.map(({ synced: _synced, key: _key, ...entry }) => entry),
        runs: runs.map(({ synced: _synced, id: _id, ...run }) => run),
      }),
    })
    if (response.status === 401) {
      setState('tanpa-akun')
      return
    }
    if (!response.ok) {
      setState('lokal')
      return
    }
    await markSynced(signs, runs)
    setState('tersinkron')
  } catch {
    setState(navigator.onLine ? 'lokal' : 'offline')
  }
}

const scheduleSync = () => {
  setState('lokal')
  if (syncTimer !== null) window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    syncTimer = null
    void syncNow()
  }, 1500)
}

export const pullFromServer = async (): Promise<void> => {
  try {
    const response = await fetch('/api/progress')
    if (!response.ok) return
    const data = (await response.json()) as {
      signs: {
        signId: string
        direction?: Arah
        status: SignProgressEntry['status']
        attempts: number
        updatedAt: number
      }[]
    }
    const local = new Map((await listSignProgress()).map((entry) => [entry.key, entry]))
    for (const remote of data.signs) {
      const direction = remote.direction ?? 'deaf'
      const key = kunciSign(direction, remote.signId)
      const existing = local.get(key)
      if (!existing || existing.updatedAt < remote.updatedAt) {
        await tx('signs', 'readwrite', (store) =>
          store.put({ ...remote, direction, key, synced: true }),
        )
      }
    }
  } catch {
    return
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void syncNow())
  window.addEventListener('offline', () => setState('offline'))
}
