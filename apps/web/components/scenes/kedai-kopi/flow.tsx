'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Coffee, DoorOpen, ReceiptText } from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { SyncBadge } from '@/components/sync-badge'
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
import { LampuTali } from './props'
import { SceneBelajar } from './scene-belajar'
import { SceneKasir } from './scene-kasir'
import { SceneLuar } from './scene-luar'
import { SceneStruk } from './scene-struk'
import { type MenuKedai, type TahapKedai } from './types'

export function KedaiKopiFlow() {
  const scenarioId = 'kedai-kopi'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<TahapKedai>('luar')
  const [membuka, setMembuka] = useState(false)
  const { rig, error: rigError } = useCompilerRig(tahap !== 'luar')
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
  const [pesanan, setPesanan] = useState<MenuKedai | null>(null)
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

  const kepala = (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#f5e9d7] sm:px-6">
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
          <span className="text-[#e0b98a]"> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'luar') {
    return (
      <main className="kk-langit flex min-h-dvh flex-col">
        {kepala}
        <SceneLuar
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
              <button type="button" onClick={masukKedai} disabled={membuka} className="tombol-sorot">
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
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const perluUlang = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !perluUlang.includes(sign))
    return (
      <main className="kk-interior flex min-h-dvh flex-col">
        {kepala}
        <SceneStruk
          pesanan={pesanan}
          dikuasai={dikuasai}
          perluUlang={perluUlang}
          menit={Math.max(1, Math.round(summary.durationMs / 60000))}
          jumlahLangkah={summary.path.length}
          onUlangi={() => {
            engine.reset()
            startedAtRef.current = Date.now()
            setPesanan(null)
            setMembuka(false)
            setLearnView('demo')
            setTahap('luar')
            forceUpdate()
          }}
        />
      </main>
    )
  }

  return (
    <main className="kk-interior flex min-h-dvh flex-col">
      {kepala}
      <LampuTali aria-hidden className="pointer-events-none h-7 w-full opacity-80" />

      {tahap === 'belajar' ? (
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-12 pt-2 sm:px-6">
          {rigLoading ? (
            <div className="kk-kertas mx-auto mt-10 flex w-fit items-center gap-3 rounded-2xl px-6 py-4 shadow-lg">
              <Coffee aria-hidden className="h-5 w-5 animate-pulse text-[#6b4226]" />
              <p aria-live="polite" className="font-bold">
                Barista menyiapkan peraga…
              </p>
            </div>
          ) : (
            <SceneBelajar
              learning={learning}
              currentSignId={currentSignId}
              sign={currentSignId ? content.signs[currentSignId] : undefined}
              compiled={currentSignId ? getCompiled(currentSignId) : null}
              learnView={learnView}
              directionLabel={directionLabel}
              onGantiView={setLearnView}
              onLulus={() => {
                if (!currentSignId) return
                learning.recordResult(currentSignId, true)
                persistSign(currentSignId)
                setLearnView('demo')
                forceUpdate()
              }}
              onGagal={() => {
                if (!currentSignId) return
                learning.recordResult(currentSignId, false)
                persistSign(currentSignId)
                forceUpdate()
              }}
              onNilaiSendiri={() => {
                if (!currentSignId) return
                learning.selfAssessPass(currentSignId)
                persistSign(currentSignId)
                setLearnView('demo')
                forceUpdate()
              }}
              onLewati={() => {
                if (!currentSignId) return
                learning.selfAssessPass(currentSignId)
                persistSign(currentSignId)
                forceUpdate()
              }}
              onMulaiUjian={() => setTahap('ujian')}
            />
          )}
        </div>
      ) : null}

      {tahap === 'ujian' && node ? (
        <SceneKasir
          node={node}
          task={task}
          engine={engine}
          pesanan={pesanan}
          getCompiled={getCompiled}
          onMaju={majuSetelah}
          onPesan={setPesanan}
        />
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
