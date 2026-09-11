'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Hand,
  Map,
  ShieldCheck,
  Sparkles,
  Users,
  VolumeX,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { PetaPerjalanan } from '@/components/peta-perjalanan'
import { useContent } from '@/features/content/use-content'
import { scenarioSignIds } from '@/features/ui/adegan'
import { scenarioRank } from '@/features/ui/tokens'

const TrySignBlock = dynamic(() => import('@/components/try-sign-block'), {
  ssr: false,
  loading: () => <p className="text-teks-sekunder">Memuat…</p>,
})

const copy = {
  id: {
    langLabel: 'EN',
    langSwitch: 'Switch to English',
    navScenes: 'Adegan',
    navTry: 'Coba isyarat',
    navSignIn: 'Masuk',
    heroKicker: 'BISINDO Varian Jakarta',
    heroTitle: 'Latihan percakapan BISINDO di dalam transaksi yang benar-benar Anda jalani.',
    heroBody:
      'Lima adegan, dua peran. Pelajari isyarat dari peragaan tiga sudut, peragakan di depan kamera, umpan baliknya muncul di tempat.',
    heroCta: 'Coba satu isyarat, 20 detik',
    heroSecondary: 'Lihat lima adegan',
    statSigns: 'isyarat',
    statScenes: 'adegan',
    statSides: 'peran',
    tryTitle: 'Coba satu isyarat, sekarang',
    tryBody: 'Tanpa akun, tanpa unduhan. Selesai dalam 20 detik.',
    trySteps: ['Lihat peragaan dari tiga sudut', 'Nyalakan kamera', 'Peragakan, nilai langsung'],
    tryMissing: 'Isyarat contoh sedang disiapkan. Pilih salah satu adegan untuk mulai belajar.',
    loading: 'Memuat…',
    loadBlock: 'Muat blok latihan',
    twoWayTitle: 'Satu adegan, dua peran',
    twoWayBody: 'Pilih peran saat masuk. Setiap adegan bisa dijalani dari kedua sisi.',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi pekerja layanan',
    deafRole: 'Kamu yang berisyarat. Menjalani transaksi: memesan, bertanya, membayar.',
    serviceRole: 'Kamu yang membaca isyarat. Melayani pelanggan Tuli sampai tuntas.',
    scenariosTitle: 'Pilih tempat, bukan daftar kata',
    scenariosBody: 'Adegan terbuka satu demi satu. Mulai dari kedai kopi.',
    sceneLabel: 'Adegan',
    sceneStart: 'Mulai',
    sceneRepeat: 'Ulangi',
    sceneLocked: 'terkunci',
    mapStart: 'Mulai di sini',
    mapFinish: 'Garis akhir',
    scenarioMoods: {
      'kedai-kopi': 'Amber pagi, kayu jati',
      puskesmas: 'Hijau teduh, ruang tunggu',
      transportasi: 'Beton, biru peron',
      'wawancara-kerja': 'Kedai pagi, kayu terang',
      darurat: 'Cahaya siang, paling tenang',
    } as Record<string, string>,
    scenarioSigns: 'isyarat',
    scenarioMinutes: 'menit',
    accessTitle: 'Aksesibel sejak awal',
    accessItems: [
      'Tanpa suara sama sekali',
      'Kontras WCAG 2.2 AA',
      'Jalur tanpa kamera di tiap latihan',
      'Video tidak pernah keluar dari perangkat',
    ],
    footerLine: 'Halaman ini tidak memutar suara apa pun.',
    footerRegion: 'BISINDO Jakarta',
    footerMeta: 'Alat belajar bahasa untuk dua pihak. Kode terbuka.',
  },
  en: {
    langLabel: 'ID',
    langSwitch: 'Ganti ke bahasa Indonesia',
    navScenes: 'Scenes',
    navTry: 'Try a sign',
    navSignIn: 'Sign in',
    heroKicker: 'BISINDO Jakarta variant',
    heroTitle: 'BISINDO conversation practice inside transactions you actually live.',
    heroBody:
      'Five scenes, two roles. Learn each sign from three camera angles, perform it on camera, and get feedback on the spot.',
    heroCta: 'Try one sign in 20 seconds',
    heroSecondary: 'See the five scenes',
    statSigns: 'signs',
    statScenes: 'scenes',
    statSides: 'roles',
    tryTitle: 'Try one sign, right now',
    tryBody: 'No account, no download. Done in 20 seconds.',
    trySteps: [
      'Watch the sign from three angles',
      'Turn on the camera',
      'Perform it, get instant feedback',
    ],
    tryMissing: 'The sample sign is being prepared. Pick a scene to start learning.',
    loading: 'Loading…',
    loadBlock: 'Load the practice block',
    twoWayTitle: 'One scene, two roles',
    twoWayBody: 'Pick a role when you sign in. Every scene can be played from both sides.',
    sideDeaf: 'Deaf side',
    sideService: 'Service side',
    deafRole: 'You sign. Go through the transaction: order, ask, pay.',
    serviceRole: 'You read the signs. Serve a Deaf customer to the end.',
    scenariosTitle: 'Pick a place, not a word list',
    scenariosBody: 'Scenes unlock one after another. Start at the coffee shop.',
    sceneLabel: 'Scene',
    sceneStart: 'Start',
    sceneRepeat: 'Replay',
    sceneLocked: 'locked',
    mapStart: 'Start here',
    mapFinish: 'Finish line',
    scenarioMoods: {
      'kedai-kopi': 'Morning amber, teak wood',
      puskesmas: 'Calm green, waiting room',
      transportasi: 'Concrete, platform blue',
      'wawancara-kerja': 'Morning café, light wood',
      darurat: 'Daylight, calmest of all',
    } as Record<string, string>,
    scenarioSigns: 'signs',
    scenarioMinutes: 'min',
    accessTitle: 'Accessible by design',
    accessItems: [
      'No sound at all',
      'WCAG 2.2 AA contrast',
      'A no-camera path in every exercise',
      'Video never leaves the device',
    ],
    footerLine: 'This page plays no sound at all.',
    footerRegion: 'BISINDO Jakarta',
    footerMeta: 'A language learning tool for both sides. Open source.',
  },
} as const

type Lang = keyof typeof copy

export function Landing() {
  const [lang, setLang] = useState<Lang>('id')
  const t = copy[lang]
  const other: Lang = lang === 'id' ? 'en' : 'id'

  const { content } = useContent()
  const scenarios = content
    ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
    : []
  const signs = content
    ? Object.values(content.signs).filter((sign) => sign.id !== 'uji-gerak')
    : []

  const trySectionRef = useRef<HTMLElement | null>(null)
  const [showTry, setShowTry] = useState(false)

  useEffect(() => {
    const section = trySectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowTry(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const roles = [
    [Hand, t.sideDeaf, t.deafRole],
    [Eye, t.sideService, t.serviceRole],
  ] as const

  return (
    <main lang={lang} className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
            Lakon
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2.5">
            <a
              href="#adegan"
              className="hover:text-sorot hidden px-2.5 py-2 text-sm font-medium transition-colors md:inline-block"
            >
              {t.navScenes}
            </a>
            <a
              href="#coba"
              className="bg-sorot text-panggung hidden min-h-11 items-center rounded-lg px-4 text-sm font-bold transition-colors hover:bg-[#e5b93c] sm:inline-flex"
            >
              {t.navTry}
            </a>
            <Link
              href="/masuk"
              className="border-halaman/30 hover:border-halaman/70 flex min-h-11 items-center rounded-lg border px-3.5 text-sm font-semibold transition-colors"
            >
              {t.navSignIn}
            </Link>
            <button
              type="button"
              onClick={() => setLang(other)}
              className="border-halaman/30 hover:border-halaman/70 min-h-11 rounded-lg border px-3 font-mono text-sm transition-colors"
              aria-label={t.langSwitch}
            >
              {t.langLabel}
            </button>
          </nav>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="animasi-masuk relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-14 pt-12 text-center sm:px-6 md:pb-20 md:pt-20">
          <p className="text-sorot font-mono text-xs font-bold uppercase tracking-[0.2em]">
            {t.heroKicker}
          </p>
          <h1 className="font-display text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="text-halaman/80 mx-auto max-w-prose text-pretty text-base leading-relaxed sm:text-lg">
            {t.heroBody}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#coba" className="tombol-sorot justify-center text-center">
              {t.heroCta}
              <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
            </a>
            <a href="#adegan" className="tombol-garis-terang text-center">
              {t.heroSecondary}
            </a>
          </div>
          <dl className="divide-halaman/15 border-halaman/15 bg-halaman/5 mx-auto mt-2 grid w-full max-w-md grid-cols-3 divide-x rounded-2xl border">
            {(
              [
                [signs.length || 3, t.statSigns],
                [scenarios.length || 5, t.statScenes],
                [2, t.statSides],
              ] as const
            ).map(([value, label]) => (
              <div key={label} className="px-3 py-3.5 sm:px-4">
                <dd className="font-display text-2xl font-semibold sm:text-3xl">{value}</dd>
                <dt className="text-halaman/60 mt-0.5 text-xs sm:text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="coba"
        ref={trySectionRef}
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:shrink-0">
            <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
              <span
                aria-hidden
                className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              >
                <Sparkles size={20} strokeWidth={2.25} />
              </span>
              {t.tryTitle}
            </h2>
            <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.tryBody}</p>
          </div>
          <ol className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-2.5">
            {t.trySteps.map((step, index) => (
              <li
                key={step}
                className="border-border-halus bg-kartu shadow-kartu flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 font-medium"
              >
                <span
                  aria-hidden
                  className="bg-panggung text-sorot flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="border-border-halus bg-kartu shadow-kartu-angkat mt-6 rounded-3xl border p-3 sm:p-5 md:p-6">
          {showTry ? (
            <TrySignBlock lang={lang} missingText={t.tryMissing} loadingText={t.loading} />
          ) : (
            <button type="button" onClick={() => setShowTry(true)} className="tombol-sekunder">
              {t.loadBlock}
            </button>
          )}
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
            <span
              aria-hidden
              className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            >
              <Users size={20} strokeWidth={2.25} />
            </span>
            {t.twoWayTitle}
          </h2>
          <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.twoWayBody}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roles.map(([Ikon, judul, isi]) => (
              <div
                key={judul}
                className="border-border-halus bg-kartu shadow-kartu flex flex-col gap-2 rounded-2xl border p-5"
              >
                <span className="flex items-center gap-2.5 text-lg font-bold">
                  <span
                    aria-hidden
                    className="bg-terangkat text-aksen flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  >
                    <Ikon size={18} strokeWidth={2.25} />
                  </span>
                  {judul}
                </span>
                <span className="text-teks-sekunder text-sm leading-relaxed">{isi}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="adegan"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <span
            aria-hidden
            className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          >
            <Map size={20} strokeWidth={2.25} />
          </span>
          {t.scenariosTitle}
        </h2>
        <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.scenariosBody}</p>
        <div className="mt-6">
          <PetaPerjalanan
            simpul={scenarios.map((scenario) => ({
              id: scenario.id,
              judul: scenario.title[lang],
              suasana: t.scenarioMoods[scenario.id] ?? '',
              isyarat: scenarioSignIds(scenario).size,
              menit: scenario.estimatedMinutes ?? 15,
              href: '/daftar',
            }))}
            teks={{
              adegan: t.sceneLabel,
              mulai: t.sceneStart,
              ulangi: t.sceneRepeat,
              terkunci: t.sceneLocked,
              isyarat: t.scenarioSigns,
              menit: t.scenarioMinutes,
              mulaiDiSini: t.mapStart,
              garisAkhir: t.mapFinish,
            }}
          />
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
            <span
              aria-hidden
              className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            >
              <ShieldCheck size={20} strokeWidth={2.25} />
            </span>
            {t.accessTitle}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {t.accessItems.map((item) => (
              <li
                key={item}
                className="border-border-halus bg-kartu shadow-kartu flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <CheckCircle2 aria-hidden size={15} className="text-berhasil shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="bg-panggung text-halaman/60 border-halaman/10 border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <p className="text-halaman flex items-center gap-2.5 font-bold">
            <Logo className="h-6 w-6" />
            Lakon
            <span className="text-halaman/50 ml-1 font-mono text-xs font-normal">
              {t.footerRegion}
            </span>
          </p>
          <p className="flex items-center gap-1.5 font-mono">
            <VolumeX aria-hidden size={14} className="shrink-0" />
            {t.footerLine}
          </p>
          <p>{t.footerMeta}</p>
        </div>
      </footer>
    </main>
  )
}
