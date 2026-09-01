'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useContent } from '@/features/content/use-content'
import { paletteFor } from '@/features/ui/tokens'

const TrySignBlock = dynamic(() => import('@/components/try-sign-block'), {
  ssr: false,
  loading: () => <p className="text-teks-sekunder">Memuat…</p>,
})

const copy = {
  id: {
    langLabel: 'English',
    heroTitle: 'Belajar BISINDO lewat percakapan nyata',
    heroBody:
      'Pelajari isyarat dari peragaan karakter 3D. Praktikkan di depan kamera. Lalu jalani simulasi transaksi lengkap. Untuk teman Tuli dan untuk pekerja layanan.',
    heroCta: 'Mulai belajar',
    heroTry: 'Coba dulu tanpa akun',
    tryTitle: 'Coba satu isyarat',
    tryBody: 'Tanpa login. Selesai dalam 20 detik.',
    tryMissing:
      'Isyarat contoh belum tersedia karena menunggu validasi penanda Tuli. Fitur ini aktif setelah sesi validasi.',
    twoWayTitle: 'Satu percakapan, dua peran',
    twoWayBody: 'Skenario yang sama bisa dijalani dari dua sisi. Geser untuk melihat bedanya.',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi barista',
    deafTask: 'Tugasmu: memesan kopi dengan isyarat. Kamu yang berisyarat, barista yang membaca.',
    serviceTask:
      'Tugasmu: membaca isyarat pelanggan dan menanggapi dengan benar. Kamu yang membaca, pelanggan yang berisyarat.',
    scenariosTitle: 'Lima skenario',
    scenarioSigns: 'isyarat',
    scenarioMinutes: 'menit',
    howTitle: 'Cara kerjanya',
    howSteps: [
      'Pilih skenario dan arah peranmu.',
      'Pelajari tiap isyarat dari peragaan karakter.',
      'Praktikkan di depan kamera. Semua diproses di perangkatmu.',
      'Jalani simulasi percakapan sampai selesai.',
    ],
    howRepo: 'Lihat kode sumbernya',
    validatorsTitle: 'Siapa yang memvalidasi',
    validatorsBody:
      'Setiap bentuk isyarat di Lakon hanya masuk produk setelah divalidasi penanda Tuli atau juru bahasa isyarat dalam sesi validasi. Nama validator dicantumkan di sini setelah sesi selesai, dengan persetujuan mereka. Tidak ada isyarat yang ditetapkan dari tebakan.',
    limitsTitle: 'Aksesibilitas dan batasan',
    limits: [
      'Varian yang didukung baru BISINDO Jakarta. Mode SIBI belum ada.',
      'Kosakata v1 sekitar 38 isyarat untuk lima skenario, bukan kamus lengkap.',
      'Akurasi pengenalan menurun saat kedua tangan saling bertumpuk.',
      'Semua umpan balik berbentuk visual. Tidak ada audio.',
      'Setiap latihan kamera punya jalur alternatif tanpa kamera.',
      'Video tidak pernah meninggalkan perangkat.',
    ],
  },
  en: {
    langLabel: 'Bahasa Indonesia',
    heroTitle: 'Learn BISINDO through real conversations',
    heroBody:
      'Study each sign from a 3D character, practise it on camera, then run a full transaction simulation. For Deaf signers and for service workers.',
    heroCta: 'Start learning',
    heroTry: 'Try it first, no account',
    tryTitle: 'Try one sign',
    tryBody: 'No login needed. Done in 20 seconds.',
    tryMissing:
      'The sample sign is not available yet because it awaits validation by Deaf signers. This block activates after the validation session.',
    twoWayTitle: 'One conversation, two roles',
    twoWayBody: 'The same scenario can be played from both sides. Flip the switch to compare.',
    sideDeaf: 'Deaf side',
    sideService: 'Barista side',
    deafTask: 'Your task: order a coffee in sign. You sign, the barista reads.',
    serviceTask:
      'Your task: read the customer’s signs and respond correctly. You read, the customer signs.',
    scenariosTitle: 'Five scenarios',
    scenarioSigns: 'signs',
    scenarioMinutes: 'min',
    howTitle: 'How it works',
    howSteps: [
      'Pick a scenario and your role.',
      'Learn each sign from the character.',
      'Practise on camera. Everything runs on your device.',
      'Play the full conversation simulation.',
    ],
    howRepo: 'View the source code',
    validatorsTitle: 'Who validates the signs',
    validatorsBody:
      'Every sign in Lakon enters the product only after validation by Deaf signers or sign language interpreters. Validator names appear here after the sessions, with their consent. No sign is ever guessed.',
    limitsTitle: 'Accessibility and limits',
    limits: [
      'Only the Jakarta variant of BISINDO is supported so far. No SIBI mode yet.',
      'The v1 vocabulary is about 38 signs across five scenarios, not a full dictionary.',
      'Recognition accuracy drops when both hands overlap.',
      'All feedback is visual. There is no audio.',
      'Every camera exercise has a no-camera alternative.',
      'Video never leaves your device.',
    ],
  },
} as const

type Lang = keyof typeof copy

export function Landing() {
  const [lang, setLang] = useState<Lang>('id')
  const [side, setSide] = useState<'deaf' | 'service'>('deaf')
  const t = copy[lang]
  const other: Lang = lang === 'id' ? 'en' : 'id'

  const { content } = useContent()
  const scenarios = content ? Object.values(content.scenarios) : []
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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <p className="text-xl font-bold">Lakon</p>
        <nav className="flex items-center gap-3">
          <Link href="/masuk" className="underline underline-offset-4">
            {lang === 'id' ? 'Masuk' : 'Sign in'}
          </Link>
          <button
            type="button"
            onClick={() => setLang(other)}
            className="tombol-sekunder px-3 py-1.5 text-sm"
            style={{ minHeight: 44 }}
          >
            {t.langLabel}
          </button>
        </nav>
      </header>

      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 30%, #4a5568 0%, #2b2f3a 70%, #23262e 100%)',
        }}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-5 text-white">
            <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="text-pretty text-lg text-white/85">{t.heroBody}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/skenario" className="tombol-utama !bg-white !text-[#23262e]">
                {t.heroCta}
              </Link>
              <a href="#coba" className="tombol-sekunder !border-white/60 !text-white">
                {t.heroTry}
              </a>
            </div>
          </div>
          <div
            aria-hidden
            className="hidden aspect-square rounded-full md:block"
            style={{
              background:
                'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)',
            }}
          />
        </div>
      </section>

      <section id="coba" ref={trySectionRef} className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-3xl font-bold">{t.tryTitle}</h2>
        <p className="text-teks-sekunder mt-1">{t.tryBody}</p>
        <div className="border-border-halus mt-6 rounded-3xl border bg-white p-5 md:p-8">
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
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-3xl font-bold">{t.twoWayTitle}</h2>
          <p className="text-teks-sekunder mt-1">{t.twoWayBody}</p>
          <div
            className="palet-kedai-kopi mt-6 rounded-3xl p-6"
            style={{ backgroundColor: 'var(--skenario-tint)' }}
          >
            <div
              role="group"
              aria-label={t.twoWayTitle}
              className="inline-flex overflow-hidden rounded-xl border-2"
              style={{ borderColor: 'var(--skenario-deep)' }}
            >
              {(
                [
                  ['deaf', t.sideDeaf],
                  ['service', t.sideService],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={side === value}
                  onClick={() => setSide(value)}
                  className="px-5 py-3 font-bold"
                  style={
                    side === value
                      ? { backgroundColor: 'var(--skenario-deep)', color: 'var(--skenario-tint)' }
                      : { color: 'var(--skenario-deep)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-4 max-w-prose text-lg" style={{ color: 'var(--skenario-deep)' }}>
              {side === 'deaf' ? t.deafTask : t.serviceTask}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-3xl font-bold">{t.scenariosTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => {
            const palette = paletteFor(scenario.id)
            const signCount = new Set(
              scenario.nodes.flatMap((node) =>
                node.task ? [node.task.deaf.sign, node.task.service.sign] : [],
              ),
            ).size
            return (
              <Link
                key={scenario.id}
                href={`/skenario`}
                className={`${palette.kelas} rounded-3xl p-6 transition-transform hover:-translate-y-0.5`}
                style={{ backgroundColor: palette.tint }}
              >
                <div
                  aria-hidden
                  className="mb-4 h-2 w-16 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
                <p className="text-xl font-bold" style={{ color: palette.deep }}>
                  {scenario.title[lang === 'id' ? 'id' : 'en']}
                </p>
                <p className="mt-2 text-sm" style={{ color: palette.deep }}>
                  {signCount} {t.scenarioSigns} · ± {scenario.estimatedMinutes} {t.scenarioMinutes}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-3xl font-bold">{t.howTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.howSteps.map((step, index) => (
              <li key={index} className="border-border-halus rounded-2xl border bg-white p-5">
                <p className="text-info text-2xl font-bold">{index + 1}</p>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4">
            <a
              href="https://github.com"
              className="underline underline-offset-4"
              rel="noreferrer"
              target="_blank"
            >
              {t.howRepo}
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-3xl font-bold">{t.validatorsTitle}</h2>
        <p className="mt-4 max-w-prose text-lg">{t.validatorsBody}</p>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-3xl font-bold">{t.limitsTitle}</h2>
          <ul className="mt-6 grid max-w-3xl gap-2">
            {t.limits.map((limit, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden>—</span>
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="text-teks-samar mx-auto w-full max-w-6xl px-6 py-8 text-sm">
        Lakon · BISINDO Jakarta ·{' '}
        {lang === 'id'
          ? 'alat belajar bahasa untuk dua pihak'
          : 'a language learning tool for both sides'}
      </footer>
    </main>
  )
}
