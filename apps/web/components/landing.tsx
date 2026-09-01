'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useContent } from '@/features/content/use-content'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const TrySignBlock = dynamic(() => import('@/components/try-sign-block'), {
  ssr: false,
  loading: () => <p className="text-teks-sekunder">Memuat…</p>,
})

const copy = {
  id: {
    langLabel: 'EN',
    navTry: 'Langsung coba isyarat',
    navSignIn: 'Masuk',
    heroKicker: 'BISINDO · Varian Jakarta',
    heroTitle: 'Latihan percakapan BISINDO di dalam transaksi yang benar-benar Anda jalani.',
    heroBody:
      'Lima adegan, dua peran. Pelajari isyarat dari peragaan karakter 3D, peragakan di depan kamera, umpan baliknya muncul di tempat.',
    heroCta: 'Coba satu isyarat · 20 detik',
    heroSecondary: 'Lihat lima adegan',
    heroStageTop: 'tanpa suara, tanpa musik',
    heroStageBottom: 'peragaan langsung · di bawah',
    statSigns: 'isyarat draf',
    statScenes: 'adegan',
    statSides: 'arah',
    tryKicker: 'Latihan singkat',
    tryTitle: 'Coba satu isyarat, sekarang',
    tryBody: 'Tanpa akun, tanpa unduhan. Selesai dalam 20 detik.',
    trySteps: ['Lihat peragaan', 'Peragakan ke kamera', 'Lihat hasil'],
    tryMissing:
      'Isyarat contoh belum tersedia karena menunggu validasi penanda Tuli. Fitur ini aktif setelah sesi validasi.',
    twoWayKicker: 'Dua arah',
    twoWayTitle: 'Satu adegan, dua peran',
    twoWayBody: 'Struktur percakapannya sama. Yang berubah: siapa Anda, dan apa tugas Anda.',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi barista',
    deafRole: 'Anda pelanggan atau warga',
    serviceRole: 'Anda petugas yang melayani',
    deafChannel: 'keluar · tangan Anda',
    serviceChannel: 'masuk · tangan pelanggan',
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
      'wawancara-kerja': 'Kayu terang, kertas',
      darurat: 'Cahaya siang, paling tenang',
    } as Record<string, string>,
    scenarioSigns: 'isyarat',
    scenarioMinutes: 'menit',
    scenarioSides: 'dua arah',
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
      'Bentuk isyarat di Lakon tidak diambil dari kamus lalu diterjemahkan. Setiap draf bersumber dari video penanda Tuli, dan hanya menjadi resmi setelah diperiksa penanda Tuli dalam sesi validasi. Kalau mereka menolak, isyarat itu tidak masuk.',
    validStatus: (draft: number, approved: number) =>
      `${draft} isyarat draf bersumber penanda Tuli · ${approved} tervalidasi · menunggu sesi validasi`,
    limitsKicker: 'Terus terang',
    limitsTitle: 'Aksesibilitas dan batasan',
    limitsBody:
      'Yang sudah dipenuhi dan yang belum, dalam satu tampilan. Daftar kanan bukan permintaan maaf, melainkan batas kerja yang sedang berlaku.',
    doneTitle: 'Sudah dipenuhi',
    done: [
      'Kontras WCAG 2.2 AA di seluruh layar: teks 4.5:1, komponen 3:1.',
      'Umpan balik selalu punya bentuk, posisi, dan teks — tidak pernah warna saja.',
      'Tanpa suara sama sekali. Tidak ada informasi yang hanya lewat audio.',
      'Menghormati prefers-reduced-motion: animasi antarmuka dipotong, isi tetap sama.',
      'Target sentuh minimal 48px, aksi utama 56px.',
      'Setiap latihan kamera punya jalur tanpa kamera.',
      'Video tidak pernah meninggalkan perangkat.',
    ],
    notYetTitle: 'Belum bisa',
    notYet: [
      'Baru varian Jakarta yang dituju; satu draf masih memakai sumber varian Jawa Timur, berlabel jelas.',
      'Isyarat yang ada berstatus draf — menunggu sesi validasi penanda Tuli.',
      'Mode SIBI belum ada; Lakon belum melayani itu.',
      'Akurasi menurun saat kedua tangan bertumpuk.',
      'Ekspresi non-manual diperagakan karakter, tapi belum dinilai otomatis dari kamera.',
    ],
    footerLine: 'Halaman ini tidak memutar suara apa pun.',
    footerMeta: 'alat belajar bahasa untuk dua pihak · kode terbuka',
  },
  en: {
    langLabel: 'ID',
    navTry: 'Try a sign now',
    navSignIn: 'Sign in',
    heroKicker: 'BISINDO · Jakarta variant',
    heroTitle: 'BISINDO conversation practice inside transactions you actually live.',
    heroBody:
      'Five scenes, two roles. Learn each sign from a 3D character, perform it on camera, and get feedback on the spot.',
    heroCta: 'Try one sign · 20 seconds',
    heroSecondary: 'See the five scenes',
    heroStageTop: 'no sound, no music',
    heroStageBottom: 'live demo · below',
    statSigns: 'draft signs',
    statScenes: 'scenes',
    statSides: 'roles',
    tryKicker: 'Quick practice',
    tryTitle: 'Try one sign, right now',
    tryBody: 'No account, no download. Done in 20 seconds.',
    trySteps: ['Watch the demo', 'Perform to camera', 'See the result'],
    tryMissing:
      'The sample sign is not available yet because it awaits validation by Deaf signers. This block activates after the validation session.',
    twoWayKicker: 'Two directions',
    twoWayTitle: 'One scene, two roles',
    twoWayBody: 'The conversation is the same. What changes: who you are, and what your task is.',
    sideDeaf: 'Deaf side',
    sideService: 'Barista side',
    deafRole: 'You are the customer',
    serviceRole: 'You are the person serving',
    deafChannel: 'outgoing · your hands',
    serviceChannel: 'incoming · their hands',
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
      'wawancara-kerja': 'Light wood, paper',
      darurat: 'Daylight, calmest of all',
    } as Record<string, string>,
    scenarioSigns: 'signs',
    scenarioMinutes: 'min',
    scenarioSides: 'two roles',
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
      'Signs in Lakon are not taken from a dictionary and translated. Every draft comes from video of Deaf signers, and becomes official only after Deaf signers review it in a validation session. If they reject it, it stays out.',
    validStatus: (draft: number, approved: number) =>
      `${draft} draft signs sourced from Deaf signers · ${approved} validated · awaiting the validation session`,
    limitsKicker: 'Plainly stated',
    limitsTitle: 'Accessibility and limits',
    limitsBody:
      'What is already met and what is not, in one view. The right-hand list is not an apology — it is the current working boundary.',
    doneTitle: 'Already met',
    done: [
      'WCAG 2.2 AA contrast everywhere: text 4.5:1, components 3:1.',
      'Feedback always has shape, position, and text — never color alone.',
      'No sound at all. Nothing is conveyed only through audio.',
      'Respects prefers-reduced-motion: UI animation is cut, content stays.',
      'Touch targets at least 48px, primary actions 56px.',
      'Every camera exercise has a no-camera path.',
      'Video never leaves the device.',
    ],
    notYetTitle: 'Not yet',
    notYet: [
      'Jakarta variant is the target; one draft still uses an East Java source, clearly labeled.',
      'Existing signs are drafts — awaiting the Deaf validation session.',
      'No SIBI mode; Lakon does not cover it yet.',
      'Accuracy drops when both hands overlap.',
      'Non-manual markers are performed by the character but not yet scored from camera.',
    ],
    footerLine: 'This page plays no sound at all.',
    footerMeta: 'a language learning tool for both sides · open source',
  },
} as const

type Lang = keyof typeof copy

const Kicker = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p
    className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-halaman/70' : 'text-teks-samar'}`}
  >
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
  const draftCount = signs.filter((sign) => sign.review.status !== 'approved').length
  const approvedCount = signs.length - draftCount

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

  const roleCard = (value: 'deaf' | 'service') => {
    const active = side === value
    const tasks = value === 'deaf' ? t.deafTasks : t.serviceTasks
    return (
      <button
        key={value}
        type="button"
        aria-pressed={active}
        onClick={() => setSide(value)}
        className={`flex flex-col gap-3 rounded-3xl border-2 p-5 text-left transition-colors ${
          active ? 'border-teks bg-teks text-halaman' : 'border-border-halus bg-kartu'
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-bold">
            <span
              aria-hidden
              className={`inline-block h-4 w-4 rounded-full border-2 ${
                active ? 'border-halaman bg-halaman' : 'border-border-tegas'
              }`}
            />
            {value === 'deaf' ? t.sideDeaf : t.sideService}
          </span>
          <span className={`font-mono text-xs ${active ? 'text-halaman/70' : 'text-teks-samar'}`}>
            {value === 'deaf' ? 'arah A' : 'arah B'}
          </span>
        </span>
        <span className="text-lg font-bold">{value === 'deaf' ? t.deafRole : t.serviceRole}</span>
        <ol className="flex flex-col gap-1.5">
          {tasks.map((task, index) => (
            <li key={index} className="flex gap-2">
              <span
                aria-hidden
                className={`font-mono text-sm font-bold ${active ? 'text-halaman/70' : 'text-teks-samar'}`}
              >
                {index + 1}.
              </span>
              <span>{task}</span>
            </li>
          ))}
        </ol>
        <span
          className={`self-start rounded-lg border px-2.5 py-1 font-mono text-xs ${
            active ? 'border-halaman/40 text-halaman/90' : 'border-border-tegas text-teks-sekunder'
          }`}
        >
          {value === 'deaf' ? t.deafChannel : t.serviceChannel}
        </span>
      </button>
    )
  }

  return (
    <main lang={lang} className="flex min-h-dvh flex-col">
      <header className="border-border-halus mx-auto flex w-full max-w-6xl items-center justify-between gap-3 border-b px-6 py-4">
        <p className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden className="text-peringatan tracking-tighter">
            ▲▲▲
          </span>
          Lakon
        </p>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href="#coba"
            className="tombol-sekunder hidden px-4 py-1.5 text-sm sm:inline-block"
            style={{ minHeight: 44 }}
          >
            {t.navTry}
          </a>
          <Link href="/masuk" className="px-2 underline underline-offset-4">
            {t.navSignIn}
          </Link>
          <button
            type="button"
            onClick={() => setLang(other)}
            className="tombol-sekunder px-3 py-1.5 font-mono text-sm"
            style={{ minHeight: 44 }}
            aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke bahasa Indonesia'}
          >
            {t.langLabel}
          </button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[5fr_6fr] md:items-center md:py-16">
        <div className="bg-zona-tenang zona-tenang-gradasi aspect-4/3 relative order-2 overflow-hidden rounded-3xl md:order-1">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-2"
            style={{
              background: 'repeating-linear-gradient(90deg, #b4632c 0 10px, transparent 10px 20px)',
            }}
          />
          <div aria-hidden className="absolute inset-0 flex items-end justify-center pb-6">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-[#2b2f3a]" />
              <div className="mt-1 h-40 w-32 rounded-t-[3rem] bg-[#2b2f3a]" />
            </div>
          </div>
          <p className="text-halaman absolute left-3 top-4 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
            {t.heroStageTop}
          </p>
          <p className="text-halaman absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
            {t.heroStageBottom}
          </p>
        </div>
        <div className="order-1 flex flex-col gap-5 md:order-2">
          <Kicker>{t.heroKicker}</Kicker>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="text-pretty text-lg">{t.heroBody}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#coba" className="tombol-utama text-center">
              {t.heroCta}
            </a>
            <a href="#adegan" className="tombol-sekunder text-center">
              {t.heroSecondary}
            </a>
          </div>
          <dl className="border-border-halus divide-border-halus mt-2 flex divide-x rounded-2xl border">
            {(
              [
                [signs.length, t.statSigns],
                [scenarios.length || 5, t.statScenes],
                [2, t.statSides],
              ] as const
            ).map(([value, label]) => (
              <div key={label} className="flex-1 px-4 py-3">
                <dt className="text-teks-samar text-sm">{label}</dt>
                <dd className="font-mono text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="coba" ref={trySectionRef} className="mx-auto w-full max-w-6xl px-6 py-14">
        <Kicker>{t.tryKicker}</Kicker>
        <h2 className="mt-2 text-3xl font-bold">{t.tryTitle}</h2>
        <p className="text-teks-sekunder mt-1">{t.tryBody}</p>
        <ol className="mt-5 flex flex-wrap gap-2">
          {t.trySteps.map((step, index) => (
            <li
              key={index}
              className="border-border-halus bg-kartu flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            >
              <span className="bg-teks text-halaman flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="border-border-halus bg-kartu mt-6 rounded-3xl border p-5 md:p-8">
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
          <Kicker>{t.twoWayKicker}</Kicker>
          <h2 className="mt-2 text-3xl font-bold">{t.twoWayTitle}</h2>
          <p className="text-teks-sekunder mt-1 max-w-prose">{t.twoWayBody}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(['deaf', 'service'] as const).map((value) => roleCard(value))}
          </div>
          <p className="border-border-tegas mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3">
            <span
              aria-hidden
              className="bg-teks text-halaman mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
            >
              !
            </span>
            {t.twoWayNote}
          </p>
        </div>
      </section>

      <section id="adegan" className="mx-auto w-full max-w-6xl px-6 py-14">
        <Kicker>{t.scenariosKicker}</Kicker>
        <h2 className="mt-2 text-3xl font-bold">{t.scenariosTitle}</h2>
        <p className="text-teks-sekunder mt-1 max-w-prose">{t.scenariosBody}</p>
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
                className={`${palette.kelas} border-border-halus overflow-hidden rounded-3xl border transition-transform hover:-translate-y-0.5`}
                style={{ backgroundColor: palette.tint }}
              >
                <div
                  aria-hidden
                  className="relative h-24"
                  style={{ backgroundColor: palette.ambient }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 h-8"
                    style={{ backgroundColor: palette.accent, opacity: 0.55 }}
                  />
                  <span className="text-halaman absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 font-mono text-xs font-bold">
                    S{index + 1}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-5">
                  <p className="text-xl font-bold" style={{ color: palette.deep }}>
                    {scenario.title[lang === 'id' ? 'id' : 'en']}
                  </p>
                  <p className="text-sm" style={{ color: palette.deep }}>
                    {t.scenarioMoods[scenario.id] ?? ''}
                  </p>
                  <p className="mt-1 font-mono text-sm" style={{ color: palette.deep }}>
                    {signCount} {t.scenarioSigns} · ±{scenario.estimatedMinutes} {t.scenarioMinutes}
                  </p>
                  <span
                    className="mt-1 self-start rounded-md border px-2 py-0.5 font-mono text-xs"
                    style={{ borderColor: palette.deep, color: palette.deep }}
                  >
                    {t.scenarioSides}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <Kicker>{t.howKicker}</Kicker>
          <h2 className="mt-2 text-3xl font-bold">{t.howTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.howSteps.map(([title, body], index) => (
              <li key={index} className="border-border-halus bg-kartu rounded-2xl border p-5">
                <p className="text-teks-samar font-mono text-sm font-bold">0{index + 1}</p>
                <p className="mt-2 text-lg font-bold">{title}</p>
                <p className="text-teks-sekunder mt-1 text-sm">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5">
            <a
              href="https://github.com"
              className="tombol-sekunder inline-block"
              rel="noreferrer"
              target="_blank"
            >
              {t.howRepo}
            </a>
          </p>
        </div>
      </section>

      <section className="bg-teks text-halaman">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <Kicker light>{t.validKicker}</Kicker>
          <h2 className="mt-2 max-w-2xl text-balance text-3xl font-bold">{t.validTitle}</h2>
          <p className="text-halaman/85 mt-4 max-w-prose text-lg">{t.validBody}</p>
          <p className="border-halaman/30 text-halaman/90 mt-6 inline-block rounded-xl border px-4 py-2 font-mono text-sm">
            {t.validStatus(draftCount, approvedCount)}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <Kicker>{t.limitsKicker}</Kicker>
        <h2 className="mt-2 text-3xl font-bold">{t.limitsTitle}</h2>
        <p className="text-teks-sekunder mt-1 max-w-prose">{t.limitsBody}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="border-border-halus bg-kartu rounded-3xl border p-5">
            <p className="text-lg font-bold">{t.doneTitle}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {t.done.map((item, index) => (
                <li key={index} className="flex gap-2.5">
                  <span aria-hidden className="text-berhasil font-bold">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border-tegas bg-terangkat rounded-3xl border p-5">
            <p className="text-lg font-bold">{t.notYetTitle}</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {t.notYet.map((item, index) => (
                <li key={index} className="flex gap-2.5">
                  <span aria-hidden className="text-teks-samar font-bold">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-border-halus border-t">
        <div className="text-teks-samar mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-8 text-sm">
          <p className="font-mono">{t.footerLine}</p>
          <p>Lakon · BISINDO Jakarta · {t.footerMeta}</p>
        </div>
      </footer>
    </main>
  )
}
