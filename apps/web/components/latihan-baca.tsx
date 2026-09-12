'use client'

import { Check, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'

const rapikan = (id: string) => id.replace(/-/g, ' ')

const acak = <T,>(daftar: readonly T[], benih: number): T[] => {
  const hasil = [...daftar]
  let nilai = benih
  for (let i = hasil.length - 1; i > 0; i--) {
    nilai = (nilai * 1103515245 + 12345) % 2147483648
    const j = nilai % (i + 1)
    ;[hasil[i], hasil[j]] = [hasil[j]!, hasil[i]!]
  }
  return hasil
}

export const BUKA_JAWABAN_SETELAH = 3

export function LatihanBaca({
  compiled,
  sign,
  signId,
  kandidat,
  onLulus,
  onGagal,
  onLewati,
}: {
  compiled: CompiledSign | null
  sign?: Sign
  signId: string
  kandidat: readonly string[]
  onLulus: () => void
  onGagal: () => void
  onLewati: () => void
}) {
  const [dipilih, setDipilih] = useState<string | null>(null)
  const [gagal, setGagal] = useState(0)

  useEffect(() => {
    setDipilih(null)
    setGagal(0)
  }, [signId])

  const pilihan = useMemo(() => {
    const lain = kandidat.filter((id) => id !== signId)
    const benih = [...signId].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 7)
    return acak([signId, ...acak(lain, benih).slice(0, 3)], benih + 3)
  }, [kandidat, signId])

  const benar = dipilih === signId
  const bukaJawaban = gagal >= BUKA_JAWABAN_SETELAH

  const pilih = (id: string) => {
    if (benar) return
    setDipilih(id)
    if (id === signId) {
      onLulus()
      return
    }
    setGagal((jumlah) => jumlah + 1)
    onGagal()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zona-tenang zona-tenang-gradasi relative w-full overflow-hidden rounded-2xl">
        {compiled ? (
          <AvatarStage compiled={compiled} sign={sign} showControls className="sm:h-[54vh]" />
        ) : (
          <p className="p-8 text-center">
            Peragaan isyarat ini belum tersedia. Tebak dari konteks percakapan.
          </p>
        )}
      </div>

      <p className="font-bold">Pelanggan berisyarat. Apa maknanya?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {pilihan.map((id) => {
          const terpilih = dipilih === id
          const inibenar = id === signId
          const tandai = terpilih || (bukaJawaban && inibenar)
          return (
            <button
              key={id}
              type="button"
              onClick={() => pilih(id)}
              disabled={benar}
              aria-pressed={terpilih}
              className={`tombol-sekunder justify-start text-left capitalize ${
                tandai
                  ? inibenar
                    ? 'border-berhasil text-berhasil border-2'
                    : 'border-ulang text-ulang border-2'
                  : ''
              }`}
            >
              {tandai ? (
                inibenar ? (
                  <Check
                    aria-hidden
                    className="mr-1.5 inline-block h-[1em] w-[1em] align-text-bottom"
                  />
                ) : (
                  <RotateCcw
                    aria-hidden
                    className="mr-1.5 inline-block h-[1em] w-[1em] align-text-bottom"
                  />
                )
              ) : null}
              {rapikan(id)}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="flex min-h-14 flex-col gap-3">
        {benar ? (
          <p className="text-berhasil text-lg font-bold">
            <Check aria-hidden className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom" />
            Benar, itu isyarat {rapikan(signId)}.
          </p>
        ) : dipilih ? (
          <div className="border-ulang flex flex-col gap-2 rounded-xl border-2 p-4">
            <p className="text-ulang font-bold">
              <RotateCcw
                aria-hidden
                className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
              />
              Belum tepat. Putar ulang peragaan, coba dari sudut lain.
            </p>
            {bukaJawaban ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm">
                  Jawabannya <strong className="capitalize">{rapikan(signId)}</strong>.
                </p>
                <button type="button" onClick={onLewati} className="tombol-utama">
                  Sudah paham, lanjut
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-teks-sekunder text-sm">
            Perhatikan bentuk tangan, tempat, dan arah geraknya. Tiga sudut tersedia di atas.
          </p>
        )}
      </div>
    </div>
  )
}
