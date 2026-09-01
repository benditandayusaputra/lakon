'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useContent } from '@/features/content/use-content'
import {
  clearAllProgress,
  listRuns,
  listSignProgress,
  pullFromServer,
} from '@/features/progress/store'
import { SyncBadge } from '@/components/sync-badge'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

export function ScenarioPicker() {
  const { content, error } = useContent()
  const [direction, setDirection] = useState<'deaf' | 'service'>('deaf')
  const [runsByScenario, setRunsByScenario] = useState<Record<string, number>>({})
  const [masteredCount, setMasteredCount] = useState(0)
  const [account, setAccount] = useState<{ displayName: string } | null>(null)
  const [wiped, setWiped] = useState(false)

  useEffect(() => {
    void pullFromServer()
      .catch(() => {})
      .then(() => {
        void listRuns().then((runs) => {
          const counts: Record<string, number> = {}
          for (const run of runs) counts[run.scenarioId] = (counts[run.scenarioId] ?? 0) + 1
          setRunsByScenario(counts)
        })
        void listSignProgress().then((entries) =>
          setMasteredCount(
            entries.filter((entry) => entry.status !== 'belum' && entry.status !== 'berlatih')
              .length,
          ),
        )
      })
    void fetch('/api/auth/saya')
      .then((response) => response.json())
      .then((data: { user: { displayName: string } | null }) => setAccount(data.user))
      .catch(() => {})
  }, [])

  const wipe = () => {
    if (!window.confirm('Hapus seluruh data belajarmu di perangkat ini dan di server?')) return
    void clearAllProgress().then(() => {
      setRunsByScenario({})
      setMasteredCount(0)
      setWiped(true)
    })
  }

  const scenarios = content
    ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
    : []

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Lakon
        </Link>
        <div className="flex items-center gap-4">
          <SyncBadge />
          {account ? (
            <>
              <span className="font-bold">{account.displayName}</span>
              <button
                type="button"
                onClick={() => {
                  void fetch('/api/auth/keluar', { method: 'POST' }).then(() => setAccount(null))
                }}
                className="underline underline-offset-4"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link href="/masuk" className="underline underline-offset-4">
              Masuk
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Pilih skenario</h1>
        <p className="text-teks-sekunder max-w-prose">
          Satu percakapan bisa dijalani dari dua sisi. Pilih peranmu dulu.
        </p>
      </div>

      <fieldset className="border-border-halus flex flex-col gap-3 rounded-3xl border bg-white p-5">
        <legend className="sr-only">Arah peran</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              [
                'deaf',
                'Sisi Tuli',
                'Kamu yang berisyarat. Belajar menjalani transaksi: memesan, bertanya, membayar.',
              ],
              [
                'service',
                'Sisi pekerja layanan',
                'Kamu yang membaca isyarat. Belajar melayani pelanggan Tuli dengan benar.',
              ],
            ] as const
          ).map(([value, title, body]) => (
            <label
              key={value}
              className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 ${
                direction === value ? 'border-info bg-terangkat' : 'border-border-halus'
              }`}
            >
              <span className="flex items-center gap-2 font-bold">
                <input
                  type="radio"
                  name="arah"
                  value={value}
                  checked={direction === value}
                  onChange={() => setDirection(value)}
                />
                {title}
              </span>
              <span className="text-teks-sekunder text-sm">{body}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p role="alert">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const palette = paletteFor(scenario.id)
          const signCount = new Set(
            scenario.nodes.flatMap((node) =>
              node.task
                  ? [node.task.deaf, node.task.service].flatMap((task) =>
                      task.type === 'point' ? [] : [task.sign],
                    )
                  : [],
            ),
          ).size
          return (
            <Link
              key={scenario.id}
              href={`/skenario/${scenario.id}?arah=${direction}`}
              className={`${palette.kelas} flex flex-col gap-3 rounded-3xl p-6 transition-transform hover:-translate-y-0.5`}
              style={{ backgroundColor: palette.tint }}
            >
              <div
                aria-hidden
                className="h-2 w-16 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />
              <p className="text-xl font-bold" style={{ color: palette.deep }}>
                {scenario.title.id}
              </p>
              <p className="text-sm" style={{ color: palette.deep }}>
                {signCount} isyarat, ± {scenario.estimatedMinutes} menit
              </p>
              {runsByScenario[scenario.id] ? (
                <p className="text-sm" style={{ color: palette.deep }}>
                  ✓ pernah diselesaikan {runsByScenario[scenario.id]}×
                </p>
              ) : null}
              <p className="mt-auto text-sm font-bold" style={{ color: palette.deep }}>
                Mulai sebagai {direction === 'deaf' ? 'sisi Tuli' : 'pekerja layanan'} →
              </p>
            </Link>
          )
        })}
        {!content && !error ? <p>Memuat skenario…</p> : null}
      </div>

      <footer className="border-border-halus flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-sm">
        <p className="text-teks-sekunder">
          {wiped
            ? 'Seluruh data belajarmu sudah dihapus.'
            : `Isyarat yang sudah dipelajari: ${masteredCount}`}
        </p>
        <button type="button" onClick={wipe} className="tombol-sekunder text-sm">
          Hapus seluruh data belajarku
        </button>
      </footer>
    </main>
  )
}
