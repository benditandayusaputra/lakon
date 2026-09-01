'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Coffee,
  DoorOpen,
  Flame,
  Hand,
  QrCode,
  ReceiptText,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario, ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { SyncBadge } from '@/components/sync-badge'
import {
  ArtMinuman,
  FasadKedai,
  KartuQris,
  LampuTali,
  PanggungBarista,
  PapanMenuKapur,
  TanamanGantung,
  type PoseBarista,
} from '@/components/kedai-kopi-scene'
import { useCompilerRig } from '@/features/avatar/use-rig'
import { useContent } from '@/features/content/use-content'
import {
  createScenarioEngine,
  summarizeRun,
  type Direction,
  type ScenarioEngine,
} from '@/features/scenario/engine'
import { createLearningPhase, type LearningPhase } from '@/features/scenario/learning'
import { saveRun, saveSignProgress } from '@/features/progress/store'

type Tahap = 'luar' | 'belajar' | 'ujian' | 'struk'

const prettify = (id: string) => id.replace(/-/g, ' ')

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

const MENU_UTAMA = [
  { opsi: 'Kopi', nama: 'Kopi Susu', sub: 'Espresso, susu segar, gula aren', harga: 20000 },
  { opsi: 'Teh', nama: 'Teh Melati', sub: 'Daun melati diseduh hangat', harga: 12000 },
  { opsi: 'Cokelat', nama: 'Cokelat Panas', sub: 'Cokelat kental, susu steamed', harga: 25000 },
]

const LANGKAH = [
  { id: 'sapa', label: 'Sapa', Icon: Hand },
  { id: 'pesan', label: 'Pesan', Icon: Coffee },
  { id: 'suhu', label: 'Suhu', Icon: Flame },
  { id: 'harga', label: 'Harga', Icon: ReceiptText },
  { id: 'bayar', label: 'Bayar', Icon: QrCode },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
]

const POSE_SIMPUL: Record<string, PoseBarista> = {
  sapa: 'lambai',
  pesan: 'tunjuk',
  suhu: 'netral',
  harga: 'tunjuk',
  bayar: 'tunjuk',
  tutup: 'sajikan',
}

const simpulUtama = (nodeId: string) => nodeId.replace(/^repair-/, '')

export function KedaiKopiFlow() {
  const scenarioId = 'kedai-kopi'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<Tahap>('luar')
  const [membuka, setMembuka] = useState(false)
  const { rig, error: rigError } = useCompilerRig(tahap !== 'luar')
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
  const [pesanan, setPesanan] = useState<(typeof MENU_UTAMA)[number] | null>(null)
  const [, forceUpdate] = useReducer((tick: number) => tick + 1, 0)
  const startedAtRef = useRef<number>(Date.now())
  const endedAtRef = useRef<number>(Date.now())
  const pintuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const learningRef = useRef<LearningPhase | null>(null)
  const engineRef = useRef<ScenarioEngine | null>(null)
  const compiledCache = useRef(new Map<string, CompiledSign | null>())

  const learning = useMemo(() => {
    if (!scenario) return null
    learningRef.current = createLearningPhase(scenario)
    return learningRef.current
  }, [scenario])

  const engine = useMemo(() => {
    if (!scenario) return null
    engineRef.current = createScenarioEngine(scenario, direction)
    return engineRef.current
  }, [scenario, direction])

  useEffect(
    () => () => {
      if (pintuTimer.current) clearTimeout(pintuTimer.current)
    },
    [],
  )

  const getCompiled = useCallback(
    (signId: string): CompiledSign | null => {
      if (!content || !rig) return null
      if (compiledCache.current.has(signId)) return compiledCache.current.get(signId) ?? null
      const sign = content.signs[signId]
      let compiled: CompiledSign | null = null
      if (sign) {
        try {
          compiled = compileSign(sign, content.handshapes, rig)
        } catch {
          compiled = null
        }
      }
      compiledCache.current.set(signId, compiled)
      return compiled
    },
    [content, rig],
  )

  if (contentError || rigError) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p role="alert">{contentError ?? rigError}</p>
        <p className="mt-4">
          <Link href="/skenario" className="underline underline-offset-4">
            Kembali ke daftar skenario
          </Link>
        </p>
      </main>
    )
  }

  if (!content || !scenario || !learning || !engine) {
    return (
      <main className="kk-langit flex min-h-dvh items-center justify-center px-6">
        <p aria-live="polite" className="text-lg font-bold text-[#f5e9d7]">
          {content && !scenario ? 'Skenario tidak ditemukan.' : 'Menyiapkan kedai…'}
        </p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const rigLoading = tahap !== 'luar' && !rig && !rigError
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

  const masukKedai = () => {
    if (membuka) return
    setMembuka(true)
    startedAtRef.current = Date.now()
    const cepat =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pintuTimer.current = setTimeout(() => setTahap('belajar'), cepat ? 120 : 1250)
  }

  const persistSign = (signId: string) => {
    const progress = learning.progressFor(signId)
    if (!progress) return
    void saveSignProgress({
      signId,
      status: progress.status === 'belum' ? 'berlatih' : progress.status,
      attempts: progress.attempts,
    })
  }

  const finishExam = () => {
    endedAtRef.current = Date.now()
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    void saveRun({
      scenarioId: scenario.id,
      direction,
      durationMs: summary.durationMs,
      mastered: summary.mastered,
      needsRepeat: summary.needsRepeat,
      completedAt: Date.now(),
    })
    setTahap('struk')
  }

  const majuSetelah = (moved: string) => {
    if (moved === 'selesai') finishExam()
    forceUpdate()
  }

  const node = engine.current()
  const task = engine.currentTask()
  const idUtama = node ? simpulUtama(node.id) : 'tutup'
  const pose: PoseBarista = POSE_SIMPUL[idUtama] ?? 'netral'
  const langkahIndex = LANGKAH.findIndex((langkah) => langkah.id === idUtama)

  const kepala = (gelap: boolean) => (
    <header
      className={`relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 ${
        gelap ? 'text-[#f5e9d7]' : 'text-teks'
      }`}
    >
      <Link
        href="/skenario"
        className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Skenario
      </Link>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold sm:text-base">
          <span className="font-display">Kedai Kopi</span>
          <span className={gelap ? 'text-[#e0b98a]' : 'text-teks-sekunder'}> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'luar') {
    return (
      <main className="kk-langit flex min-h-dvh flex-col">
        {kepala(true)}
        <FasadKedai
          membuka={membuka}
          onMasuk={masukKedai}
          papanInfo={
            <div className="relative z-10 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-8">
              <div className="kk-papan-kapur w-60 -rotate-2 rounded-lg p-4 shadow-xl">
                <p className="kk-font-kapur text-center text-xl leading-tight text-[#ece7d6]">
                  {scenario.title.id}
                </p>
                <div className="mx-auto my-2 h-px w-20 bg-[#ece7d6]/40" />
                <ul className="kk-font-kapur space-y-0.5 text-base text-[#d9d3bd]">
                  <li>✎ {learning.order().length} isyarat baru</li>
                  <li>✎ 1 percakapan lengkap</li>
                  <li>✎ ± {scenario.estimatedMinutes ?? 12} menit</li>
                  <li>✎ peran: {directionLabel}</li>
                </ul>
                <div className="mx-auto mt-2 flex justify-center gap-1" aria-hidden>
                  <span className="h-1 w-1 rounded-full bg-[#ffce8a]" />
                  <span className="h-1 w-1 rounded-full bg-[#ffce8a]" />
                  <span className="h-1 w-1 rounded-full bg-[#ffce8a]" />
                </div>
              </div>
              <button
                type="button"
                onClick={masukKedai}
                disabled={membuka}
                className="tombol-sorot"
              >
                <DoorOpen aria-hidden className="h-5 w-5" />
                {membuka ? 'Membuka pintu…' : 'Buka pintu & masuk'}
              </button>
            </div>
          }
        />
      </main>
    )
  }

  if (tahap === 'struk') {
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    const minutes = Math.max(1, Math.round(summary.durationMs / 60000))
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const needsRepeat = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !needsRepeat.includes(sign))
    const item = pesanan ?? MENU_UTAMA[0]!
    const waktu = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    return (
      <main className="kk-interior flex min-h-dvh flex-col">
        {kepala(true)}
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-14 sm:px-6">
          <LampuTali aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-7 w-full opacity-80" />
          <div className="kk-muncul relative z-10 mt-6 w-full max-w-md">
            <div className="kk-gerigi-atas rotate-180" aria-hidden />
            <div className="bg-[#fdfbf3] px-6 py-6 font-mono text-sm text-[#2b2620] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] sm:px-8">
              <div className="text-center">
                <Coffee aria-hidden className="mx-auto h-7 w-7 text-[#6b4226]" />
                <p className="font-display mt-1 text-xl font-black tracking-[0.2em]">KOPI LAKON</p>
                <p className="mt-0.5 text-xs text-[#5c554a]">Kedai kopi ramah isyarat</p>
                <p className="text-xs text-[#5c554a]">Jl. Cikini Raya No. 5, Jakarta</p>
                <p className="mt-1 text-xs text-[#5c554a]">{waktu}</p>
              </div>
              <div className="my-3 border-t border-dashed border-[#b0a591]" />
              <div className="flex justify-between gap-2">
                <span>1× {item.nama} (Panas)</span>
                <span>{rupiah(item.harga)}</span>
              </div>
              <div className="my-3 border-t border-dashed border-[#b0a591]" />
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span>{rupiah(item.harga)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-[#5c554a]">
                <span>Pembayaran</span>
                <span>QRIS · LUNAS</span>
              </div>
              <div className="my-3 border-t border-dashed border-[#b0a591]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#256b45]">
                ✓ Isyarat dikuasai
              </p>
              <ul className="mt-1 space-y-0.5 capitalize">
                {dikuasai.length > 0 ? (
                  dikuasai.map((sign) => (
                    <li key={sign} className="flex items-center gap-2">
                      <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-[#256b45]" />
                      {prettify(sign)}
                    </li>
                  ))
                ) : (
                  <li>tidak ada</li>
                )}
              </ul>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#46536a]">
                ↻ Perlu diulang
              </p>
              <ul className="mt-1 space-y-0.5 capitalize">
                {needsRepeat.length > 0 ? (
                  needsRepeat.map((sign) => (
                    <li key={sign} className="flex items-center gap-2">
                      <RotateCcw aria-hidden className="h-3.5 w-3.5 text-[#46536a]" />
                      {prettify(sign)}
                    </li>
                  ))
                ) : (
                  <li>tidak ada</li>
                )}
              </ul>
              <div className="my-3 border-t border-dashed border-[#b0a591]" />
              <p className="flex items-center justify-between text-xs text-[#5c554a]">
                <span className="flex items-center gap-1.5">
                  <Clock3 aria-hidden className="h-3.5 w-3.5" />± {minutes} menit
                </span>
                <span>{summary.path.length} langkah percakapan</span>
              </p>
              <p className="kk-font-kapur mt-4 text-center text-xl text-[#6b4226]">
                Terima kasih, sampai jumpa lagi! ✋
              </p>
              <p className="mt-1 text-center text-[10px] tracking-[0.3em] text-[#b0a591]">
                * * * * * * * * * * * *
              </p>
            </div>
            <div className="kk-gerigi-bawah" aria-hidden />
          </div>
          <div className="kk-muncul z-10 mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: '160ms' }}>
            <button
              type="button"
              onClick={() => {
                engine.reset()
                startedAtRef.current = Date.now()
                setPesanan(null)
                setMembuka(false)
                setLearnView('demo')
                setTahap('luar')
                forceUpdate()
              }}
              className="tombol-sorot"
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              Ulangi kunjungan
            </button>
            <Link href="/skenario" className="tombol-garis-terang">
              Skenario lain
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="kk-interior flex min-h-dvh flex-col">
      {kepala(true)}
      <LampuTali aria-hidden className="pointer-events-none h-7 w-full opacity-80" />

      {tahap === 'belajar' ? (
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-12 pt-2 sm:px-6">
          <TanamanGantung aria-hidden className="pointer-events-none absolute -top-7 right-[2%] hidden w-16 xl:block" />
          {rigLoading ? (
            <div className="kk-kertas mx-auto mt-10 flex w-fit items-center gap-3 rounded-2xl px-6 py-4 shadow-lg">
              <Coffee aria-hidden className="h-5 w-5 animate-pulse text-[#6b4226]" />
              <p aria-live="polite" className="font-bold">
                Barista menyiapkan peraga…
              </p>
            </div>
          ) : currentSignId === null ? (
            <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div className="kk-muncul kk-kertas flex flex-col items-start gap-4 rounded-3xl p-6 shadow-xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a5f10]">
                  Latihan selesai
                </p>
                <h1 className="font-display text-3xl font-bold sm:text-4xl">
                  Semua isyarat siap dipakai
                </h1>
                <p className="max-w-prose text-lg">
                  Sekarang giliranmu memesan sungguhan. Barista sudah menunggu di kasir. Kamu
                  berperan sebagai {directionLabel}.
                </p>
                <div className="flex flex-wrap gap-2" aria-hidden>
                  {learning.order().map((id) => (
                    <span
                      key={id}
                      className="rounded-full border border-[#c9b695] bg-white/70 px-3 py-1 text-sm font-bold capitalize"
                    >
                      ✓ {prettify(id)}
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => setTahap('ujian')} className="tombol-sorot">
                  <Coffee aria-hidden className="h-5 w-5" />
                  Menuju kasir
                </button>
              </div>
              <div className="hidden justify-center lg:flex">
                <PapanMenuKapur className="w-60 rotate-1" />
              </div>
            </div>
          ) : (
            (() => {
              const progress = learning.progressFor(currentSignId)!
              const orderIndex = learning.order().indexOf(currentSignId)
              const compiled = getCompiled(currentSignId)
              const sign = content.signs[currentSignId]
              return (
                <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_232px]">
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="kk-kertas flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-lg">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a5f10]">
                          Latihan sebelum memesan
                        </p>
                        <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
                          {prettify(currentSignId)}
                        </h1>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-teks-sekunder font-mono text-sm">
                          {orderIndex + 1} / {learning.order().length}
                        </p>
                        <div aria-hidden className="flex items-center gap-1.5">
                          {learning.order().map((id, index) => (
                            <svg key={id} viewBox="0 0 20 24" className="h-5 w-4">
                              <path
                                d="M10 2 C17 6 17 18 10 22 C3 18 3 6 10 2 Z"
                                fill={index < orderIndex ? '#6b4226' : index === orderIndex ? '#d9a521' : 'transparent'}
                                stroke="#6b4226"
                                strokeWidth="1.6"
                              />
                              <path d="M10 4 C12 10 8 14 10 20" fill="none" stroke={index <= orderIndex ? '#f8efdf' : '#b0a591'} strokeWidth="1.4" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                    {compiled && sign ? (
                      learnView === 'demo' ? (
                        <div className="kk-muncul flex flex-col gap-4">
                          <AvatarStage
                            compiled={compiled}
                            showControls
                            signLabel={sign.gloss.id}
                            stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-3xl border-4 border-[#2b1a0e]/30 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]"
                            className="h-[52vh] min-h-88 sm:h-[58vh]"
                          />
                          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                            <div className="kk-kertas rounded-2xl p-4 shadow-lg">
                              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a5f10]">
                                Isyarat ini
                              </p>
                              <p className="font-display mt-1 text-xl font-bold">{sign.gloss.id}</p>
                              <p className="text-teks-sekunder">{sign.gloss.en}</p>
                              <p className="text-teks-sekunder mt-2 text-sm">
                                {sign.review.status === 'approved'
                                  ? '✓ tervalidasi penanda Tuli'
                                  : 'draf, belum divalidasi penanda Tuli'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLearnView('praktik')}
                              className="tombol-sorot w-full text-lg md:w-auto md:self-end md:px-10"
                            >
                              Lanjut ke praktik →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="kk-muncul kk-kertas flex flex-col gap-4 rounded-3xl p-4 shadow-xl sm:p-5">
                          <PracticeBlock
                            compiled={compiled}
                            signLabel={sign.gloss.id}
                            onPassed={() => {
                              learning.recordResult(currentSignId, true)
                              persistSign(currentSignId)
                              setLearnView('demo')
                              forceUpdate()
                            }}
                            onFailedAttempt={() => {
                              learning.recordResult(currentSignId, false)
                              persistSign(currentSignId)
                              forceUpdate()
                            }}
                            onSelfAssessed={() => {
                              learning.selfAssessPass(currentSignId)
                              persistSign(currentSignId)
                              setLearnView('demo')
                              forceUpdate()
                            }}
                          />
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setLearnView('demo')}
                              className="tombol-sekunder bg-white/70"
                            >
                              ← Lihat peragaan lagi
                            </button>
                            {progress.attempts > 0 ? (
                              <p className="text-teks-samar text-sm">
                                percobaan: {progress.attempts}, gagal beruntun:{' '}
                                {progress.consecutiveFailures}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="kk-kertas flex flex-col gap-3 rounded-2xl p-5 shadow-lg">
                        <p>
                          Isyarat <span className="font-bold">{prettify(currentSignId)}</span> belum
                          punya peragaan karena bentuknya belum divalidasi penanda Tuli.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            learning.selfAssessPass(currentSignId)
                            persistSign(currentSignId)
                            forceUpdate()
                          }}
                          className="tombol-sekunder self-start bg-white/70"
                        >
                          Lewati dulu
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="hidden flex-col items-center gap-5 lg:flex">
                    <PapanMenuKapur className="w-full rotate-1" />
                    <div className="kk-papan-kapur w-full -rotate-1 rounded-xl p-3 text-center">
                      <p className="kk-font-kapur text-lg text-[#d9d3bd]">
                        Hafalkan dulu, nanti dipakai saat memesan ke barista ☕
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </div>
      ) : null}

      {tahap === 'ujian' && node ? (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-12 pt-1 sm:px-6">
          <nav aria-label="Langkah percakapan" className="kk-kertas mx-auto w-full max-w-3xl rounded-full px-4 py-2 shadow-lg">
            <ol className="flex items-center justify-between gap-1">
              {LANGKAH.map(({ id, label, Icon }, index) => {
                const status =
                  index < langkahIndex ? 'lewat' : index === langkahIndex ? 'aktif' : 'nanti'
                return (
                  <li key={id} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
                    <span
                      aria-current={status === 'aktif' ? 'step' : undefined}
                      title={label}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        status === 'lewat'
                          ? 'border-[#6b4226] bg-[#6b4226] text-[#f8efdf]'
                          : status === 'aktif'
                            ? 'border-[#d9a521] bg-[#fff3d6] text-[#8a5f10] shadow-[0_0_0_4px_rgba(217,165,33,0.25)]'
                            : 'border-[#c9b695] bg-white/60 text-[#b0a591]'
                      }`}
                    >
                      {status === 'lewat' ? (
                        <CheckCircle2 aria-hidden className="h-4 w-4" />
                      ) : (
                        <Icon aria-hidden className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {label}
                        {status === 'aktif' ? ' (sekarang)' : status === 'lewat' ? ' (selesai)' : ''}
                      </span>
                    </span>
                    {index < LANGKAH.length - 1 ? (
                      <span
                        aria-hidden
                        className={`hidden h-1 flex-1 rounded-full sm:block ${
                          index < langkahIndex ? 'bg-[#6b4226]' : 'bg-[#c9b695]/70'
                        }`}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-stretch">
            <PanggungBarista
              pose={pose}
              className="h-64 rounded-3xl border-4 border-[#2b1a0e]/40 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] sm:h-80 lg:h-auto lg:min-h-[460px]"
            />

            <div className="flex min-w-0 flex-col gap-4">
              <div key={node.id} className="kk-muncul relative">
                <div className="kk-kertas relative rounded-2xl rounded-tl-sm p-4 shadow-xl sm:p-5">
                  <div
                    aria-hidden
                    className="absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 bg-[#f8efdf] lg:block"
                  />
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a5f10]">
                    <Coffee aria-hidden className="h-3.5 w-3.5" />
                    Barista · Kopi Lakon
                  </p>
                  <p aria-live="polite" className="font-display mt-1.5 text-xl font-bold leading-snug sm:text-2xl">
                    “{node.line.id}”
                  </p>
                  {node.hint ? (
                    <p className="kk-font-kapur mt-2 rounded-lg bg-[#26301f] px-3 py-1.5 text-lg text-[#d9d3bd]">
                      ✎ {node.hint}
                    </p>
                  ) : null}
                </div>
              </div>

              <TugasKedai
                key={`${node.id}-tugas`}
                node={node}
                task={task}
                engine={engine}
                getCompiled={getCompiled}
                onMaju={majuSetelah}
                onPesan={(entri) => setPesanan(entri)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {tahap === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="tombol-sorot">
            <ReceiptText aria-hidden className="h-5 w-5" />
            Cetak struk
          </button>
        </div>
      ) : null}
    </main>
  )
}

function TugasKedai({
  node,
  task,
  engine,
  getCompiled,
  onMaju,
  onPesan,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  onPesan: (entri: (typeof MENU_UTAMA)[number]) => void
}) {
  const idUtama = simpulUtama(node.id)

  if (task === null) {
    return (
      <button
        type="button"
        onClick={() => onMaju(engine.continueNode())}
        className="tombol-sorot self-start"
      >
        Lanjut
      </button>
    )
  }

  if (task.type === 'point') {
    if (idUtama === 'pesan') {
      return (
        <div className="kk-muncul flex flex-col gap-3">
          <p className="font-bold text-[#f5e9d7]">{task.prompt}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {task.options.map((option, index) => {
              const entri = MENU_UTAMA.find((m) => m.opsi === option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const benar = index === task.correct
                    if (benar && entri) onPesan(entri)
                    onMaju(engine.answer(benar ? 'benar' : 'salah'))
                  }}
                  className="kk-kartu-menu kk-kertas flex flex-col items-center gap-1 rounded-2xl border-2 border-[#c9b695] p-4 text-center shadow-lg"
                >
                  <ArtMinuman jenis={option} className="h-24 w-24" />
                  <span className="font-display text-lg font-bold leading-tight">
                    {entri?.nama ?? option}
                  </span>
                  {entri ? (
                    <span className="text-teks-sekunder text-xs leading-snug">{entri.sub}</span>
                  ) : null}
                  <span className="mt-1 rounded-full bg-[#6b4226] px-3 py-0.5 text-sm font-bold text-[#f8efdf]">
                    {entri ? rupiah(entri.harga) : ''}
                  </span>
                  <span className="text-teks-samar mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                    <Hand aria-hidden className="h-3.5 w-3.5" /> tunjuk ini
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (idUtama === 'harga') {
      return (
        <div className="kk-muncul flex flex-col gap-3">
          <div className="mx-auto w-full max-w-sm rounded-2xl border-4 border-[#241811] bg-[#101a12] p-4 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)]">
            <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#7dbb8f]">
              <span>Kasir · Kopi Lakon</span>
              <span className="kk-lampu-nyala">●</span>
            </p>
            <div className="my-2 border-t border-dashed border-[#2e4a36]" />
            <p className="flex justify-between font-mono text-sm text-[#c9e8d2]">
              <span>1× Kopi Susu (Panas)</span>
              <span>20.000</span>
            </p>
            <div className="my-2 border-t border-dashed border-[#2e4a36]" />
            <p className="flex items-baseline justify-between font-mono text-[#7dbb8f]">
              <span className="text-xs uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-[#b7f0c6]">Rp20.000</span>
            </p>
          </div>
          <p className="font-bold text-[#f5e9d7]">{task.prompt}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {task.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onMaju(engine.answer(index === task.correct ? 'benar' : 'salah'))}
                className="kk-kartu-menu kk-kertas rounded-xl border-2 border-[#c9b695] px-4 py-3 font-mono text-lg font-bold shadow-md"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (idUtama === 'bayar') {
      return (
        <div className="kk-muncul flex flex-col gap-3">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <KartuQris className="w-40 shrink-0 -rotate-1" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="font-bold text-[#f5e9d7]">{task.prompt}</p>
              {task.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onMaju(engine.answer(index === task.correct ? 'benar' : 'salah'))}
                  className="kk-kartu-menu kk-kertas rounded-xl border-2 border-[#c9b695] px-4 py-3 text-left font-bold shadow-md"
                >
                  <QrCode aria-hidden className="mr-2 inline h-4 w-4 text-[#6b4226]" />
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="kk-muncul kk-kertas rounded-2xl p-4 shadow-xl">
        <p className="mb-3 font-bold">{task.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {task.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onMaju(engine.answer(index === task.correct ? 'benar' : 'salah'))}
              className="kk-kartu-menu tombol-sekunder bg-white/80 text-left"
            >
              ☝️ {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (task.type === 'produce') {
    const compiled = getCompiled(task.sign)
    if (!compiled) {
      return (
        <div className="kk-muncul kk-kertas rounded-2xl p-4 shadow-xl">
          <p>
            Balas dengan isyarat <span className="font-bold">{prettify(task.sign)}</span>. Peragaan
            belum tersedia, nilai sendiri lalu lanjut.
          </p>
          <button
            type="button"
            onClick={() => onMaju(engine.answer('benar'))}
            className="tombol-utama mt-3"
          >
            Sudah kuperagakan, lanjut
          </button>
        </div>
      )
    }
    return (
      <div className="kk-muncul kk-kertas rounded-3xl p-4 shadow-xl sm:p-5">
        <p className="mb-3 font-bold">
          Balas dengan isyarat: <span className="capitalize">{prettify(task.sign)}</span>
          {engine.attemptsAtCurrent() > 0
            ? `, percobaan gagal: ${engine.attemptsAtCurrent()}`
            : ''}
        </p>
        <PracticeBlock
          compiled={compiled}
          signLabel={prettify(task.sign)}
          onPassed={() => onMaju(engine.answer('benar'))}
          onFailedAttempt={() => onMaju(engine.answer('salah'))}
          onSelfAssessed={() => onMaju(engine.skip())}
        />
      </div>
    )
  }

  const compiled = getCompiled(task.sign)
  return (
    <div className="kk-muncul kk-kertas rounded-3xl p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Pelanggan berisyarat. Apa maknanya?</p>
      {compiled ? (
        <div className="bg-zona-tenang zona-tenang-gradasi relative mb-4 aspect-video w-full max-w-xl overflow-hidden rounded-2xl">
          <AvatarStage compiled={compiled} className="absolute inset-0" />
        </div>
      ) : (
        <p className="text-teks-sekunder mb-4 text-sm">
          (Peragaan isyarat ini belum tersedia. Pilih makna berdasarkan konteks percakapan.)
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {task.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onMaju(engine.answer(option === task.sign ? 'benar' : 'salah'))}
            className="kk-kartu-menu tombol-sekunder bg-white/80 text-left capitalize"
          >
            {prettify(option)}
          </button>
        ))}
      </div>
      {engine.attemptsAtCurrent() >= 3 ? (
        <button type="button" onClick={() => onMaju(engine.skip())} className="tombol-sekunder mt-3">
          Lewati simpul ini
        </button>
      ) : null}
    </div>
  )
}
