'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  Camera,
  CameraOff,
  CheckCircle2,
  Contrast,
  Eye,
  GitBranch,
  Hand,
  Info,
  MapPin,
  MessagesSquare,
  PauseCircle,
  Play,
  Pointer,
  Shapes,
  ShieldCheck,
  Users,
  Video,
  VolumeX,
} from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const TrySignBlock = dynamic(() => import('@/components/try-sign-block'), {
  ssr: false,
  loading: () => <p className="text-teks-sekunder">Memuat…</p>,
})

const TRY_ICONS = [Eye, Video, CheckCircle2]
const HOW_ICONS = [MapPin, Hand, Camera, MessagesSquare]
const ACCESS_ICONS = [Contrast, Shapes, VolumeX, PauseCircle, Pointer, CameraOff, ShieldCheck]
const VALID_ICONS = [Users, ShieldCheck, MapPin]

const copy = {
  id: {
    langLabel: 'EN',
    navScenes: 'Adegan',
    navHow: 'Cara kerja',
    navTry: 'Coba isyarat',
    navSignIn: 'Masuk',
    heroKicker: 'BISINDO Varian Jakarta',
    heroTitle: 'Latihan percakapan BISINDO di dalam transaksi yang benar-benar Anda jalani.',
    heroBody:
      'Lima adegan, dua peran. Pelajari isyarat dari peragaan karakter 3D, peragakan di depan kamera, umpan baliknya muncul di tempat.',
    heroCta: 'Coba satu isyarat, 20 detik',
    heroSecondary: 'Lihat lima adegan',
    heroStageTop: 'tanpa suara, tanpa musik',
    heroStageBottom: 'peragaan langsung di bawah',
    statSigns: 'isyarat',
    statScenes: 'adegan',
    statSides: 'peran',
    tryKicker: 'Latihan singkat',
    tryTitle: 'Coba satu isyarat, sekarang',
    tryBody: 'Tanpa akun, tanpa unduhan. Selesai dalam 20 detik.',
    trySteps: ['Lihat peragaan', 'Peragakan ke kamera', 'Lihat hasil'],
    tryMissing: 'Isyarat contoh sedang disiapkan. Pilih salah satu adegan untuk mulai belajar.',
    twoWayKicker: 'Dua arah',
    twoWayTitle: 'Satu adegan, dua peran',
    twoWayBody: 'Struktur percakapannya sama. Yang berubah: siapa Anda, dan apa tugas Anda.',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi barista',
    deafRole: 'Anda pelanggan atau warga',
    serviceRole: 'Anda petugas yang melayani',
    deafChannel: 'keluar, tangan Anda',
    serviceChannel: 'masuk, tangan pelanggan',
    deafTasks: ['Peragakan permintaan Anda', 'Baca jawaban petugas', 'Tutup dengan terima kasih'],
    serviceTasks: ['Baca isyarat pelanggan', 'Jawab dengan cara yang jelas', 'Layani sampai tuntas'],
    twoWayNote:
      'Sisi barista tidak lebih ringan: membaca isyarat orang lain lebih sulit daripada memperagakannya.',
    scenariosKicker: 'Lima adegan',
    scenariosTitle: 'Pilih tempat, bukan daftar kata',
    scenariosBody:
      'Warna tempat hanya hidup di kartu ini. Begitu masuk fase belajar, semuanya luruh jadi netral supaya tangan yang paling terbaca.',
    scenarioMoods: {
      'kedai-kopi': 'Amber pagi, kayu jati',
      puskesmas: 'Hijau teduh, ruang tunggu',
      transportasi: 'Beton, biru peron',
      'wawancara-kerja': 'Kedai pagi, kayu terang',
      darurat: 'Cahaya siang, paling tenang',
    } as Record<string, string>,
    scenarioSigns: 'isyarat',
    scenarioMinutes: 'menit',
    scenarioCta: 'Mulai adegan',
    howKicker: 'Cara kerjanya',
    howTitle: 'Empat langkah di satu adegan',
    howSteps: [
      ['Pilih adegan', 'Pilih peran dulu: sisi Tuli atau sisi petugas.'],
      ['Pelajari isyarat', 'Peragaan 3D, tiga kecepatan, bisa dijeda per frame.'],
      ['Praktik di kamera', 'Verifikasi di perangkat Anda, ulangi sebanyak perlu.'],
      ['Ujian percakapan', 'Percakapan penuh, giliran demi giliran.'],
    ],
    howRepo: 'Buka repositori',
    validKicker: 'Validasi bahasa',
    validTitle: 'Yang menentukan sebuah isyarat masuk atau tidak',
    validBody:
      'Bentuk isyarat di Lakon tidak diambil dari kamus lalu diterjemahkan. Setiap isyarat bersumber dari video penanda Tuli, dan ditinjau penanda Tuli dalam sesi validasi. Kalau mereka menolak, isyarat itu tidak masuk.',
    validChips: ['bersumber penanda Tuli', 'ditinjau komunitas', 'varian Jakarta'],
    accessKicker: 'Aksesibilitas',
    accessTitle: 'Dirancang aksesibel sejak awal',
    accessBody: 'Bukan lapisan tambahan, melainkan aturan yang mengikat setiap layar.',
    accessItems: [
      'Kontras WCAG 2.2 AA di seluruh layar: teks 4.5:1, komponen 3:1.',
      'Umpan balik selalu punya bentuk, posisi, dan teks, tidak pernah warna saja.',
      'Tanpa suara sama sekali. Tidak ada informasi yang hanya lewat audio.',
      'Menghormati prefers-reduced-motion: animasi antarmuka dipotong, isi tetap sama.',
      'Target sentuh minimal 48px, aksi utama 56px.',
      'Setiap latihan kamera punya jalur tanpa kamera.',
      'Video tidak pernah meninggalkan perangkat.',
    ],
    ctaTitle: 'Mulai dari satu isyarat.',
    ctaBody:
      'Tanpa akun, tanpa unduhan, tanpa suara. Dua puluh detik dari sekarang, Anda sudah memperagakan isyarat pertama.',
    footerLine: 'Halaman ini tidak memutar suara apa pun.',
    footerRegion: 'BISINDO Jakarta',
    footerMeta: 'Alat belajar bahasa untuk dua pihak. Kode terbuka.',
  },
  en: {
    langLabel: 'ID',
    navScenes: 'Scenes',
    navHow: 'How it works',
    navTry: 'Try a sign',
    navSignIn: 'Sign in',
    heroKicker: 'BISINDO Jakarta variant',
    heroTitle: 'BISINDO conversation practice inside transactions you actually live.',
    heroBody:
      'Five scenes, two roles. Learn each sign from a 3D character, perform it on camera, and get feedback on the spot.',
    heroCta: 'Try one sign in 20 seconds',
    heroSecondary: 'See the five scenes',
    heroStageTop: 'no sound, no music',
    heroStageBottom: 'live demo below',
    statSigns: 'signs',
    statScenes: 'scenes',
    statSides: 'roles',
    tryKicker: 'Quick practice',
    tryTitle: 'Try one sign, right now',
    tryBody: 'No account, no download. Done in 20 seconds.',
    trySteps: ['Watch the demo', 'Perform to camera', 'See the result'],
    tryMissing: 'The sample sign is being prepared. Pick a scene to start learning.',
    twoWayKicker: 'Two directions',
    twoWayTitle: 'One scene, two roles',
    twoWayBody: 'The conversation is the same. What changes: who you are, and what your task is.',
    sideDeaf: 'Deaf side',
    sideService: 'Barista side',
    deafRole: 'You are the customer',
    serviceRole: 'You are the person serving',
    deafChannel: 'outgoing, your hands',
    serviceChannel: 'incoming, their hands',
    deafTasks: ['Sign your request', 'Read the reply', 'Close with thanks'],
    serviceTasks: ['Read the customer’s signs', 'Answer clearly', 'Serve to the end'],
    twoWayNote:
      'The barista side is not the easy one: reading someone’s signs is harder than producing them.',
    scenariosKicker: 'Five scenes',
    scenariosTitle: 'Pick a place, not a word list',
    scenariosBody:
      'Scene colors live only on these cards. Inside the learning phase everything fades to neutral so your eyes stay on the hands.',
    scenarioMoods: {
      'kedai-kopi': 'Morning amber, teak wood',
      puskesmas: 'Calm green, waiting room',
      transportasi: 'Concrete, platform blue',
      'wawancara-kerja': 'Morning café, light wood',
      darurat: 'Daylight, calmest of all',
    } as Record<string, string>,
    scenarioSigns: 'signs',
    scenarioMinutes: 'min',
    scenarioCta: 'Start the scene',
    howKicker: 'How it works',
    howTitle: 'Four steps in every scene',
    howSteps: [
      ['Pick a scene', 'Choose your role first: Deaf side or service side.'],
      ['Learn each sign', '3D demo, three speeds, frame-by-frame pause.'],
      ['Practise on camera', 'Verified on your device, repeat as needed.'],
      ['Conversation exam', 'The full conversation, turn by turn.'],
    ],
    howRepo: 'Open the repository',
    validKicker: 'Language validation',
    validTitle: 'What decides whether a sign gets in',
    validBody:
      'Signs in Lakon are not taken from a dictionary and translated. Every sign comes from video of Deaf signers, and is reviewed by Deaf signers in a validation session. If they reject it, it stays out.',
    validChips: ['sourced from Deaf signers', 'community reviewed', 'Jakarta variant'],
    accessKicker: 'Accessibility',
    accessTitle: 'Accessible by design',
    accessBody: 'Not a layer on top, but rules that bind every screen.',
    accessItems: [
      'WCAG 2.2 AA contrast everywhere: text 4.5:1, components 3:1.',
      'Feedback always has shape, position, and text, never color alone.',
      'No sound at all. Nothing is conveyed only through audio.',
      'Respects prefers-reduced-motion: UI animation is cut, content stays.',
      'Touch targets at least 48px, primary actions 56px.',
      'Every camera exercise has a no-camera path.',
      'Video never leaves the device.',
    ],
    ctaTitle: 'Start with one sign.',
    ctaBody:
      'No account, no download, no sound. Twenty seconds from now, you will have performed your first sign.',
    footerLine: 'This page plays no sound at all.',
    footerRegion: 'BISINDO Jakarta',
    footerMeta: 'A language learning tool for both sides. Open source.',
  },
} as const

type Lang = keyof typeof copy

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

export function Landing() {
  const [lang, setLang] = useState<Lang>('id')
  const [side, setSide] = useState<'deaf' | 'service'>('deaf')
  const t = copy[lang]
  const other: Lang = lang === 'id' ? 'en' : 'id'

  const { content } = useContent()
  const scenarios = content
    ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
    : []
  const signs = content ? Object.values(content.signs).filter((sign) => sign.id !== 'uji-gerak') : []

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

  const roleCard = (value: 'deaf' | 'service') => {
    const active = side === value
    const tasks = value === 'deaf' ? t.deafTasks : t.serviceTasks
    const SideIcon = value === 'deaf' ? Hand : Eye
    return (
      <button
        key={value}
        type="button"
        aria-pressed={active}
        onClick={() => setSide(value)}
        className={`flex flex-col gap-3.5 rounded-3xl border-2 p-6 text-left transition-all ${
          active
            ? 'border-panggung bg-panggung text-halaman shadow-kartu-angkat'
            : 'border-border-halus bg-kartu shadow-kartu hover:border-border-tegas hover:-translate-y-0.5 hover:shadow-kartu-angkat'
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2.5 font-bold">
            <span
              aria-hidden
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                active ? 'bg-sorot/20 text-sorot' : 'bg-terangkat text-aksen'
              }`}
            >
              <SideIcon size={18} strokeWidth={2.25} />
            </span>
            {value === 'deaf' ? t.sideDeaf : t.sideService}
          </span>
          <span className={`font-mono text-xs ${active ? 'text-halaman/60' : 'text-teks-samar'}`}>
            {value === 'deaf' ? 'A' : 'B'}
          </span>
        </span>
        <span className="font-display text-2xl font-semibold">
          {value === 'deaf' ? t.deafRole : t.serviceRole}
        </span>
        <ol className="flex flex-col gap-2">
          {tasks.map((task, index) => (
            <li key={index} className="flex gap-2.5">
              <span
                aria-hidden
                className={`font-mono text-sm font-bold ${active ? 'text-sorot' : 'text-teks-samar'}`}
              >
                {index + 1}.
              </span>
              <span>{task}</span>
            </li>
          ))}
        </ol>
        <span
          className={`self-start rounded-lg border px-2.5 py-1 font-mono text-xs ${
            active ? 'border-halaman/30 text-halaman/85' : 'border-border-tegas text-teks-sekunder'
          }`}
        >
          {value === 'deaf' ? t.deafChannel : t.serviceChannel}
        </span>
      </button>
    )
  }

  return (
    <main ref={revealRootRef} lang={lang} className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-3.5">
          <p className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden className="text-sorot tracking-tighter">
              ▲▲▲
            </span>
            Lakon
          </p>
          <nav className="flex items-center gap-1 sm:gap-4">
            <a
              href="#adegan"
              className="hover:text-sorot hidden px-2 py-2 text-sm font-medium transition-colors md:inline-block"
            >
              {t.navScenes}
            </a>
            <a
              href="#cara"
              className="hover:text-sorot hidden px-2 py-2 text-sm font-medium transition-colors md:inline-block"
            >
              {t.navHow}
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
              aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke bahasa Indonesia'}
            >
              {t.langLabel}
            </button>
          </nav>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-12 lg:grid-cols-[11fr_9fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="animasi-masuk flex flex-col gap-6">
            <Kicker light>{t.heroKicker}</Kicker>
            <h1 className="font-display text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              {t.heroTitle}
            </h1>
            <p className="text-halaman/80 text-pretty text-lg leading-relaxed">{t.heroBody}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#coba" className="tombol-sorot text-center">
                {t.heroCta}
                <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
              </a>
              <a href="#adegan" className="tombol-garis-terang text-center">
                {t.heroSecondary}
              </a>
            </div>
            <dl className="divide-halaman/15 border-halaman/15 bg-halaman/5 mt-2 grid grid-cols-3 divide-x rounded-2xl border">
              {(
                [
                  [signs.length || 3, t.statSigns],
                  [scenarios.length || 5, t.statScenes],
                  [2, t.statSides],
                ] as const
              ).map(([value, label]) => (
                <div key={label} className="px-4 py-3.5 sm:px-5">
                  <dd className="font-display text-3xl font-semibold">{value}</dd>
                  <dt className="text-halaman/60 mt-0.5 text-sm">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div
            className="animasi-masuk border-halaman/10 bg-panggung-lantai aspect-4/3 relative overflow-hidden rounded-3xl border lg:aspect-auto lg:h-full lg:min-h-104"
            style={{ animationDelay: '120ms' }}
          >
            <div aria-hidden className="garis-tenda absolute inset-x-0 top-0 h-2.5" />
            <div aria-hidden className="sorot-kerucut absolute inset-0" />
            <div aria-hidden className="absolute inset-0 flex items-end justify-center pb-10">
              <div className="relative flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-[#332b21]" />
                <div className="mt-1 h-44 w-36 rounded-t-[3.5rem] bg-[#332b21]" />
                <div className="absolute -left-9 top-24 h-3.5 w-16 -rotate-45 rounded-full bg-[#4a4033]" />
                <div className="absolute -right-9 top-24 h-3.5 w-16 rotate-45 rounded-full bg-[#4a4033]" />
                <div className="absolute -left-12 top-[4.4rem] h-7 w-7 rounded-full bg-[#5f5240]" />
                <div className="absolute -right-12 top-[4.4rem] h-7 w-7 rounded-full bg-[#5f5240]" />
              </div>
            </div>
            <div
              aria-hidden
              className="absolute inset-x-6 bottom-6 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgb(217 165 33 / 0.5), transparent)',
              }}
            />
            <p className="text-halaman/90 border-halaman/15 absolute left-4 top-6 flex items-center gap-1.5 rounded-lg border bg-black/50 px-2.5 py-1 font-mono text-xs backdrop-blur-sm">
              <VolumeX aria-hidden size={13} />
              {t.heroStageTop}
            </p>
            <p className="text-halaman/90 border-halaman/15 absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border bg-black/50 px-2.5 py-1 font-mono text-xs backdrop-blur-sm">
              <Play aria-hidden size={13} />
              {t.heroStageBottom}
            </p>
          </div>
        </div>
      </section>

      <section
        id="coba"
        ref={trySectionRef}
        className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
      >
        <div data-ungkap>
          <Kicker>{t.tryKicker}</Kicker>
          <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{t.tryTitle}</h2>
          <p className="text-teks-sekunder mt-2 text-lg">{t.tryBody}</p>
          <ol className="mt-6 flex flex-wrap gap-2.5">
            {t.trySteps.map((step, index) => {
              const StepIcon = TRY_ICONS[index] ?? CheckCircle2
              return (
                <li
                  key={index}
                  className="border-border-halus bg-kartu shadow-kartu flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden
                    className="bg-panggung text-sorot flex h-7 w-7 items-center justify-center rounded-full"
                  >
                    <StepIcon size={14} strokeWidth={2.5} />
                  </span>
                  {step}
                </li>
              )
            })}
          </ol>
        </div>
        <div
          data-ungkap
          className="border-border-halus bg-kartu shadow-kartu-angkat mt-7 rounded-3xl border p-5 md:p-8"
        >
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
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div data-ungkap>
            <Kicker>{t.twoWayKicker}</Kicker>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{t.twoWayTitle}</h2>
            <p className="text-teks-sekunder mt-2 max-w-prose text-lg">{t.twoWayBody}</p>
          </div>
          <div data-ungkap className="mt-7 grid gap-4 md:grid-cols-2">
            {(['deaf', 'service'] as const).map((value) => roleCard(value))}
          </div>
          <p
            data-ungkap
            className="border-border-tegas bg-kartu shadow-kartu mt-5 flex items-start gap-3 rounded-2xl border px-5 py-4"
          >
            <span
              aria-hidden
              className="bg-panggung text-sorot mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            >
              <Info size={14} strokeWidth={2.5} />
            </span>
            {t.twoWayNote}
          </p>
        </div>
      </section>

      <section id="adegan" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div data-ungkap>
          <Kicker>{t.scenariosKicker}</Kicker>
          <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
            {t.scenariosTitle}
          </h2>
          <p className="text-teks-sekunder mt-2 max-w-prose text-lg">{t.scenariosBody}</p>
        </div>
        <div data-ungkap className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group border-border-halus bg-kartu shadow-kartu hover:shadow-kartu-angkat overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1.5"
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
                </div>
                <div className="flex flex-col gap-1.5 p-5">
                  <p className="font-display text-2xl font-semibold" style={{ color: palette.deep }}>
                    {scenario.title[lang === 'id' ? 'id' : 'en']}
                  </p>
                  <p className="text-teks-sekunder text-sm">{t.scenarioMoods[scenario.id] ?? ''}</p>
                  <p className="text-teks-samar mt-1 font-mono text-sm">
                    {signCount} {t.scenarioSigns}, ±{scenario.estimatedMinutes} {t.scenarioMinutes}
                  </p>
                  <span
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold"
                    style={{ color: palette.accent }}
                  >
                    {t.scenarioCta}
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
        </div>
      </section>

      <section id="cara" className="bg-terangkat">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div data-ungkap>
            <Kicker>{t.howKicker}</Kicker>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{t.howTitle}</h2>
          </div>
          <ol data-ungkap className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.howSteps.map(([title, body], index) => {
              const StepIcon = HOW_ICONS[index] ?? Hand
              return (
                <li
                  key={index}
                  className="border-border-halus bg-kartu shadow-kartu hover:shadow-kartu-angkat rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden
                      className="bg-sorot/15 text-aksen flex h-11 w-11 items-center justify-center rounded-xl"
                    >
                      <StepIcon size={22} strokeWidth={2.25} />
                    </span>
                    <span className="font-display text-aksen/60 text-3xl font-semibold">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold">{title}</p>
                  <p className="text-teks-sekunder mt-1.5 text-sm leading-relaxed">{body}</p>
                </li>
              )
            })}
          </ol>
          <p data-ungkap className="mt-6">
            <a
              href="https://github.com"
              className="tombol-sekunder inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
              rel="noreferrer"
              target="_blank"
            >
              <GitBranch aria-hidden size={18} />
              {t.howRepo}
            </a>
          </p>
        </div>
      </section>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div data-ungkap>
            <Kicker light>{t.validKicker}</Kicker>
            <h2 className="font-display mt-3 max-w-2xl text-balance text-3xl font-semibold sm:text-4xl">
              {t.validTitle}
            </h2>
            <p className="text-halaman/85 mt-5 max-w-prose text-lg leading-relaxed">{t.validBody}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {t.validChips.map((chip, index) => {
                const ChipIcon = VALID_ICONS[index] ?? Users
                return (
                  <span
                    key={chip}
                    className="border-halaman/25 text-halaman/90 bg-halaman/5 flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm transition-colors hover:border-sorot/60"
                  >
                    <ChipIcon aria-hidden size={15} className="text-sorot" />
                    {chip}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div data-ungkap>
          <Kicker>{t.accessKicker}</Kicker>
          <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">{t.accessTitle}</h2>
          <p className="text-teks-sekunder mt-2 max-w-prose text-lg">{t.accessBody}</p>
        </div>
        <ul data-ungkap className="mt-7 grid gap-4 sm:grid-cols-2">
          {t.accessItems.map((item, index) => {
            const ItemIcon = ACCESS_ICONS[index] ?? ShieldCheck
            return (
              <li
                key={index}
                className="border-border-halus bg-kartu shadow-kartu hover:shadow-kartu-angkat flex items-start gap-3.5 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="bg-berhasil/10 text-berhasil flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                >
                  <ItemIcon size={19} strokeWidth={2.25} />
                </span>
                <span className="pt-1.5">{item}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-kerucut absolute inset-0" />
        <div
          data-ungkap
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center md:py-28"
        >
          <h2 className="font-display text-balance text-4xl font-semibold sm:text-5xl">
            {t.ctaTitle}
          </h2>
          <p className="text-halaman/80 mt-4 max-w-prose text-pretty text-lg">{t.ctaBody}</p>
          <a href="#coba" className="tombol-sorot mt-8">
            {t.heroCta}
            <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <footer className="bg-panggung text-halaman/60 border-halaman/10 border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm">
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
