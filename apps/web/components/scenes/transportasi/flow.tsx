'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Bus, Ticket } from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { IzinKamera } from '@/components/scenes/izin-kamera'
import { TiraiSelesai } from '@/components/scenes/tirai-selesai'
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
import { SceneBelajar } from './scene-belajar'
import { SceneLoket } from './scene-loket'
import { SceneLuar } from './scene-luar'
import { SceneTiket } from './scene-tiket'
import { type TahapTransportasi } from './types'

export function TransportasiFlow() {
  const scenarioId = 'transportasi'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<TahapTransportasi>('luar')
  const [membuka, setMembuka] = useState(false)
  const [tirai, setTirai] = useState(false)
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
      <main className="tp-langit-siang flex min-h-dvh items-center justify-center px-6">
        <p aria-live="polite" className="text-lg font-bold text-[#12283c]">
          {content && !scenario ? 'Skenario tidak ditemukan.' : 'Menyiapkan halte…'}
        </p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const rigLoading = tahap !== 'luar' && !rig && !rigError
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

  const masukHalte = () => {
    if (membuka) return
    setMembuka(true)
    startedAtRef.current = Date.now()
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pintuTimer.current = setTimeout(
      () => setTahap(direction === 'deaf' ? 'kamera' : 'belajar'),
      cepat ? 120 : 1250,
    )
  }

  const persistSign = (signId: string) => {
    const progress = learning.progressFor(signId)
    if (!progress) return
    void saveSignProgress({
      signId,
      direction,
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
    setTirai(true)

    setTahap('tiket')
  }

  const majuSetelah = (moved: string) => {
    if (moved === 'selesai') finishExam()
    forceUpdate()
  }

  const node = engine.current()
  const task = engine.currentTask()

  const kepala = (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#12283c] sm:px-6">
      <Link
        href="/skenario"
        className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Skenario
      </Link>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <p className="text-sm font-bold sm:text-base">
          <span className="font-display">Transportasi</span>
          <span className="text-[#41546b]"> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'kamera') {
    return (
      <main className="tp-ruang flex min-h-dvh flex-col">
        {kepala}
        <IzinKamera aksen="#f2b23e" onLanjut={() => setTahap('belajar')} />
      </main>
    )
  }

  if (tahap === 'luar') {
    return (
      <main className="tp-langit-siang flex min-h-dvh flex-col">
        {kepala}
        <SceneLuar membuka={membuka} onMasuk={masukHalte} papanInfo={null} />
      </main>
    )
  }

  if (tahap === 'tiket') {
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const perluUlang = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !perluUlang.includes(sign))
    return (
      <main className="tp-ruang flex min-h-dvh flex-col">
        {kepala}
        {tirai ? (
          <TiraiSelesai
            judul="Tiketmu di tangan!"
            pesan="Kamu menyelesaikan satu perjalanan dari loket sampai peron."
            dikuasai={dikuasai.length}
            menit={Math.max(1, Math.round(summary.durationMs / 60000))}
            onSelesai={() => setTirai(false)}
            aksen="#f2b23e"
          />
        ) : null}
        <SceneTiket
          dikuasai={dikuasai}
          perluUlang={perluUlang}
          menit={Math.max(1, Math.round(summary.durationMs / 60000))}
          jumlahLangkah={summary.path.length}
          onUlangi={() => {
            engine.reset()
            startedAtRef.current = Date.now()
            setMembuka(false)
            setTirai(false)
            setLearnView('demo')
            setTahap('luar')
            forceUpdate()
          }}
        />
      </main>
    )
  }

  return (
    <main className="tp-ruang flex min-h-dvh flex-col">
      {kepala}
      <div
        aria-hidden
        className="pointer-events-none h-2 w-full bg-[repeating-linear-gradient(90deg,#f2b23e_0_44px,#12283c_44px_88px)] opacity-70"
      />

      {tahap === 'belajar' ? (
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-12 pt-4 sm:px-6">
          {rigLoading ? (
            <div className="tp-kertas mx-auto mt-10 flex w-fit items-center gap-3 rounded-2xl px-6 py-4 shadow-lg">
              <Bus aria-hidden className="h-5 w-5 animate-pulse text-[#33608c]" />
              <p aria-live="polite" className="font-bold">
                Petugas menyiapkan peraga…
              </p>
            </div>
          ) : (
            <SceneBelajar
              learning={learning}
              currentSignId={currentSignId}
              sign={currentSignId ? content.signs[currentSignId] : undefined}
              compiled={currentSignId ? getCompiled(currentSignId) : null}
              learnView={learnView}
              direction={direction}
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
        <SceneLoket
          node={node}
          task={task}
          engine={engine}
          getCompiled={getCompiled}
          onMaju={majuSetelah}
        />
      ) : null}

      {tahap === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="tp-tombol">
            <Ticket aria-hidden className="h-5 w-5" />
            Cetak tiket
          </button>
        </div>
      ) : null}
    </main>
  )
}
