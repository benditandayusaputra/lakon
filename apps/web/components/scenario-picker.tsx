'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Bus,
  CheckCircle2,
  Coffee,
  Eye,
  Hand,
  HeartPulse,
  Info,
  LogOut,
  Siren,
  Trash2,
} from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import {
  clearAllProgress,
  listRuns,
  listSignProgress,
  pullFromServer,
} from '@/features/progress/store'
import { SyncBadge } from '@/components/sync-badge'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const SCENE_ICONS: Record<string, typeof Coffee> = {
  'kedai-kopi': Coffee,
  puskesmas: HeartPulse,
  transportasi: Bus,
  'wawancara-kerja': Briefcase,
  darurat: Siren,
}

const SCENE_MOODS: Record<string, string> = {
  'kedai-kopi': 'Amber pagi, kayu jati',
  puskesmas: 'Hijau teduh, ruang tunggu',
  transportasi: 'Beton, biru peron',
  'wawancara-kerja': 'Kedai pagi, kayu terang',
  darurat: 'Cahaya siang, paling tenang',
}

const ROLES = [
  {
    value: 'deaf',
    icon: Hand,
    code: 'A',
    title: 'Sisi Tuli',
    body: 'Kamu yang berisyarat. Menjalani transaksi: memesan, bertanya, membayar.',
    channel: 'keluar, tanganmu',
    ctaName: 'sisi Tuli',
  },
  {
    value: 'service',
    icon: Eye,
    code: 'B',
    title: 'Sisi pekerja layanan',
    body: 'Kamu yang membaca isyarat. Melayani pelanggan Tuli sampai tuntas.',
    channel: 'masuk, tangan pelanggan',
    ctaName: 'pekerja layanan',
  },
] as const

const Kicker = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p
    className={`flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] ${
      light ? 'text-sorot' : 'text-aksen'
    }`}
  >
    <span aria-hidden className={`h-px w-7 ${light ? 'bg-sorot' : 'bg-aksen'}`} />
    {children}
  </p>
)

const scenarioSignIds = (scenario: {
  vocab: string[]
  nodes: {
    task?: { deaf: { type: string; sign?: string }; service: { type: string; sign?: string } }
  }[]
}) =>
  new Set([
    ...scenario.vocab,
    ...scenario.nodes.flatMap((node) =>
      node.task
        ? [node.task.deaf, node.task.service].flatMap((task) =>
            task.type === 'point' || !task.sign ? [] : [task.sign],
          )
        : [],
    ),
  ])

export function ScenarioPicker() {
  const { content, error } = useContent()
  const [direction, setDirection] = useState<'deaf' | 'service'>('deaf')
  const [runsByScenario, setRunsByScenario] = useState<Record<string, number>>({})
  const [masteredSigns, setMasteredSigns] = useState<Set<string>>(new Set())
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
          setMasteredSigns(
            new Set(
              entries
                .filter((entry) => entry.status !== 'belum' && entry.status !== 'berlatih')
                .map((entry) => entry.signId),
            ),
          ),
        )
      })
    void fetch('/api/auth/saya')
      .then((response) => response.json())
      .then((data: { user: { displayName: string } | null }) => setAccount(data.user))
      .catch(() => {})
  }, [])

  const revealRootRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const root = revealRootRef.current
    if (!root) return
    const targets = root.querySelectorAll('[data-ungkap]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('terlihat')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [content])

  const wipe = () => {
    if (!window.confirm('Hapus seluruh data belajarmu di perangkat ini dan di server?')) return
    void clearAllProgress().then(() => {
      setRunsByScenario({})
      setMasteredSigns(new Set())
      setWiped(true)
    })
  }

  const scenarios = useMemo(
    () =>
      content
        ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
        : [],
    [content],
  )

  const totalRuns = Object.values(runsByScenario).reduce((sum, count) => sum + count, 0)
  const activeRole = ROLES.find((role) => role.value === direction) ?? ROLES[0]

  return (
    <main ref={revealRootRef} className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span aria-hidden className="text-sorot tracking-tighter">
                ▲▲▲
              </span>
              Lakon
            </Link>
            <Link
              href="/"
              className="text-halaman/70 hover:text-halaman hidden items-center gap-1.5 text-sm transition-colors md:flex"
              style={{ minHeight: 44 }}
            >
              <ArrowLeft aria-hidden size={15} />
              Beranda
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-halaman hidden rounded-full px-3 py-1.5 sm:block">
              <SyncBadge />
            </span>
            {account ? (
              <>
                <span className="hidden max-w-36 truncate text-sm font-bold sm:block">
                  {account.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void fetch('/api/auth/keluar', { method: 'POST' }).then(() => {
                      window.location.assign('/')
                    })
                  }}
                  className="border-halaman/30 hover:border-halaman/70 flex items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors"
                  style={{ minHeight: 44 }}
                >
                  <LogOut aria-hidden size={14} />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/masuk"
                className="bg-sorot text-panggung hover:bg-[#e5b93c] flex items-center rounded-lg px-4 text-sm font-bold transition-colors"
                style={{ minHeight: 44 }}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div aria-hidden className="garis-tenda absolute inset-x-0 top-0 h-1.5 opacity-60" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-10 md:pb-14 md:pt-14">
          <div className="animasi-masuk flex flex-col gap-4">
            <Kicker light>Panggung latihan</Kicker>
            <h1 className="font-display text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Pilih peran, lalu naik ke adegan.
            </h1>
            <p className="text-halaman/80 max-w-prose text-pretty text-lg leading-relaxed">
              Satu percakapan bisa dijalani dari dua sisi. Peranmu menentukan tugasmu di setiap
              giliran.
            </p>
          </div>
          <dl
            className="animasi-masuk divide-halaman/15 border-halaman/15 bg-halaman/5 grid max-w-xl grid-cols-3 divide-x rounded-2xl border"
            style={{ animationDelay: '120ms' }}
          >
            {(
              [
                [scenarios.length || 5, 'adegan'],
                [masteredSigns.size, 'isyarat dikuasai'],
                [totalRuns, 'sesi selesai'],
              ] as const
            ).map(([value, label]) => (
              <div key={label} className="px-4 py-3 sm:px-5">
                <dd className="font-display text-3xl font-semibold">{value}</dd>
                <dt className="text-halaman/60 mt-0.5 text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pt-12 md:pt-14">
        <div data-ungkap className="flex items-baseline gap-4">
          <span aria-hidden className="font-display text-aksen/60 text-3xl font-semibold">
            01
          </span>
          <div>
            <Kicker>Langkah pertama</Kicker>
            <h2 className="font-display mt-2 text-3xl font-semibold">Peranmu</h2>
          </div>
        </div>
        <fieldset data-ungkap className="mt-6">
          <legend className="sr-only">Arah peran</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {ROLES.map((role) => {
              const active = direction === role.value
              const RoleIcon = role.icon
              return (
                <label
                  key={role.value}
                  className={`has-focus-visible:outline-info has-focus-visible:outline-[3px] has-focus-visible:outline-offset-2 flex cursor-pointer flex-col gap-3.5 rounded-3xl border-2 p-6 transition-all duration-300 ${
                    active
                      ? 'border-panggung bg-panggung text-halaman shadow-kartu-angkat'
                      : 'border-border-halus bg-kartu shadow-kartu hover:border-border-tegas hover:-translate-y-0.5 hover:shadow-kartu-angkat'
                  }`}
                >
                  <input
                    type="radio"
                    name="arah"
                    value={role.value}
                    checked={active}
                    onChange={() => setDirection(role.value)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 font-bold">
                      <span
                        aria-hidden
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          active ? 'bg-sorot/20 text-sorot' : 'bg-terangkat text-aksen'
                        }`}
                      >
                        <RoleIcon size={18} strokeWidth={2.25} />
                      </span>
                      {role.title}
                    </span>
                    <span
                      className={`flex items-center gap-2 font-mono text-xs ${
                        active ? 'text-sorot' : 'text-teks-samar'
                      }`}
                    >
                      {active ? <CheckCircle2 aria-hidden size={16} /> : null}
                      Peran {role.code}
                    </span>
                  </span>
                  <span className={active ? 'text-halaman/85' : 'text-teks-sekunder'}>
                    {role.body}
                  </span>
                  <span
                    className={`self-start rounded-lg border px-2.5 py-1 font-mono text-xs ${
                      active
                        ? 'border-halaman/30 text-halaman/85'
                        : 'border-border-tegas text-teks-sekunder'
                    }`}
                  >
                    {role.channel}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-12 md:pt-14">
        <div data-ungkap className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span aria-hidden className="font-display text-aksen/60 text-3xl font-semibold">
              02
            </span>
            <div>
              <Kicker>Langkah kedua</Kicker>
              <h2 className="font-display mt-2 text-3xl font-semibold">Adeganmu</h2>
            </div>
          </div>
          <p className="text-teks-sekunder text-sm" aria-live="polite">
            Mulai sebagai <strong className="text-teks">{activeRole.ctaName}</strong>
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="border-border-halus bg-kartu shadow-kartu mt-7 flex items-start gap-3 rounded-2xl border p-5"
          >
            <Info aria-hidden size={20} className="text-galat mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Adegan gagal dimuat</p>
              <p className="text-teks-sekunder mt-1 text-sm">
                {error} Muat ulang halaman untuk mencoba lagi.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => {
            const palette = paletteFor(scenario.id)
            const SceneIcon = SCENE_ICONS[scenario.id] ?? Hand
            const signIds = scenarioSignIds(scenario)
            const masteredHere = [...signIds].filter((id) => masteredSigns.has(id)).length
            const runs = runsByScenario[scenario.id] ?? 0
            return (
              <Link
                key={scenario.id}
                href={`/skenario/${scenario.id}?arah=${direction}`}
                className="group border-border-halus bg-kartu shadow-kartu hover:shadow-kartu-angkat animasi-masuk flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1.5"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div
                  aria-hidden
                  className="relative h-28 overflow-hidden"
                  style={{
                    background: `linear-gradient(155deg, ${palette.ambient}, ${palette.tint})`,
                  }}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      background: `radial-gradient(ellipse 70% 90% at 80% 10%, ${palette.tint}, transparent 70%)`,
                    }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-2"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <span
                    className="font-display absolute left-5 top-4 text-4xl font-semibold"
                    style={{ color: palette.deep }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/55 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                    style={{ color: palette.deep }}
                  >
                    <SceneIcon size={24} strokeWidth={2} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <p className="font-display text-2xl font-semibold" style={{ color: palette.deep }}>
                    {scenario.title.id}
                  </p>
                  <p className="text-teks-sekunder text-sm">{SCENE_MOODS[scenario.id] ?? ''}</p>
                  <p className="text-teks-samar mt-1 font-mono text-sm">
                    {signIds.size} isyarat, ±{scenario.estimatedMinutes} menit
                  </p>
                  {signIds.size > 0 ? (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-teks-sekunder font-medium">Isyarat dikuasai</span>
                        <span className="text-teks font-mono font-bold">
                          {masteredHere}/{signIds.size}
                        </span>
                      </div>
                      <div aria-hidden className="bg-terangkat mt-1.5 h-1.5 rounded-full">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${(masteredHere / signIds.size) * 100}%`,
                            backgroundColor: palette.accent,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                  {runs > 0 ? (
                    <p className="text-berhasil mt-2 flex items-center gap-1.5 text-sm font-medium">
                      <CheckCircle2 aria-hidden size={15} />
                      Pernah diselesaikan {runs}×
                    </p>
                  ) : null}
                  <span
                    className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-bold"
                    style={{ color: palette.accent }}
                  >
                    Mulai sebagai {activeRole.ctaName}
                    <ArrowRight
                      aria-hidden
                      size={16}
                      strokeWidth={2.5}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            )
          })}
          {!content && !error
            ? [0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="border-border-halus bg-kartu animate-pulse overflow-hidden rounded-3xl border"
                  aria-hidden={index > 0}
                >
                  <span className="sr-only">{index === 0 ? 'Memuat adegan…' : null}</span>
                  <div className="bg-terangkat h-28" />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="bg-terangkat h-6 w-3/4 rounded-lg" />
                    <div className="bg-terangkat h-4 w-1/2 rounded-lg" />
                    <div className="bg-terangkat h-4 w-2/3 rounded-lg" />
                    <div className="bg-terangkat mt-2 h-4 w-1/3 rounded-lg" />
                  </div>
                </div>
              ))
            : null}
        </div>
      </section>

      <footer className="border-border-halus bg-terangkat border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <p className="text-teks-sekunder flex items-center gap-2 text-sm" aria-live="polite">
            {wiped ? (
              <>
                <CheckCircle2 aria-hidden size={16} className="text-berhasil" />
                Seluruh data belajarmu sudah dihapus.
              </>
            ) : (
              <>
                <Hand aria-hidden size={16} className="text-aksen" />
                Isyarat yang sudah dipelajari: <strong>{masteredSigns.size}</strong>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={wipe}
            className="border-border-tegas text-teks-sekunder hover:border-galat hover:text-galat flex items-center gap-2 rounded-lg border px-4 text-sm transition-colors"
            style={{ minHeight: 44 }}
          >
            <Trash2 aria-hidden size={15} />
            Hapus seluruh data belajarku
          </button>
        </div>
      </footer>
    </main>
  )
}
