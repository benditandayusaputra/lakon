'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Bus,
  Flag,
  FlagTriangleRight,
  Footprints,
  Hand,
  Landmark,
  Lock,
  PersonStanding,
  Star,
  Store,
  TreeDeciduous,
  TreePine,
  type LucideIcon,
} from 'lucide-react'
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
}

const POSISI_X = [22, 74, 24, 76, 30] as const
const durasiUntuk = (langkah: number) => Math.min(2600, Math.max(500, langkah * 900))
const DEKOR: { Icon: LucideIcon; x: number; y: number; size: number; kecil?: boolean }[] = [
  { Icon: TreeDeciduous, x: 8, y: 6, size: 28 },
  { Icon: Building2, x: 90, y: 4, size: 30, kecil: true },
  { Icon: Store, x: 52, y: 14, size: 26, kecil: true },
  { Icon: TreePine, x: 6, y: 42, size: 26 },
  { Icon: Landmark, x: 92, y: 40, size: 28, kecil: true },
  { Icon: Bus, x: 50, y: 58, size: 26, kecil: true },
  { Icon: TreeDeciduous, x: 88, y: 76, size: 26 },
  { Icon: Building2, x: 8, y: 86, size: 30, kecil: true },
]

export function PetaPerjalanan({
  simpul,
  teks,
  posisiPemain,
  onSampai,
}: {
  simpul: SimpulPeta[]
  teks: TeksPeta
  posisiPemain?: number
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
  const atas = 150
  const bawah = ponsel ? 330 : 150
  const tinggi = atas + Math.max(0, simpul.length - 1) * tinggiBaris + bawah

  const titik = simpul.map((_, index) => ({
    x: ((POSISI_X[index % POSISI_X.length] ?? 50) / 100) * lebar,
    y: atas + index * tinggiBaris,
  }))
  const akhir = {
    x: lebar * (simpul.length % 2 === 0 ? 0.26 : 0.72),
    y: tinggi - (ponsel ? 44 : 56),
  }
  const jalur = [...titik, akhir]
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

  const pemain = typeof posisiPemain === 'number' ? Math.min(posisiPemain, simpul.length - 1) : null
  const asal = pemain !== null ? titik[pemain] : undefined
  const langkah = tujuan !== null && pemain !== null ? Math.abs(tujuan - pemain) : 0
  const durasi = Math.min(2600, Math.max(500, langkah * 900))
  const jalurPemain =
    tujuan !== null && pemain !== null && langkah > 0
      ? ruas(
          tujuan > pemain
            ? titik.slice(pemain, tujuan + 1)
            : titik.slice(tujuan, pemain + 1).reverse(),
        )
      : null

  const pilih = (item: SimpulPeta, index: number) => {
    if (!onSampai || tujuan !== null) return
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (cepat || pemain === null || index === pemain) {
      setTujuan(index)
      timer.current = setTimeout(() => onSampai(item, index), cepat ? 0 : 400)
      return
    }
    setTujuan(index)
    timer.current = setTimeout(() => onSampai(item, index), durasiUntuk(Math.abs(index - pemain)))
  }

  return (
    <div
      ref={ref}
      className="peta-jalan border-border-halus relative w-full overflow-hidden rounded-3xl border shadow-inner"
      style={{ height: tinggi }}
    >
      {lebar > 0 ? (
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
            stroke="#d3cfc2"
            strokeWidth={ponsel ? 34 : 40}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#3b3f46"
            strokeWidth={ponsel ? 24 : 30}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#f2c94c"
            strokeWidth={3}
            strokeDasharray="14 12"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {DEKOR.map(({ Icon, x, y, size, kecil }, index) => (
        <Icon
          key={index}
          aria-hidden
          size={size}
          strokeWidth={1.75}
          className={`absolute text-[#7a8a6f] opacity-45 ${kecil ? 'hidden sm:block' : ''}`}
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {lebar > 0 && titik.length > 0 ? (
        <>
          <span
            className="bg-panggung text-sorot absolute z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-md"
            style={{ left: titik[0]!.x, top: titik[0]!.y - 132, transform: 'translateX(-50%)' }}
          >
            <Flag aria-hidden size={13} />
            {pemain !== null ? (teks.kamuDiSini ?? teks.mulaiDiSini) : teks.mulaiDiSini}
          </span>
          <Footprints
            aria-hidden
            size={22}
            className="absolute z-10 text-[#f2c94c] opacity-90"
            style={{
              left: (titik[0]!.x + (titik[1]?.x ?? titik[0]!.x)) / 2,
              top: titik[0]!.y + tinggiBaris * 0.5,
              transform: 'translate(-50%, -50%) rotate(20deg)',
            }}
          />
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

      {lebar > 0 && asal ? (
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
            <ellipse cx={0} cy={26} rx={16} ry={6} fill="rgb(0 0 0 / 0.25)" />
            <g className={tujuan !== null ? 'peta-pejalan' : undefined}>
              <circle cx={0} cy={4} r={20} fill="#201a13" stroke="#f2c94c" strokeWidth={3} />
              <PersonStanding x={-13} y={-9} size={26} color="#f2c94c" strokeWidth={2.25} />
            </g>
          </g>
        </svg>
      ) : null}
    </div>
  )
}
