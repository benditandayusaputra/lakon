'use client'

import { useMemo, useState } from 'react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { UmpanJawab } from '@/components/umpan-jawab'

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
  const [benar, setBenar] = useState<boolean | null>(null)

  const pilihan = useMemo(() => {
    const lain = kandidat.filter((id) => id !== signId)
    const benih = [...signId].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 7)
    return acak([signId, ...acak(lain, benih).slice(0, 3)], benih + 3)
  }, [kandidat, signId])

  const pilih = (id: string) => {
    if (id !== signId) onGagal()
    setBenar(id === signId)
  }

  const tutupLalu = (lanjut: () => void) => () => {
    setBenar(null)
    lanjut()
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
        {pilihan.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => pilih(id)}
            className="tombol-sekunder justify-start text-left capitalize"
          >
            {rapikan(id)}
          </button>
        ))}
      </div>
      <p className="text-teks-sekunder text-sm">
        Perhatikan bentuk tangan, tempat, dan arah geraknya.
      </p>

      {benar === null ? null : (
        <UmpanJawab
          benar={benar}
          jawaban={rapikan(signId)}
          onLanjut={tutupLalu(onLulus)}
          onCobaLagi={() => setBenar(null)}
          onLewati={tutupLalu(onLewati)}
        />
      )}
    </div>
  )
}
