'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, CheckCircle2, Eye, Hand, VolumeX } from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

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
    tryMissing: 'Isyarat contoh sedang disiapkan. Pilih salah satu adegan untuk mulai belajar.',
    twoWayTitle: 'Satu adegan, dua peran',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi pekerja layanan',
    deafRole: 'Anda yang berisyarat: memesan, bertanya, membayar.',
    serviceRole: 'Anda yang membaca isyarat: melayani sampai tuntas.',
    scenariosTitle: 'Pilih tempat, bukan daftar kata',
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
    tryMissing: 'The sample sign is being prepared. Pick a scene to start learning.',
    twoWayTitle: 'One scene, two roles',
    sideDeaf: 'Deaf side',
    sideService: 'Service side',
    deafRole: 'You sign: order, ask, pay.',
    serviceRole: 'You read the signs: serve to the end.',
    scenariosTitle: 'Pick a place, not a word list',
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

  return (
    <main lang={lang} className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-3.5">
          <p className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden className="text-sorot tracking-tighter">
              ▲▲▲
            </span>
            Lakon
          </p>
          <nav className="flex items-center gap-1 sm:gap-3">
            <a
              href="#adegan"
              className="hover:text-sorot hidden px-2 py-2 text-sm font-medium transition-colors md:inline-block"
            >
              {t.navScenes}
            </a>
            <a
              href="#coba"
              className="bg-sorot text-panggung hidden items-center rounded-lg px-4 text-sm font-bold transition-colors hover:bg-[#e5b93c] sm:inline-flex"
              style={{ minHeight: 44 }}
            >
              {t.navTry}
            </a>
            <Link
              href="/masuk"
              className="flex items-center px-3 text-sm underline underline-offset-4"
              style={{ minHeight: 44 }}
            >
              {t.navSignIn}
            </Link>
            <button
              type="button"
              onClick={() => setLang(other)}
              className="border-halaman/30 hover:border-halaman/70 rounded-lg border px-3 font-mono text-sm transition-colors"
              style={{ minHeight: 44 }}
              aria-label={t.langSwitch}
            >
              {t.langLabel}
            </button>
          </nav>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="animasi-masuk relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pb-16 pt-14 text-center md:pb-20 md:pt-20">
          <p className="text-sorot font-mono text-xs font-bold uppercase tracking-[0.2em]">
            {t.heroKicker}
          </p>
          <h1 className="font-display text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="text-halaman/80 mx-auto max-w-prose text-pretty text-lg leading-relaxed">
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
              <div key={label} className="px-4 py-3.5">
                <dd className="font-display text-3xl font-semibold">{value}</dd>
                <dt className="text-halaman/60 mt-0.5 text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="coba" ref={trySectionRef} className="mx-auto w-full max-w-5xl px-6 py-14">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.tryTitle}</h2>
        <p className="text-teks-sekunder mt-2 text-lg">{t.tryBody}</p>
        <div className="border-border-halus bg-kartu shadow-kartu-angkat mt-6 rounded-3xl border p-5 md:p-7">
          {showTry ? (
            <TrySignBlock
              lang={lang}
              missingText={t.tryMissing}
              loadingText={lang === 'id' ? 'Memuat…' : 'Loading…'}
            />
          ) : (
            <button type="button" onClick={() => setShowTry(true)} className="tombol-sekunder">
              {lang === 'id' ? 'Muat blok latihan' : 'Load the practice block'}
            </button>
          )}
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.twoWayTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(
              [
                [Hand, t.sideDeaf, t.deafRole],
                [Eye, t.sideService, t.serviceRole],
              ] as const
            ).map(([Ikon, judul, isi]) => (
              <div
                key={judul}
                className="border-border-halus bg-kartu shadow-kartu flex items-start gap-3.5 rounded-2xl border p-5"
              >
                <span
                  aria-hidden
                  className="bg-terangkat text-aksen flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                >
                  <Ikon size={19} strokeWidth={2.25} />
                </span>
                <span>
                  <span className="block font-bold">{judul}</span>
                  <span className="text-teks-sekunder block text-sm">{isi}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="adegan" className="mx-auto w-full max-w-5xl px-6 py-14">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.scenariosTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => {
            const palette = paletteFor(scenario.id)
            const signCount = new Set(
              scenario.nodes.flatMap((node) =>
                node.task
                  ? [node.task.deaf, node.task.service].flatMap((task) =>
                      task.type === 'point' ? [] : [task.sign],
                    )
                  : [],
              ),
            ).size
            return (
              <Link
                key={scenario.id}
                href="/skenario"
                className="border-border-halus bg-kartu shadow-kartu hover:shadow-kartu-angkat group overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  aria-hidden
                  className="relative h-20"
                  style={{
                    background: `linear-gradient(155deg, ${palette.ambient}, ${palette.tint})`,
                  }}
                >
                  <span
                    className="font-display absolute left-5 top-3 text-3xl font-semibold"
                    style={{ color: palette.deep }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="absolute inset-x-0 bottom-0 h-1.5"
                    style={{ backgroundColor: palette.accent }}
                  />
                </div>
                <div className="flex flex-col gap-1 p-5">
                  <p className="font-display text-xl font-semibold" style={{ color: palette.deep }}>
                    {scenario.title[lang]}
                  </p>
                  <p className="text-teks-sekunder text-sm">{t.scenarioMoods[scenario.id] ?? ''}</p>
                  <p className="text-teks-samar mt-1 font-mono text-sm">
                    {signCount} {t.scenarioSigns}, ±{scenario.estimatedMinutes} {t.scenarioMinutes}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t.accessTitle}</h2>
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
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm">
          <p className="text-halaman flex items-center gap-2 font-bold">
            <span aria-hidden className="text-sorot tracking-tighter">
              ▲▲▲
            </span>
            Lakon
            <span className="text-halaman/50 ml-1 font-mono text-xs font-normal">
              {t.footerRegion}
            </span>
          </p>
          <p className="flex items-center gap-1.5 font-mono">
            <VolumeX aria-hidden size={14} />
            {t.footerLine}
          </p>
          <p>{t.footerMeta}</p>
        </div>
      </footer>
    </main>
  )
}
