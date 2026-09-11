'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Flag, Hand, Info, Repeat, UserRound, Users } from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import { listRuns, listSignProgress, pullFromServer } from '@/features/progress/store'
import { Logo } from '@/components/logo'
import { PetaPerjalanan } from '@/components/peta-perjalanan'
import { SyncBadge } from '@/components/sync-badge'
import { scenarioSignIds } from '@/features/ui/adegan'
import { scenarioRank } from '@/features/ui/tokens'

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

export function ScenarioPicker() {
  const router = useRouter()
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
  const posisiPemain = scenarios.reduce(
    (akhir, scenario, index) => ((runsByScenario[scenario.id] ?? 0) > 0 ? index : akhir),
    0,
  )

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-6 py-3.5">
          <p className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
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
                [Flag, `${selesai}/${scenarios.length || 5}`, 'adegan selesai'],
                [Hand, masteredSigns.size, 'isyarat dikuasai'],
                [Repeat, totalRuns, 'sesi selesai'],
              ] as const
            ).map(([Ikon, value, label]) => (
              <div key={label} className="px-4 py-3">
                <Ikon aria-hidden size={15} className="text-sorot mb-1" />
                <dd className="font-display text-2xl font-semibold">{value}</dd>
                <dt className="text-halaman/60 mt-0.5 text-xs">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pt-8">
        <fieldset>
          <legend className="font-display flex items-center gap-2 text-xl font-semibold">
            <Users aria-hidden size={20} className="text-aksen" />
            Pilih peranmu
          </legend>
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

      <section className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 sm:px-6">
        {scenarios.length > 0 ? (
          <PetaPerjalanan
            simpul={scenarios.map((scenario, index) => {
              const signIds = scenarioSignIds(scenario)
              const masteredHere = [...signIds].filter((id) => masteredSigns.has(id)).length
              const runs = runsByScenario[scenario.id] ?? 0
              const sebelumnya = scenarios[index - 1]
              const terkunci = index > 0 && (runsByScenario[sebelumnya?.id ?? ''] ?? 0) === 0
              return {
                id: scenario.id,
                judul: scenario.title.id,
                suasana: SCENE_MOODS[scenario.id] ?? '',
                isyarat: signIds.size,
                menit: scenario.estimatedMinutes ?? 15,
                href: `/skenario/${scenario.id}?arah=${direction}`,
                status: terkunci ? 'kunci' : runs > 0 ? 'selesai' : 'buka',
                persen: signIds.size > 0 ? Math.round((masteredHere / signIds.size) * 100) : 0,
                keterangan: terkunci
                  ? `Selesaikan “${sebelumnya?.title.id ?? 'adegan sebelumnya'}” dulu untuk membukanya.`
                  : runs > 0
                    ? `${SCENE_MOODS[scenario.id] ?? ''} · diselesaikan ${runs}×`
                    : undefined,
              }
            })}
            posisiPemain={posisiPemain}
            teks={{
              adegan: 'Adegan',
              mulai: 'Mulai',
              ulangi: 'Ulangi',
              terkunci: 'terkunci',
              isyarat: 'isyarat',
              menit: 'menit',
              mulaiDiSini: 'Mulai di sini',
              kamuDiSini: 'Kamu di sini',
              garisAkhir: 'Garis akhir',
            }}
            onSampai={(item) => router.push(item.href)}
          />
        ) : !error ? (
          <div className="border-border-halus bg-kartu flex animate-pulse flex-col gap-4 rounded-3xl border p-6">
            <span className="sr-only">Memuat adegan…</span>
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex gap-4">
                <div className="bg-terangkat h-16 w-16 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2.5 py-2">
                  <div className="bg-terangkat h-4 w-1/3 rounded-lg" />
                  <div className="bg-terangkat h-5 w-2/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

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
