'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Bus,
  Coffee,
  Eye,
  Hand,
  HeartPulse,
  Info,
  Lock,
  Siren,
  Star,
  UserRound,
} from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import { listRuns, listSignProgress, pullFromServer } from '@/features/progress/store'
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
    title: 'Sisi Tuli',
    body: 'Kamu yang berisyarat. Menjalani transaksi: memesan, bertanya, membayar.',
    ctaName: 'sisi Tuli',
  },
  {
    value: 'service',
    icon: Eye,
    title: 'Sisi pekerja layanan',
    body: 'Kamu yang membaca isyarat. Melayani pelanggan Tuli sampai tuntas.',
    ctaName: 'pekerja layanan',
  },
] as const

const GESER = [0, 14, -12, 10, -8] as const

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

  const scenarios = useMemo(
    () =>
      content
        ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
        : [],
    [content],
  )

  const totalRuns = Object.values(runsByScenario).reduce((sum, count) => sum + count, 0)
  const activeRole = ROLES.find((role) => role.value === direction) ?? ROLES[0]
  const selesai = scenarios.filter((scenario) => (runsByScenario[scenario.id] ?? 0) > 0).length

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-6 py-3.5">
          <p className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden className="text-sorot tracking-tighter">
              ▲▲▲
            </span>
            Lakon
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-halaman hidden rounded-full px-3 py-1.5 sm:block">
              <SyncBadge />
            </span>
            <Link
              href="/profil"
              className="border-halaman/30 hover:border-halaman/70 flex items-center gap-2 rounded-lg border px-3 text-sm transition-colors"
              style={{ minHeight: 44 }}
            >
              <UserRound aria-hidden size={15} />
              <span className="max-w-28 truncate">{account?.displayName ?? 'Profil'}</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 pb-10 pt-9">
          <h1 className="font-display text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Perjalananmu, satu adegan demi satu adegan.
          </h1>
          <p className="text-halaman/80 text-pretty">
            Adegan berikutnya terbuka setelah adegan sebelumnya kamu selesaikan.
          </p>
          <dl className="divide-halaman/15 border-halaman/15 bg-halaman/5 grid max-w-md grid-cols-3 divide-x rounded-2xl border">
            {(
              [
                [`${selesai}/${scenarios.length || 5}`, 'adegan selesai'],
                [masteredSigns.size, 'isyarat dikuasai'],
                [totalRuns, 'sesi selesai'],
              ] as const
            ).map(([value, label]) => (
              <div key={label} className="px-4 py-3">
                <dd className="font-display text-2xl font-semibold">{value}</dd>
                <dt className="text-halaman/60 mt-0.5 text-xs">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pt-8">
        <fieldset>
          <legend className="font-display text-xl font-semibold">Pilih peranmu</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => {
              const active = direction === role.value
              const RoleIcon = role.icon
              return (
                <label
                  key={role.value}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all ${
                    active
                      ? 'border-panggung bg-panggung text-halaman shadow-kartu-angkat'
                      : 'border-border-halus bg-kartu shadow-kartu hover:border-border-tegas'
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
                  <span className="flex items-center gap-2.5 font-bold">
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active ? 'bg-sorot/20 text-sorot' : 'bg-terangkat text-aksen'
                      }`}
                    >
                      <RoleIcon size={17} strokeWidth={2.25} />
                    </span>
                    {role.title}
                  </span>
                  <span className={`text-sm ${active ? 'text-halaman/85' : 'text-teks-sekunder'}`}>
                    {role.body}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </section>

      {error ? (
        <div
          role="alert"
          className="border-border-halus bg-kartu shadow-kartu mx-auto mt-7 flex w-full max-w-3xl items-start gap-3 rounded-2xl border p-5"
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

      <ol className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-0 px-6 pb-16 pt-8">
        {scenarios.map((scenario, index) => {
          const palette = paletteFor(scenario.id)
          const SceneIcon = SCENE_ICONS[scenario.id] ?? Hand
          const signIds = scenarioSignIds(scenario)
          const masteredHere = [...signIds].filter((id) => masteredSigns.has(id)).length
          const runs = runsByScenario[scenario.id] ?? 0
          const sebelumnya = scenarios[index - 1]
          const terkunci = index > 0 && (runsByScenario[sebelumnya?.id ?? ''] ?? 0) === 0
          const tuntas = runs > 0
          const persen = signIds.size > 0 ? Math.round((masteredHere / signIds.size) * 100) : 0

          const isi = (
            <>
              <span
                aria-hidden
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 shadow-lg transition-transform"
                style={{
                  backgroundColor: terkunci ? '#ded9d0' : palette.tint,
                  borderColor: terkunci ? '#b9b2a6' : palette.accent,
                  color: terkunci ? '#7c7568' : palette.deep,
                }}
              >
                {terkunci ? (
                  <Lock size={26} strokeWidth={2.25} />
                ) : (
                  <SceneIcon size={30} strokeWidth={2} />
                )}
                {tuntas ? (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                    style={{ backgroundColor: palette.accent, color: '#fff' }}
                  >
                    <Star size={16} strokeWidth={2.5} fill="currentColor" />
                  </span>
                ) : null}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-teks-samar font-mono text-xs uppercase tracking-[0.2em]">
                  Adegan {index + 1}
                  {terkunci ? ' · terkunci' : tuntas ? ' · selesai' : ''}
                </span>
                <span
                  className="font-display text-xl font-semibold leading-tight"
                  style={{ color: terkunci ? '#7c7568' : palette.deep }}
                >
                  {scenario.title.id}
                </span>
                <span className="text-teks-sekunder text-sm">
                  {terkunci
                    ? `Selesaikan “${sebelumnya?.title.id ?? 'adegan sebelumnya'}” dulu untuk membukanya.`
                    : (SCENE_MOODS[scenario.id] ?? '')}
                </span>
                {terkunci ? null : (
                  <>
                    <span className="text-teks-samar font-mono text-xs">
                      {signIds.size} isyarat · ±{scenario.estimatedMinutes} menit
                      {runs > 0 ? ` · diselesaikan ${runs}×` : ''}
                    </span>
                    <span aria-hidden className="bg-terangkat mt-1 h-1.5 rounded-full">
                      <span
                        className="block h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${persen}%`, backgroundColor: palette.accent }}
                      />
                    </span>
                    <span className="text-teks-sekunder mt-0.5 text-xs">
                      {masteredHere}/{signIds.size} isyarat dikuasai
                    </span>
                  </>
                )}
              </span>

              {terkunci ? null : (
                <span
                  aria-hidden
                  className="hidden shrink-0 items-center gap-1.5 self-center text-sm font-bold sm:flex"
                  style={{ color: palette.accent }}
                >
                  {tuntas ? 'Ulangi' : 'Mulai'}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              )}
            </>
          )

          const kelas =
            'jalur-simpul border-border-halus bg-kartu shadow-kartu flex w-full items-start gap-4 rounded-3xl border p-4 text-left'

          return (
            <li key={scenario.id} className="flex flex-col items-stretch">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="jalur-garis mx-auto h-10 w-1.5 rounded-full"
                  style={{ ['--jalur-warna' as string]: terkunci ? '#ded9d0' : palette.ambient }}
                />
              ) : null}
              <div
                className="sm:pe-[var(--pe)] sm:ps-[var(--ps)]"
                style={{
                  ['--ps' as string]: `${Math.max(GESER[index % GESER.length] ?? 0, 0)}%`,
                  ['--pe' as string]: `${Math.max(-(GESER[index % GESER.length] ?? 0), 0)}%`,
                }}
              >
                {terkunci ? (
                  <div
                    className={`${kelas} opacity-70`}
                    aria-label={`${scenario.title.id}, terkunci`}
                  >
                    {isi}
                  </div>
                ) : (
                  <Link
                    href={`/skenario/${scenario.id}?arah=${direction}`}
                    className={`${kelas} hover:shadow-kartu-angkat`}
                  >
                    {isi}
                  </Link>
                )}
              </div>
            </li>
          )
        })}

        {!content && !error
          ? [0, 1, 2].map((index) => (
              <li key={index} className="mt-4">
                <div className="border-border-halus bg-kartu flex animate-pulse gap-4 rounded-3xl border p-4">
                  <span className="sr-only">{index === 0 ? 'Memuat adegan…' : null}</span>
                  <div className="bg-terangkat h-20 w-20 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2.5 py-2">
                    <div className="bg-terangkat h-4 w-1/3 rounded-lg" />
                    <div className="bg-terangkat h-5 w-2/3 rounded-lg" />
                    <div className="bg-terangkat h-3 w-1/2 rounded-lg" />
                  </div>
                </div>
              </li>
            ))
          : null}
      </ol>

      <footer className="border-border-halus bg-terangkat border-t">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <p className="text-teks-sekunder flex items-center gap-2 text-sm">
            <Hand aria-hidden size={16} className="text-aksen" />
            Isyarat yang sudah dipelajari: <strong>{masteredSigns.size}</strong>
          </p>
          <p className="text-teks-sekunder text-sm">
            Mulai sebagai <strong className="text-teks">{activeRole.ctaName}</strong>
          </p>
        </div>
      </footer>
    </main>
  )
}
