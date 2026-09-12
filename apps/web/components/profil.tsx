'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  Flag,
  Hand,
  ImageOff,
  LogOut,
  Repeat,
  ShieldCheck,
  Trash2,
  Trophy,
  UserRound,
} from 'lucide-react'
import { AvatarAkun } from '@/components/avatar-akun'
import { Pejalan, type Karakter } from '@/components/pejalan'
import { Logo } from '@/components/logo'
import { SyncBadge } from '@/components/sync-badge'
import { useContent } from '@/features/content/use-content'
import {
  clearAllProgress,
  listRuns,
  listSignProgress,
  pullFromServer,
  type Arah,
  type RunEntry,
  type SignProgressEntry,
} from '@/features/progress/store'
import { scenarioSignIds } from '@/features/ui/adegan'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const PERAN: { value: Arah; judul: string; icon: typeof Hand; keterangan: string }[] = [
  { value: 'deaf', judul: 'Sisi Tuli', icon: Hand, keterangan: 'memperagakan isyarat' },
  { value: 'service', judul: 'Sisi pekerja layanan', icon: Eye, keterangan: 'membaca isyarat' },
]

const perkecilFoto = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file)
  const sisi = 192
  const canvas = document.createElement('canvas')
  canvas.width = sisi
  canvas.height = sisi
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('kanvas tidak tersedia')
  const skala = Math.max(sisi / bitmap.width, sisi / bitmap.height)
  const lebar = bitmap.width * skala
  const tinggi = bitmap.height * skala
  ctx.drawImage(bitmap, (sisi - lebar) / 2, (sisi - tinggi) / 2, lebar, tinggi)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.86)
}

export function Profil({
  nama,
  email,
  peran,
  avatarAwal,
  genderAwal,
}: {
  nama: string
  email: string
  peran: string
  avatarAwal: string | null
  genderAwal: 'perempuan' | 'laki-laki' | null
}) {
  const { content } = useContent()
  const [runs, setRuns] = useState<RunEntry[]>([])
  const [signs, setSigns] = useState<SignProgressEntry[]>([])
  const [avatar, setAvatar] = useState<string | null>(avatarAwal)
  const [gender, setGender] = useState<'perempuan' | 'laki-laki' | null>(genderAwal)
  const [genderPesan, setGenderPesan] = useState<string | null>(null)
  const [fotoPesan, setFotoPesan] = useState<string | null>(null)
  const [fotoSibuk, setFotoSibuk] = useState(false)
  const [dihapus, setDihapus] = useState(false)
  const [minta, setMinta] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const muat = () => {
    void listSignProgress().then(setSigns)
    void listRuns().then(setRuns)
  }

  useEffect(() => {
    void pullFromServer()
      .catch(() => {})
      .then(muat)
  }, [])

  const scenarios = useMemo(
    () =>
      content
        ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
        : [],
    [content],
  )
  const totalIsyarat = new Set(scenarios.flatMap((scenario) => [...scenarioSignIds(scenario)])).size

  const ringkas = (arah: Arah) => {
    const runArah = runs.filter((run) => run.direction === arah)
    const dikuasai = new Set(
      signs
        .filter(
          (entry) =>
            entry.direction === arah && entry.status !== 'belum' && entry.status !== 'berlatih',
        )
        .map((entry) => entry.signId),
    )
    const perAdegan = scenarios.map((scenario) => {
      const ids = scenarioSignIds(scenario)
      const kuasai = [...ids].filter((id) => dikuasai.has(id)).length
      const sesi = runArah.filter((run) => run.scenarioId === scenario.id).length
      return { scenario, kuasai, total: ids.size, sesi }
    })
    const selesai = perAdegan.filter((item) => item.sesi > 0).length
    return { runArah, dikuasai, perAdegan, selesai }
  }

  const simpanFoto = async (file: File | undefined) => {
    if (!file) return
    setFotoSibuk(true)
    setFotoPesan(null)
    try {
      const dataUrl = await perkecilFoto(file)
      const response = await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatar: dataUrl }),
      })
      if (!response.ok) throw new Error('gagal')
      setAvatar(dataUrl)
      setFotoPesan('Foto profil tersimpan.')
    } catch {
      setFotoPesan('Foto tidak bisa dipakai. Coba berkas JPG atau PNG lain.')
    } finally {
      setFotoSibuk(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const hapusFoto = async () => {
    setFotoSibuk(true)
    try {
      await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatar: null }),
      })
      setAvatar(null)
      setFotoPesan('Foto profil dihapus.')
    } finally {
      setFotoSibuk(false)
    }
  }

  const simpanGender = async (nilai: 'perempuan' | 'laki-laki' | null) => {
    setGender(nilai)
    setGenderPesan(null)
    try {
      const response = await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gender: nilai }),
      })
      if (!response.ok) throw new Error('gagal')
      setGenderPesan('Karakter peta tersimpan.')
    } catch {
      setGenderPesan('Karakter belum tersimpan, coba lagi.')
    }
  }

  const keluar = () => {
    void fetch('/api/auth/keluar', { method: 'POST' }).then(() => window.location.assign('/'))
  }

  const hapus = () => {
    void clearAllProgress().then(() => {
      setRuns([])
      setSigns([])
      setMinta(false)
      setDihapus(true)
    })
  }

  const totalSesi = runs.length
  const totalDikuasai = new Set(
    signs
      .filter((entry) => entry.status !== 'belum' && entry.status !== 'berlatih')
      .map((entry) => entry.signId),
  ).size

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/skenario"
              className="hidden items-center gap-2.5 text-xl font-bold sm:flex"
            >
              <Logo />
              Lakon
            </Link>
            <Link
              href="/skenario"
              className="flex min-h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
            >
              <ArrowLeft aria-hidden size={15} />
              Skenario
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-halaman hidden rounded-full px-3 py-1.5 md:block">
              <SyncBadge />
            </span>
            <button
              type="button"
              onClick={keluar}
              className="border-halaman/30 hover:border-halaman/70 flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors"
              aria-label="Keluar dari akun"
            >
              <LogOut aria-hidden size={15} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-9 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:pb-12 lg:pt-12">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <AvatarAkun
                nama={nama}
                avatar={avatar}
                ukuran={96}
                className="border-sorot border-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)]"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={fotoSibuk}
                aria-label="Ganti foto profil"
                className="bg-sorot text-panggung absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#201a13] shadow-md transition-transform hover:scale-105"
              >
                <Camera aria-hidden size={16} strokeWidth={2.5} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void simpanFoto(event.currentTarget.files?.[0])}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sorot font-mono text-xs font-bold uppercase tracking-[0.2em]">
                Profil
              </p>
              <h1 className="font-display mt-1 truncate text-3xl font-semibold sm:text-4xl">
                {nama}
              </h1>
              <p className="text-halaman/70 truncate">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="border-halaman/25 bg-halaman/10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide">
                  <UserRound aria-hidden size={12} />
                  {peran}
                </span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={fotoSibuk}
                  className="border-halaman/25 hover:border-halaman/60 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors"
                >
                  <Camera aria-hidden size={13} />
                  {fotoSibuk ? 'Menyimpan…' : avatar ? 'Ganti foto' : 'Tambah foto'}
                </button>
                {avatar ? (
                  <button
                    type="button"
                    onClick={() => void hapusFoto()}
                    disabled={fotoSibuk}
                    className="border-halaman/25 hover:border-halaman/60 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    <ImageOff aria-hidden size={13} />
                    Hapus foto
                  </button>
                ) : null}
              </div>
              <p aria-live="polite" className="text-halaman/70 mt-1.5 min-h-5 text-xs">
                {fotoPesan}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 lg:w-[26rem]">
            {(
              [
                [Hand, `${totalDikuasai}/${totalIsyarat || 16}`, 'isyarat dikuasai'],
                [Repeat, String(totalSesi), 'sesi selesai'],
                [
                  Trophy,
                  String(ringkas('deaf').selesai + ringkas('service').selesai),
                  'adegan tuntas',
                ],
              ] as const
            ).map(([Ikon, nilai, label]) => (
              <div
                key={label}
                className="border-halaman/15 bg-halaman/5 flex flex-col gap-1.5 rounded-2xl border p-3 sm:p-4"
              >
                <span
                  aria-hidden
                  className="bg-sorot/15 text-sorot flex h-8 w-8 items-center justify-center rounded-lg"
                >
                  <Ikon size={16} strokeWidth={2.25} />
                </span>
                <dd className="font-display text-2xl font-semibold sm:text-3xl">{nilai}</dd>
                <dt className="text-halaman/60 text-xs leading-tight sm:text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <section>
          <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
            <Flag aria-hidden size={22} className="text-aksen" />
            Progres belajarmu
          </h2>
          <p className="text-teks-sekunder mt-1 text-sm">
            Dihitung terpisah untuk tiap peran. Adegan terbuka berurutan.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {PERAN.map((item) => {
              const data = ringkas(item.value)
              const persen =
                scenarios.length > 0 ? Math.round((data.selesai / scenarios.length) * 100) : 0
              const Ikon = item.icon
              return (
                <article
                  key={item.value}
                  className="border-border-halus bg-kartu shadow-kartu flex flex-col gap-4 rounded-3xl border p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2.5 text-lg font-bold">
                      <span
                        aria-hidden
                        className="bg-panggung text-sorot flex h-9 w-9 items-center justify-center rounded-xl"
                      >
                        <Ikon size={18} strokeWidth={2.25} />
                      </span>
                      {item.judul}
                    </p>
                    <span className="text-teks-samar font-mono text-xs">{item.keterangan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(
                      [
                        [`${data.selesai}/${scenarios.length || 5}`, 'adegan'],
                        [`${data.dikuasai.size}/${totalIsyarat || 16}`, 'isyarat'],
                        [String(data.runArah.length), 'sesi'],
                      ] as const
                    ).map(([nilai, label]) => (
                      <div key={label} className="bg-terangkat rounded-2xl px-2 py-3">
                        <p className="font-display text-2xl font-semibold">{nilai}</p>
                        <p className="text-teks-sekunder text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teks-sekunder">Perjalanan</span>
                      <span className="font-mono">{persen}%</span>
                    </div>
                    <div
                      aria-hidden
                      className="bg-terangkat mt-1.5 h-2 overflow-hidden rounded-full"
                    >
                      <span
                        className="bg-aksen block h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                  </div>
                  <ol className="flex flex-col gap-2.5">
                    {data.perAdegan.map(({ scenario, kuasai, total, sesi }, index) => {
                      const palette = paletteFor(scenario.id)
                      const persenAdegan = total > 0 ? Math.round((kuasai / total) * 100) : 0
                      return (
                        <li key={scenario.id} className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                            style={{ backgroundColor: sesi > 0 ? palette.accent : '#b9b2a6' }}
                          >
                            {sesi > 0 ? <CheckCircle2 size={14} strokeWidth={2.5} /> : index + 1}
                          </span>
                          <span className="block min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2 text-sm">
                              <span className="min-w-0 truncate font-bold">
                                {scenario.title.id}
                              </span>
                              <span className="text-teks-samar shrink-0 font-mono text-[11px]">
                                {kuasai}/{total}
                                {sesi > 0 ? ` · ${sesi}×` : ''}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className="bg-terangkat mt-1 block h-1.5 rounded-full"
                            >
                              <span
                                className="block h-full rounded-full"
                                style={{
                                  width: `${persenAdegan}%`,
                                  backgroundColor: palette.accent,
                                }}
                              />
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-border-halus bg-kartu shadow-kartu flex flex-col gap-4 rounded-3xl border p-5 sm:p-6">
          <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
            <UserRound aria-hidden size={22} className="text-aksen" />
            Karakter di peta perjalanan
          </h2>
          <p className="text-teks-sekunder text-sm">
            Karakter ini yang berjalan dari rumah ke tiap adegan di peta.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ['perempuan', 'Perempuan'],
                ['laki-laki', 'Laki-laki'],
                [null, 'Robot (tidak memberi tahu)'],
              ] as const
            ).map(([nilai, label]) => {
              const aktif = gender === nilai
              const karakter: Karakter = nilai ?? 'robot'
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => void simpanGender(nilai)}
                  aria-pressed={aktif}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-3 text-center text-xs font-bold transition-colors sm:text-sm ${
                    aktif
                      ? 'border-panggung bg-panggung text-halaman'
                      : 'border-border-halus hover:border-border-tegas'
                  }`}
                >
                  <svg aria-hidden viewBox="-24 -40 48 92" className="h-20 w-12">
                    <Pejalan karakter={karakter} berjalan={aktif} />
                  </svg>
                  {label}
                </button>
              )
            })}
          </div>
          <p aria-live="polite" className="text-teks-sekunder min-h-5 text-xs">
            {genderPesan}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="border-border-halus bg-kartu shadow-kartu flex flex-col gap-4 rounded-3xl border p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
              <ShieldCheck aria-hidden size={22} className="text-aksen" />
              Akun
            </h2>
            <p className="text-teks-sekunder text-sm">
              Video latihan tidak pernah meninggalkan perangkatmu. Progres disinkronkan ke akun ini
              saat daring.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={keluar}
                className="tombol-utama inline-flex items-center gap-2"
              >
                <LogOut aria-hidden size={16} />
                Keluar
              </button>
            </div>
          </section>

          <section className="border-border-tegas bg-kartu flex flex-col gap-3 rounded-3xl border-2 p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
              <Trash2 aria-hidden size={22} className="text-galat" />
              Hapus data belajar
            </h2>
            <p className="text-teks-sekunder max-w-prose text-sm">
              Menghapus seluruh progres isyarat dan riwayat sesi, di perangkat ini dan di server.
              Akunmu tetap ada. Tindakan ini tidak bisa dibatalkan.
            </p>
            <p aria-live="polite" className="text-sm">
              {dihapus ? (
                <span className="text-berhasil flex items-center gap-2 font-bold">
                  <CheckCircle2 aria-hidden size={16} />
                  Seluruh data belajarmu sudah dihapus.
                </span>
              ) : null}
            </p>
            {minta ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-bold">Yakin hapus seluruh data belajarmu?</p>
                <button type="button" onClick={hapus} className="tombol-utama">
                  Ya, hapus sekarang
                </button>
                <button type="button" onClick={() => setMinta(false)} className="tombol-sekunder">
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDihapus(false)
                  setMinta(true)
                }}
                className="border-border-tegas text-teks-sekunder hover:border-galat hover:text-galat flex min-h-11 items-center gap-2 self-start rounded-lg border px-4 text-sm transition-colors"
              >
                <Trash2 aria-hidden size={15} />
                Hapus seluruh data belajarku
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
