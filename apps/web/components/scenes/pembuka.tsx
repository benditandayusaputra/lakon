'use client'

import { DoorOpen, Hand, MessagesSquare, Timer } from 'lucide-react'
import type { Direction } from '@/features/scenario/engine'

export const LANGKAH_PEMBUKA: Record<Direction, readonly string[]> = {
  deaf: [
    'Pelajari tiap isyarat dari peragaan tiga sudut: depan, kanan, kiri.',
    'Peragakan sendiri di depan kamera sampai gerakanmu cocok.',
    'Jalani percakapan penuh sebagai pihak yang berisyarat.',
  ],
  service: [
    'Pelajari tiap isyarat dari peragaan tiga sudut: depan, kanan, kiri.',
    'Latih membaca isyarat: pilih makna yang benar tanpa dibantu teks.',
    'Layani lawan bicara Tuli sampai urusannya tuntas.',
  ],
}

export function PembukaAdegan({
  judul,
  peran,
  menit,
  jumlahIsyarat,
  ringkasPercakapan,
  langkah,
  aksiLabel,
  aksiLabelMembuka,
  onMulai,
  membuka,
  aksen = '#d9a521',
}: {
  judul: string
  peran: string
  menit: number
  jumlahIsyarat: number
  ringkasPercakapan: string
  langkah: readonly string[]
  aksiLabel: string
  aksiLabelMembuka: string
  onMulai: () => void
  membuka: boolean
  aksen?: string
}) {
  return (
    <div
      data-tutup={membuka}
      className="pembuka-adegan fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-10"
    >
      <section
        aria-labelledby="pembuka-judul"
        className="pembuka-kartu w-full max-w-lg rounded-3xl border border-white/15 p-6 text-[#f6efe4] shadow-2xl sm:p-8"
      >
        <p
          className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: aksen }}
        >
          <span aria-hidden className="h-px w-7" style={{ backgroundColor: aksen }} />
          Adegan siap dimulai
        </p>
        <h1 id="pembuka-judul" className="font-display mt-3 text-3xl font-semibold leading-tight">
          {judul}
        </h1>
        <p className="mt-1.5 text-[#f6efe4]/75">Kamu berperan sebagai {peran}.</p>

        <dl className="divide-white/12 border-white/12 mt-5 grid grid-cols-3 divide-x rounded-2xl border bg-white/5">
          {(
            [
              [Timer, `± ${menit}`, 'menit'],
              [Hand, String(jumlahIsyarat), 'isyarat baru'],
              [MessagesSquare, '1', ringkasPercakapan],
            ] as const
          ).map(([Ikon, nilai, label]) => (
            <div key={label} className="px-3 py-3 text-center">
              <Ikon aria-hidden size={16} className="mx-auto" style={{ color: aksen }} />
              <dd className="font-display mt-1 text-2xl font-semibold">{nilai}</dd>
              <dt className="text-[11px] leading-tight text-[#f6efe4]/60">{label}</dt>
            </div>
          ))}
        </dl>

        <ol className="mt-5 flex flex-col gap-2 text-sm">
          {langkah.map((teks, index) => (
            <li key={teks} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-[#17120d]"
                style={{ backgroundColor: aksen }}
              >
                {index + 1}
              </span>
              <span className="text-[#f6efe4]/85">{teks}</span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          autoFocus
          onClick={onMulai}
          disabled={membuka}
          className="tombol-sorot mt-6 w-full justify-center text-lg"
        >
          <DoorOpen aria-hidden className="h-5 w-5" />
          {membuka ? aksiLabelMembuka : aksiLabel}
        </button>
      </section>
    </div>
  )
}
