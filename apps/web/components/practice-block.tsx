'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createExplicitSegmenter,
  fuseDecision,
  type StablePrediction,
  type Verdict,
} from '@lakon/cv-core'
import type { CompiledSign } from '@lakon/sign-compiler'
import { AvatarStage } from '@/components/avatar-stage'
import { createPipeline, type Pipeline, type PipelineState } from '@/features/practice/pipeline'
import type { OverlayHighlight } from '@/features/practice/overlay'
import {
  createVerifyRun,
  scoreAgainstReference,
  type VerifyResult,
  type VerifyRun,
} from '@/features/practice/verify'

export type PracticePhase =
  | 'kamera-mati'
  | 'menunggu-izin'
  | 'ditolak'
  | 'siap'
  | 'hitung-mundur'
  | 'merekam'
  | 'memeriksa'
  | 'berhasil'
  | 'belum-tepat'
  | 'jalan-keluar'

const DTW_THRESHOLD = 7

export function PracticeBlock({
  compiled,
  signLabel,
  onPassed,
  onFailedAttempt,
  onSelfAssessed,
  compact = false,
}: {
  compiled: CompiledSign
  signLabel: string
  onPassed?: (verdict: Verdict, result: VerifyResult) => void
  onFailedAttempt?: (result: VerifyResult) => void
  onSelfAssessed?: () => void
  compact?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const runRef = useRef<VerifyRun | null>(null)
  const stableRef = useRef<StablePrediction | null>(null)
  const progressEl = useRef<HTMLParagraphElement | null>(null)
  const meterEl = useRef<HTMLDivElement | null>(null)

  const [phase, setPhase] = useState<PracticePhase>('kamera-mati')
  const [pipelineState, setPipelineState] = useState<PipelineState>({ status: 'idle' })
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [failures, setFailures] = useState(0)

  useEffect(() => {
    setPhase((current) =>
      current === 'jalan-keluar' || current === 'ditolak' ? current : 'kamera-mati',
    )
    setFailures(0)
    setResult(null)
    setVerdict(null)
  }, [compiled.id])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const pipeline = createPipeline({
      video,
      canvas,
      onState: (state) => {
        setPipelineState(state)
        setPhase((current) => {
          if (state.status === 'starting') return 'menunggu-izin'
          if (state.status === 'denied') return 'ditolak'
          if (
            state.status === 'running' &&
            (current === 'menunggu-izin' || current === 'kamera-mati')
          )
            return 'siap'
          if (
            (state.status === 'no-camera' ||
              state.status === 'unsupported' ||
              state.status === 'error') &&
            current !== 'jalan-keluar'
          )
            return 'ditolak'
          return current
        })
      },
      onLandmarks: (hands, pose, timestamp) => {
        runRef.current?.onLandmarks(hands, pose, timestamp)
        if (meterEl.current) {
          const seen = hands.length > 0
          meterEl.current.style.width = seen ? '100%' : '12%'
          meterEl.current.dataset.state = seen ? 'terlihat' : 'mencari'
        }
      },
      onPrediction: (_raw, stable) => {
        stableRef.current = stable
      },
    })
    pipelineRef.current = pipeline
    return () => {
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const startCamera = () => {
    setPhase('menunggu-izin')
    void pipelineRef.current?.start()
  }

  const startAttempt = useCallback(() => {
    setResult(null)
    setVerdict(null)
    pipelineRef.current?.setHighlights([])
    setPhase('hitung-mundur')

    const segmenter = createExplicitSegmenter({
      countdownMs: 3000,
      windowMs: Math.max(2000, compiled.duration + 600),
    })
    runRef.current = createVerifyRun(
      segmenter,
      (update) => {
        const el = progressEl.current
        if (!el) return
        if (update.phase === 'countdown') {
          setPhase((current) => (current === 'hitung-mundur' ? current : 'hitung-mundur'))
          el.textContent = String(Math.ceil(update.remainingMs / 1000))
        } else if (update.phase === 'recording') {
          setPhase((current) => (current === 'merekam' ? current : 'merekam'))
          el.textContent = 'peragakan sekarang'
        }
      },
      (frames) => {
        setPhase('memeriksa')
        const scored = scoreAgainstReference(frames, compiled)
        const handsMissing = scored.analysis.hands.some((hand) => !hand.present)
        const decision = handsMissing
          ? ({ kind: 'belum-tepat', reason: 'dtw-saja' } as const)
          : fuseDecision({
              expectedSign: compiled.id,
              stableLabel: stableRef.current?.label ?? null,
              dtwScore: scored.score,
              dtwThreshold: DTW_THRESHOLD,
            })
        setResult(scored)
        setVerdict(decision)
        if (frames.length < 5) {
          setFailures((count) => count + 1)
          setPhase('belum-tepat')
          return
        }
        if (decision.kind === 'belum-tepat') {
          pipelineRef.current?.setHighlights(
            scored.feedback.highlights.map((highlight): OverlayHighlight => ({
              side: highlight.side,
              part: highlight.part,
            })),
          )
          setFailures((count) => {
            const next = count + 1
            onFailedAttempt?.(scored)
            return next
          })
          setPhase('belum-tepat')
        } else {
          setFailures(0)
          setPhase('berhasil')
          onPassed?.(decision, scored)
        }
      },
    )
  }, [compiled, onFailedAttempt, onPassed])

  const selfAssess = () => {
    setPhase('berhasil')
    setVerdict(null)
    onSelfAssessed?.()
  }

  const showEscape = failures >= 3 || phase === 'jalan-keluar'
  const cameraRunning = pipelineState.status === 'running'

  return (
    <div className="flex flex-col gap-4">
      <div className={`grid gap-3 ${compact ? '' : 'lg:grid-cols-2'}`}>
        <div className="bg-zona-tenang zona-tenang-gradasi aspect-4/3 relative w-full overflow-hidden rounded-2xl">
          <AvatarStage compiled={compiled} className="absolute inset-0" mirrorDefault />
          <p className="text-halaman absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
            peraga · {signLabel}
          </p>
        </div>
        <div className="bg-zona-tenang aspect-4/3 relative w-full overflow-hidden rounded-2xl">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
          {phase === 'hitung-mundur' || phase === 'merekam' ? (
            <p
              ref={progressEl}
              aria-live="assertive"
              className="absolute inset-x-0 top-3 text-center text-3xl font-bold text-white drop-shadow"
            />
          ) : null}
          <p className="text-halaman absolute bottom-14 left-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
            {cameraRunning ? 'kamu' : 'kamera belum menyala'}
          </p>
          <div className="absolute inset-x-4 bottom-3">
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div
                ref={meterEl}
                data-state="mencari"
                className="bg-berhasil h-full w-[12%] rounded-full transition-[width] duration-500"
              />
            </div>
            <p className="mt-1 text-center text-xs text-white/90">
              penuh berarti tanganmu terlihat sistem
            </p>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="flex min-h-14 flex-col gap-3">
        {phase === 'kamera-mati' ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={startCamera} className="tombol-utama">
                Nyalakan kamera
              </button>
              <button
                type="button"
                onClick={() => setPhase('jalan-keluar')}
                className="tombol-sekunder"
              >
                Tanpa kamera
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'menunggu-izin' ? <p>Menunggu izin kamera dari peramban…</p> : null}

        {phase === 'ditolak' ? (
          <div className="flex flex-col gap-2">
            <p>
              <span aria-hidden>🎥</span> Kamera tidak tersedia
              {pipelineState.status === 'denied' ? ' karena izin ditolak' : ''}. Kamu tetap bisa
              berlatih dengan membandingkan sendiri.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPhase('jalan-keluar')}
                className="tombol-utama"
              >
                Latihan tanpa kamera
              </button>
              <button type="button" onClick={startCamera} className="tombol-sekunder">
                Coba kamera lagi
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'siap' ? (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={startAttempt} className="tombol-utama">
              Mulai peragakan
            </button>
            <p className="text-sm">Hitungan mundur 3 detik, lalu tirukan gerakan peraga.</p>
          </div>
        ) : null}

        {phase === 'memeriksa' ? <p>Memeriksa gerakanmu…</p> : null}

        {phase === 'berhasil' ? (
          <div className="border-berhasil flex flex-col gap-2 rounded-xl border-2 p-4">
            <p className="text-berhasil text-lg font-bold">
              <span aria-hidden>✓</span> Berhasil
            </p>
            {verdict?.kind === 'lulus-dengan-catatan' && result ? (
              <ul className="list-inside list-disc text-sm">
                {result.feedback.messages.slice(0, 3).map((message, index) => (
                  <li key={index}>catatan: {message}</li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={startAttempt} className="tombol-sekunder">
                Ulangi lagi
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'belum-tepat' ? (
          <div className="border-ulang flex flex-col gap-2 rounded-xl border-2 p-4">
            <p className="text-ulang text-lg font-bold">
              <span aria-hidden>↻</span> Belum tepat
            </p>
            {result ? (
              <ul className="list-inside list-disc text-sm">
                {result.feedback.messages.slice(0, 4).map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-teks-samar text-sm">
              Titik kuning di pratinjau menunjukkan bagian yang perlu disesuaikan.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={startAttempt} className="tombol-utama">
                Coba lagi
              </button>
              {showEscape ? (
                <button
                  type="button"
                  onClick={() => setPhase('jalan-keluar')}
                  className="tombol-sekunder"
                >
                  Bandingkan sendiri
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {phase === 'jalan-keluar' ? (
          <div className="border-border-tegas flex flex-col gap-2 rounded-xl border-2 p-4">
            <p className="font-bold">Bandingkan sendiri</p>
            <p className="text-sm">
              Perhatikan peraga di kanan{cameraRunning ? ' dan pratinjaumu di kiri' : ''}. Kamu yang
              menilai. Ini cara belajar yang sah, bukan menyerah.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={selfAssess} className="tombol-utama">
                Sudah cukup mirip, lanjut
              </button>
              {cameraRunning ? (
                <button type="button" onClick={startAttempt} className="tombol-sekunder">
                  Coba verifikasi lagi
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
