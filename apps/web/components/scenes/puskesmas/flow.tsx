'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, DoorOpen, FileText } from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { SyncBadge } from '@/components/sync-badge'
import { SceneLuarPuskesmas } from '@/components/scenes/puskesmas/scene-luar'
import { SceneBelajarPuskesmas } from '@/components/scenes/puskesmas/scene-belajar'
import { SceneUjianPuskesmas } from '@/components/scenes/puskesmas/scene-ujian'
import { SceneResepPuskesmas } from '@/components/scenes/puskesmas/scene-resep'
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

type Tahap = 'luar' | 'belajar' | 'ujian' | 'resep'

export function PuskesmasFlow() {
  const scenarioId = 'puskesmas'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<Tahap>('luar')
  const [membuka, setMembuka] = useState(false)
  const { rig, error: rigError } = useCompilerRig(tahap !== 'luar')
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
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
      <main className="pk-langit-pagi flex min-h-dvh items-center justify-center px-6">
        <p aria-live="polite" className="text-lg font-bold text-[#1d442f]">
          {content && !scenario ? 'Skenario tidak ditemukan.' : 'Menyiapkan puskesmas…'}
        </p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const rigLoading = tahap !== 'luar' && !rig && !rigError
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

  const masukPuskesmas = () => {
    if (membuka) return
    setMembuka(true)
    startedAtRef.current = Date.now()
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
    setTahap('resep')
  }

  const majuSetelah = (moved: string) => {
    if (moved === 'selesai') finishExam()
    forceUpdate()
  }

  const node = engine.current()
  const task = engine.currentTask()

  const kepala = (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#1d442f] sm:px-6">
      <Link
        href="/skenario"
        className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Skenario
      </Link>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold sm:text-base">
          <span className="font-display">Puskesmas</span>
          <span className="text-[#4f8a68]"> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'luar') {
    return (
      <main className="pk-langit-pagi flex min-h-dvh flex-col">
        {kepala}
        <SceneLuarPuskesmas
          membuka={membuka}
          onMasuk={masukPuskesmas}
          papanInfo={
            <div className="relative z-10 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-8">
              <div className="w-64 -rotate-1 rounded-lg border-4 border-[#2a6b48] bg-white p-4 shadow-xl">
                <p className="border-b-2 border-[#2f7d52] pb-1.5 text-center text-xs font-black uppercase tracking-[0.2em] text-[#1d442f]">
                  Papan Informasi
                </p>
                <p className="font-display mt-2 text-center text-lg font-bold leading-tight text-[#1d442f]">
                  {scenario.title.id}
                </p>
                <ul className="mt-2 space-y-1 text-sm font-bold text-[#2b3a2e]">
                  <li>✚ {learning.order().length} isyarat baru</li>
                  <li>✚ 1 kunjungan berobat lengkap</li>
                  <li>✚ ± {scenario.estimatedMinutes ?? 20} menit</li>
                  <li>✚ peran: {directionLabel}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={masukPuskesmas}
                disabled={membuka}
                className="pk-tombol text-lg"
              >
                <DoorOpen aria-hidden className="mr-2 inline h-5 w-5" />
                {membuka ? 'Pintu terbuka…' : 'Masuk puskesmas'}
              </button>
            </div>
          }
        />
      </main>
    )
  }

  if (tahap === 'resep') {
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    const minutes = Math.max(1, Math.round(summary.durationMs / 60000))
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const perluDiulang = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !perluDiulang.includes(sign))
    return (
      <main className="pk-dinding flex min-h-dvh flex-col">
        {kepala}
        <SceneResepPuskesmas
          dikuasai={dikuasai}
          perluDiulang={perluDiulang}
          menit={minutes}
          langkah={summary.path.length}
          onUlangi={() => {
            engine.reset()
            startedAtRef.current = Date.now()
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
    <main className="pk-dinding flex min-h-dvh flex-col">
      {kepala}

      {tahap === 'belajar' ? (
        <SceneBelajarPuskesmas
          rigMemuat={rigLoading}
          isyaratAktif={currentSignId}
          urutan={learning.order()}
          sign={currentSignId ? content.signs[currentSignId] : undefined}
          compiled={currentSignId ? getCompiled(currentSignId) : null}
          tampilan={learnView}
          percobaan={currentSignId ? (learning.progressFor(currentSignId)?.attempts ?? 0) : 0}
          gagalBeruntun={
            currentSignId ? (learning.progressFor(currentSignId)?.consecutiveFailures ?? 0) : 0
          }
          arahLabel={directionLabel}
          onTampilan={setLearnView}
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
      ) : null}

      {tahap === 'ujian' && node ? (
        <SceneUjianPuskesmas
          node={node}
          task={task}
          engine={engine}
          getCompiled={getCompiled}
          onMaju={majuSetelah}
        />
      ) : null}

      {tahap === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="pk-tombol">
            <FileText aria-hidden className="mr-2 inline h-5 w-5" />
            Ambil resep
          </button>
        </div>
      ) : null}
    </main>
  )
}
