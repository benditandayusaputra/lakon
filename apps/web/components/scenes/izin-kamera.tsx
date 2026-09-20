'use client'

import { useState } from 'react'
import { Camera, CameraOff, RotateCcw, ShieldCheck } from 'lucide-react'
import { nyalakanKamera } from '@/features/practice/capture'

export function IzinKamera({
  onLanjut,
  aksen = '#d9a521',
  lanjutan,
  onMulaiUlang,
  tanpaKamera = false,
}: {
  onLanjut: () => void
  aksen?: string
  lanjutan?: string
  onMulaiUlang?: () => void
  tanpaKamera?: boolean
}) {
  const [sibuk, setSibuk] = useState(false)
  const [pesan, setPesan] = useState<string | null>(null)

  const nyalakan = async () => {
    setSibuk(true)
    const hasil = await nyalakanKamera()
    setSibuk(false)
    if (hasil.ok) {
      onLanjut()
      return
    }
    setPesan(
      hasil.reason === 'denied'
        ? 'Izin kamera ditolak. Kamu tetap bisa berlatih dengan membandingkan sendiri.'
        : hasil.reason === 'no-camera'
          ? 'Kamera tidak ditemukan di perangkat ini.'
          : 'Kamera tidak bisa dipakai di peramban ini.',
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <section
        aria-labelledby="izin-kamera-judul"
        className="kk-muncul rounded-3xl border border-white/15 bg-[#17120d]/90 p-6 text-[#f6efe4] shadow-2xl backdrop-blur sm:p-8"
      >
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${aksen}33`, color: aksen }}
        >
          {tanpaKamera ? (
            <RotateCcw size={28} strokeWidth={2} />
          ) : (
            <Camera size={28} strokeWidth={2} />
          )}
        </span>
        <h1 id="izin-kamera-judul" className="font-display mt-4 text-2xl font-semibold sm:text-3xl">
          {lanjutan
            ? 'Lanjutkan dari checkpoint'
            : tanpaKamera
              ? 'Siap memulai adegan?'
              : 'Nyalakan kamera untuk berlatih'}
        </h1>
        {lanjutan ? (
          <p
            className="mt-2 rounded-xl px-3 py-2 text-sm font-bold"
            style={{ backgroundColor: `${aksen}22`, color: aksen }}
          >
            Kamu berhenti di {lanjutan}. Kemajuanmu tersimpan.
          </p>
        ) : null}
        {tanpaKamera ? (
          <p className="mt-2 text-[#f6efe4]/80">
            Di sisi pekerja layanan kamu membaca isyarat, jadi kamera tidak diperlukan.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[#f6efe4]/80">
              Kamera dipakai untuk memeriksa gerakan tanganmu di tiap isyarat. Sekali dinyalakan,
              kamera tetap menyala sampai adegan selesai, jadi kamu tinggal menekan tombol mulai.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#f6efe4]/70">
              <ShieldCheck aria-hidden size={16} style={{ color: aksen }} />
              Video tidak pernah keluar dari perangkatmu.
            </p>
          </>
        )}
        {pesan ? (
          <p role="alert" className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">
            {pesan}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {tanpaKamera ? null : (
            <button
              type="button"
              onClick={() => void nyalakan()}
              disabled={sibuk}
              className="tombol-sorot justify-center"
            >
              <Camera aria-hidden className="h-5 w-5" />
              {sibuk ? 'Meminta izin…' : 'Nyalakan kamera'}
            </button>
          )}
          <button
            type="button"
            onClick={onLanjut}
            className={
              tanpaKamera ? 'tombol-sorot justify-center' : 'tombol-garis-terang justify-center'
            }
          >
            {tanpaKamera ? null : <CameraOff aria-hidden className="mr-2 h-5 w-5" />}
            {tanpaKamera ? (lanjutan ? 'Lanjutkan adegan' : 'Mulai adegan') : 'Lanjut tanpa kamera'}
          </button>
        </div>
        {lanjutan && onMulaiUlang ? (
          <button
            type="button"
            onClick={onMulaiUlang}
            className="mt-4 flex min-h-11 items-center gap-2 text-sm font-bold text-[#f6efe4]/70 underline-offset-4 hover:underline"
          >
            <RotateCcw aria-hidden size={15} />
            Mulai adegan dari awal
          </button>
        ) : null}
      </section>
    </div>
  )
}
