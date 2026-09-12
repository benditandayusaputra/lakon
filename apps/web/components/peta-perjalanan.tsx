'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Flag,
  FlagTriangleRight,
  Hand,
  Lock,
  Star,
  TreeDeciduous,
  TreePine,
  type LucideIcon,
} from 'lucide-react'
import { Pejalan, type Karakter } from '@/components/pejalan'
import { SCENE_ICONS } from '@/features/ui/adegan'
import { paletteFor } from '@/features/ui/tokens'

export type SimpulPeta = {
  id: string
  judul: string
  suasana: string
  isyarat: number
  menit: number
  href: string
  status?: 'buka' | 'kunci' | 'selesai'
  persen?: number
  keterangan?: string
}

export type TeksPeta = {
  adegan: string
  mulai: string
  ulangi: string
  terkunci: string
  isyarat: string
  menit: string
  mulaiDiSini: string
  garisAkhir: string
  kamuDiSini?: string
  rumah?: string
}

const POSISI_X = [22, 74, 24, 76, 30] as const
const RUMAH_X = 60
const durasiUntuk = (langkah: number) => Math.min(3200, Math.max(700, langkah * 1000))
const DEKOR: { Icon: LucideIcon; x: number; y: number; size: number; kecil?: boolean }[] = [
  { Icon: TreeDeciduous, x: 8, y: 10, size: 28 },
  { Icon: TreePine, x: 6, y: 44, size: 26 },
  { Icon: TreeDeciduous, x: 90, y: 74, size: 26 },
  { Icon: TreePine, x: 93, y: 32, size: 24, kecil: true },
  { Icon: TreeDeciduous, x: 50, y: 60, size: 22, kecil: true },
]

function Bangunan({
  id,
  x,
  y,
  skala = 1,
}: {
  id: string | 'rumah'
  x: number
  y: number
  skala?: number
}) {
  const palette = id === 'rumah' ? null : paletteFor(id)
  const atas = palette ? palette.tint : '#fbe9c9'
  const kiri = palette ? palette.ambient : '#e4b46f'
  const kanan = palette ? palette.accent : '#b9803b'
  const atap = palette ? palette.deep : '#8a3b2d'
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`} aria-hidden>
      <ellipse cx={0} cy={26} rx={40} ry={9} fill="rgb(0 0 0 / 0.18)" />
      <polygon points="-30,-6 0,-20 30,-6 0,8" fill={atas} />
      <polygon points="-30,-6 0,8 0,30 -30,16" fill={kiri} />
      <polygon points="30,-6 0,8 0,30 30,16" fill={kanan} />
      {id === 'rumah' ? (
        <>
          <polygon points="-30,-6 0,-20 30,-6 0,-34" fill={atap} opacity={0.95} />
          <polygon points="0,-34 30,-6 30,-2 0,-30" fill="#6e2f24" />
          <rect x={4} y={10} width={9} height={14} rx={1.5} fill="#5b3a1e" />
          <rect x={-22} y={2} width={8} height={7} rx={1} fill="#fff3d6" />
        </>
      ) : (
        <>
          <polygon points="-30,-6 0,-20 30,-6 0,8" fill={atap} opacity={0.18} />
          <rect x={-24} y={2} width={7} height={6} rx={1} fill="#fff8ea" opacity={0.9} />
          <rect x={-13} y={7} width={7} height={6} rx={1} fill="#fff8ea" opacity={0.9} />
          <rect x={6} y={7} width={7} height={6} rx={1} fill="#fff8ea" opacity={0.9} />
          <rect x={17} y={2} width={7} height={6} rx={1} fill="#fff8ea" opacity={0.9} />
          <rect x={-8} y={-16} width={16} height={4} rx={1} fill={atap} />
        </>
      )}
    </g>
  )
}

export function PetaPerjalanan({
  simpul,
  teks,
  posisiPemain,
  karakter = 'robot',
  onSampai,
}: {
  simpul: SimpulPeta[]
  teks: TeksPeta
  posisiPemain?: number
  karakter?: Karakter
  onSampai?: (item: SimpulPeta, index: number) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [lebar, setLebar] = useState(0)
  const [tujuan, setTujuan] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setLebar(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const ponsel = lebar < 640
  const tinggiBaris = ponsel ? 276 : 208
  const atas = 250
  const bawah = ponsel ? 330 : 150
  const tinggi = atas + Math.max(0, simpul.length - 1) * tinggiBaris + bawah

  const rumah = { x: (RUMAH_X / 100) * lebar, y: 96 }
  const titik = simpul.map((_, index) => ({
    x: ((POSISI_X[index % POSISI_X.length] ?? 50) / 100) * lebar,
    y: atas + index * tinggiBaris,
  }))
  const akhir = {
    x: lebar * (simpul.length % 2 === 0 ? 0.26 : 0.72),
    y: tinggi - (ponsel ? 44 : 56),
  }
  const jalur = [rumah, ...titik, akhir]
  const ruas = (titikJalur: { x: number; y: number }[]) =>
    titikJalur
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const q = titikJalur[i - 1]!
        const tarik = (p.y - q.y) * 0.55
        return `C ${q.x} ${q.y + tarik} ${p.x} ${p.y - tarik} ${p.x} ${p.y}`
      })
      .join(' ')
  const d = ruas(jalur)

  const pemain =
    typeof posisiPemain === 'number'
      ? Math.max(-1, Math.min(posisiPemain, simpul.length - 1))
      : null
  const posisi = (index: number) => (index < 0 ? rumah : titik[index]!)
  const asal = pemain !== null ? posisi(pemain) : undefined
  const langkah = tujuan !== null && pemain !== null ? Math.abs(tujuan - pemain) : 0
  const durasi = durasiUntuk(langkah)
  const jalurPemain =
    tujuan !== null && pemain !== null && langkah > 0
      ? ruas(
          tujuan > pemain
            ? jalur.slice(pemain + 1, tujuan + 2)
            : jalur.slice(tujuan + 1, pemain + 2).reverse(),
        )
      : null
  const hadapPemain: 'kiri' | 'kanan' =
    tujuan !== null && pemain !== null && posisi(tujuan).x < posisi(pemain).x ? 'kiri' : 'kanan'

  const pilih = (item: SimpulPeta, index: number) => {
    if (!onSampai || tujuan !== null) return
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTujuan(index)
    if (cepat || pemain === null || index === pemain) {
      timer.current = setTimeout(() => onSampai(item, index), cepat ? 0 : 400)
      return
    }
    timer.current = setTimeout(() => onSampai(item, index), durasiUntuk(Math.abs(index - pemain)))
  }

  return (
    <div
      ref={ref}
      className="peta-jalan border-border-halus relative w-full overflow-hidden rounded-3xl border shadow-inner"
      style={{ height: tinggi }}
    >
      {lebar > 0 && titik.length > 0 ? (
        <svg
          aria-hidden
          className="absolute inset-0"
          width={lebar}
          height={tinggi}
          viewBox={`0 0 ${lebar} ${tinggi}`}
        >
          <path
            d={d}
            fill="none"
            stroke="rgb(0 0 0 / 0.22)"
            strokeWidth={ponsel ? 36 : 44}
            strokeLinecap="round"
            transform="translate(0 7)"
          />
          <path
            d={d}
            fill="none"
            stroke="#d3cfc2"
            strokeWidth={ponsel ? 36 : 44}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#2f333a"
            strokeWidth={ponsel ? 26 : 32}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#4a4f57"
            strokeWidth={ponsel ? 22 : 27}
            strokeLinecap="round"
            transform="translate(0 -2)"
          />
          <path
            d={d}
            fill="none"
            stroke="#f2c94c"
            strokeWidth={3}
            strokeDasharray="14 12"
            strokeLinecap="round"
          />
          <Bangunan
            id="rumah"
            x={rumah.x + (ponsel ? 62 : 82)}
            y={rumah.y - 8}
            skala={ponsel ? 0.8 : 1}
          />
          {simpul.map((item, index) => {
            const p = titik[index]!
            const kiri = (POSISI_X[index % POSISI_X.length] ?? 50) < 50
            const dx = ponsel ? 78 : 96
            return (
              <Bangunan
                key={item.id}
                id={item.id}
                x={kiri ? p.x - dx : p.x + dx}
                y={p.y - (ponsel ? 26 : 34)}
                skala={ponsel ? 0.72 : 0.9}
              />
            )
          })}
        </svg>
      ) : null}

      {DEKOR.map(({ Icon, x, y, size, kecil }, index) => (
        <Icon
          key={index}
          aria-hidden
          size={size}
          strokeWidth={1.75}
          className={`absolute text-[#5f7a55] opacity-50 ${kecil ? 'hidden sm:block' : ''}`}
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {lebar > 0 && titik.length > 0 ? (
        <>
          <span
            className="bg-panggung text-sorot absolute z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-md"
            style={{
              left: asal ? asal.x : rumah.x,
              top: (asal ? asal.y : rumah.y) - (asal && pemain !== null && pemain >= 0 ? 132 : 84),
              transform: 'translateX(-50%)',
            }}
          >
            <Flag aria-hidden size={13} />
            {pemain !== null && pemain >= 0
              ? (teks.kamuDiSini ?? teks.mulaiDiSini)
              : pemain === -1
                ? `${teks.rumah ?? 'Rumah'} · ${teks.kamuDiSini ?? teks.mulaiDiSini}`
                : `${teks.rumah ?? 'Rumah'} · ${teks.mulaiDiSini}`}
          </span>
          <span
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ left: akhir.x, top: akhir.y, transform: 'translate(-50%, -100%)' }}
          >
            <span className="bg-kartu border-border-halus text-teks flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-md">
              <FlagTriangleRight aria-hidden size={13} className="text-berhasil" />
              {teks.garisAkhir}
            </span>
            <span aria-hidden className="bg-panggung h-6 w-1.5 rounded-full" />
          </span>
        </>
      ) : null}

      {lebar > 0
        ? simpul.map((item, index) => {
            const palette = paletteFor(item.id)
            const Icon = SCENE_ICONS[item.id] ?? Hand
            const status = item.status ?? 'buka'
            const kunci = status === 'kunci'
            const kiri = (POSISI_X[index % POSISI_X.length] ?? 50) < 50
            const p = titik[index]!
            const warna = kunci ? '#9a9385' : palette.accent
            const kartu = (
              <span
                className={`border-border-halus bg-kartu shadow-kartu-angkat flex flex-col gap-0.5 rounded-2xl border p-3 text-left ${
                  kunci ? 'opacity-80' : ''
                }`}
              >
                <span className="text-teks-samar font-mono text-[11px] uppercase tracking-[0.2em]">
                  {teks.adegan} {index + 1}
                  {kunci ? ` · ${teks.terkunci}` : ''}
                </span>
                <span
                  className="font-display text-base font-semibold leading-tight sm:text-lg"
                  style={{ color: kunci ? '#6f6759' : palette.deep }}
                >
                  {item.judul}
                </span>
                <span className="text-teks-sekunder text-xs sm:text-sm">
                  {item.keterangan ?? item.suasana}
                </span>
                <span className="text-teks-samar mt-0.5 font-mono text-[11px]">
                  {item.isyarat} {teks.isyarat} · ±{item.menit} {teks.menit}
                </span>
                {typeof item.persen === 'number' && !kunci ? (
                  <span aria-hidden className="bg-terangkat mt-1.5 h-1.5 rounded-full">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${item.persen}%`, backgroundColor: palette.accent }}
                    />
                  </span>
                ) : null}
                {kunci ? null : (
                  <span
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: palette.accent }}
                  >
                    {status === 'selesai' ? teks.ulangi : teks.mulai}
                    <ArrowRight aria-hidden size={13} strokeWidth={2.5} />
                  </span>
                )}
              </span>
            )
            const pin = (
              <span
                aria-hidden
                className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full border-4 border-white shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                style={{ backgroundColor: warna }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
                  style={{ color: kunci ? '#7c7568' : palette.deep }}
                >
                  {kunci ? (
                    <Lock size={20} strokeWidth={2.25} />
                  ) : (
                    <Icon size={24} strokeWidth={2} />
                  )}
                </span>
                <span
                  className="absolute -bottom-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-white"
                  style={{ backgroundColor: warna }}
                />
                <span className="bg-panggung text-sorot absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-mono text-xs font-bold">
                  {index + 1}
                </span>
                {status === 'selesai' ? (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white"
                    style={{ backgroundColor: palette.accent }}
                  >
                    <Star size={12} strokeWidth={2.5} fill="currentColor" />
                  </span>
                ) : null}
              </span>
            )
            const posisiKartu = ponsel
              ? {
                  top: 100,
                  [kiri ? 'left' : 'right']: -(kiri ? p.x : lebar - p.x) + lebar * 0.04 + 33,
                  width: lebar * 0.7,
                }
              : { top: 0, [kiri ? 'left' : 'right']: 83, width: Math.min(300, lebar * 0.4) }
            const isi = (
              <>
                {pin}
                <span className="absolute" style={posisiKartu}>
                  {kartu}
                </span>
              </>
            )
            const kelas =
              'group absolute z-10 block h-[78px] w-[66px] -translate-x-1/2 -translate-y-full rounded-full'
            const label = `${teks.adegan} ${index + 1}: ${item.judul}${kunci ? `, ${teks.terkunci}` : ''}`
            if (onSampai && !kunci) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={kelas}
                  style={{ left: p.x, top: p.y }}
                  aria-label={label}
                  aria-busy={tujuan === index}
                  onClick={() => pilih(item, index)}
                >
                  {isi}
                </button>
              )
            }
            return kunci ? (
              <span
                key={item.id}
                className={kelas}
                style={{ left: p.x, top: p.y }}
                aria-label={label}
                role="img"
              >
                {isi}
              </span>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={kelas}
                style={{ left: p.x, top: p.y }}
                aria-label={label}
              >
                {isi}
              </Link>
            )
          })
        : null}

      {lebar > 0 && titik.length > 0 && asal ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30"
          width={lebar}
          height={tinggi}
          viewBox={`0 0 ${lebar} ${tinggi}`}
        >
          <g transform={jalurPemain ? undefined : `translate(${asal.x} ${asal.y})`}>
            {jalurPemain ? (
              <animateMotion
                dur={`${durasi}ms`}
                fill="freeze"
                calcMode="linear"
                path={jalurPemain}
              />
            ) : null}
            <Pejalan
              karakter={karakter}
              berjalan={tujuan !== null && jalurPemain !== null}
              hadap={hadapPemain}
              y={-12}
              skala={ponsel ? 0.9 : 1}
            />
          </g>
        </svg>
      ) : null}
    </div>
  )
}
