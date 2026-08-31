'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useContent } from '@/features/content/use-content'
import { paletteFor } from '@/features/ui/tokens'

export function ScenarioPicker() {
  const { content, error } = useContent()
  const [direction, setDirection] = useState<'deaf' | 'service'>('deaf')

  const scenarios = content ? Object.values(content.scenarios) : []

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Lakon
        </Link>
        <Link href="/masuk" className="underline underline-offset-4">
          Masuk
        </Link>
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
              node.task ? [node.task.deaf.sign, node.task.service.sign] : [],
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
                {signCount} isyarat · ± {scenario.estimatedMinutes} menit
              </p>
              <p className="mt-auto text-sm font-bold" style={{ color: palette.deep }}>
                Mulai sebagai {direction === 'deaf' ? 'sisi Tuli' : 'pekerja layanan'} →
              </p>
            </Link>
          )
        })}
        {!content && !error ? <p>Memuat skenario…</p> : null}
      </div>
    </main>
  )
}
