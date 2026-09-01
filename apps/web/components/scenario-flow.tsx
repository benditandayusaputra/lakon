'use client'

import { useCallback, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { SceneBackdrop } from '@/components/scene-backdrop'
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
import { SyncBadge } from '@/components/sync-badge'
import { paletteFor } from '@/features/ui/tokens'

type Stage = 'intro' | 'belajar' | 'ujian' | 'ringkasan'

const prettify = (id: string) => id.replace(/-/g, ' ')

export function ScenarioFlow({ scenarioId }: { scenarioId: string }) {
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]
  const palette = paletteFor(scenarioId)

  const [stage, setStage] = useState<Stage>('intro')
  const { rig, error: rigError } = useCompilerRig(stage !== 'intro')
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
  const [, forceUpdate] = useReducer((tick: number) => tick + 1, 0)
  const startedAtRef = useRef<number>(Date.now())
  const endedAtRef = useRef<number>(Date.now())

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
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p aria-live="polite">{content && !scenario ? 'Skenario tidak ditemukan.' : 'Memuat…'}</p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const rigLoading = stage !== 'intro' && !rig && !rigError
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

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
    setStage('ringkasan')
  }

  const node = engine.current()
  const task = engine.currentTask()

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/skenario" className="underline underline-offset-4">
          ← Skenario
        </Link>
        <div className="flex items-center gap-4">
          <p className="font-bold">
            {scenario.title.id} · {directionLabel}
          </p>
          <SyncBadge />
        </div>
      </header>

      {stage === 'intro' ? (
        <SceneBackdrop
          paletteClass={palette.kelas}
          stage={1}
          className="mx-6 mb-8 flex-1 rounded-3xl"
        >
          <div className="flex h-full min-h-[60vh] flex-col items-start justify-end gap-4 p-8">
            <h1
              className="max-w-xl text-balance text-4xl font-bold"
              style={{ color: 'var(--skenario-deep)' }}
            >
              {scenario.title.id}
            </h1>
            <p className="max-w-prose text-lg" style={{ color: 'var(--skenario-deep)' }}>
              Kamu akan belajar {learning.order().length} isyarat, lalu menjalani percakapan lengkap
              sebagai {directionLabel}.
            </p>
            <button
              type="button"
              onClick={() => {
                startedAtRef.current = Date.now()
                setStage('belajar')
              }}
              className="tombol-utama"
            >
              Mulai belajar
            </button>
          </div>
        </SceneBackdrop>
      ) : null}

      {stage === 'belajar' ? (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-10">
          {rigLoading ? (
            <p aria-live="polite" className="py-10">
              Memuat avatar peraga…
            </p>
          ) : currentSignId === null ? (
            <div className="flex flex-col items-start gap-4 py-10">
              <h1 className="text-3xl font-bold">Semua isyarat selesai dipelajari</h1>
              <p className="max-w-prose">
                Sekarang jalani percakapan lengkapnya. Kamu akan berperan sebagai {directionLabel}.
              </p>
              <button type="button" onClick={() => setStage('ujian')} className="tombol-utama">
                Mulai ujian percakapan
              </button>
            </div>
          ) : (
            (() => {
              const progress = learning.progressFor(currentSignId)!
              const orderIndex = learning.order().indexOf(currentSignId)
              const compiled = getCompiled(currentSignId)
              const sign = content.signs[currentSignId]
              return (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h1 className="text-3xl font-bold">{prettify(currentSignId)}</h1>
                    <p className="text-teks-sekunder">
                      isyarat {orderIndex + 1} dari {learning.order().length}
                    </p>
                  </div>

                  {compiled && sign ? (
                    learnView === 'demo' ? (
                      <div className="flex flex-col gap-4">
                        <SceneBackdrop
                          paletteClass={palette.kelas}
                          stage={2}
                          quietZone
                          className="rounded-3xl"
                        >
                          <div className="h-[52vh] min-h-80">
                            <AvatarStage
                              compiled={compiled}
                              showControls
                              className="h-full [&_.text-teks-samar]:text-white/70 [&_label]:text-white [&_span]:text-white"
                            />
                          </div>
                        </SceneBackdrop>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <p className="text-lg">
                              <span className="font-bold">{sign.gloss.id}</span> · {sign.gloss.en}
                            </p>
                            <p className="text-teks-sekunder text-sm">
                              Status:{' '}
                              {sign.review.status === 'approved'
                                ? 'tervalidasi'
                                : 'draf, belum divalidasi penanda Tuli'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLearnView('praktik')}
                            className="tombol-utama self-start"
                          >
                            Lanjut ke praktik
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
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
                        <button
                          type="button"
                          onClick={() => setLearnView('demo')}
                          className="tombol-sekunder self-start"
                        >
                          ← Lihat peragaan lagi
                        </button>
                        {progress.attempts > 0 ? (
                          <p className="text-teks-samar text-sm">
                            percobaan: {progress.attempts} · gagal beruntun:{' '}
                            {progress.consecutiveFailures}
                          </p>
                        ) : null}
                      </div>
                    )
                  ) : (
                    <div className="border-border-tegas flex flex-col gap-3 rounded-2xl border-2 p-5">
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
                        className="tombol-sekunder self-start"
                      >
                        Lewati dulu
                      </button>
                    </div>
                  )}
                </div>
              )
            })()
          )}
        </div>
      ) : null}

      {stage === 'ujian' && node ? (
        <SceneBackdrop
          paletteClass={palette.kelas}
          stage={3}
          className="mx-6 mb-8 flex-1 rounded-3xl"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
            <div
              className="max-w-xl rounded-2xl rounded-tl-sm p-4"
              style={{ backgroundColor: 'var(--skenario-tint)', color: 'var(--skenario-deep)' }}
            >
              <p className="text-sm font-bold capitalize">{node.actor.replace(/-/g, ' ')}</p>
              <p className="text-lg">{node.line.id}</p>
              {node.hint ? <p className="mt-1 text-sm">💡 {node.hint}</p> : null}
            </div>

            {task === null ? (
              <button
                type="button"
                onClick={() => {
                  const moved = engine.continueNode()
                  if (moved === 'selesai') finishExam()
                  forceUpdate()
                }}
                className="tombol-utama self-start"
              >
                Lanjut
              </button>
            ) : task.type === 'point' ? (
              <div className="rounded-3xl bg-white/90 p-4">
                <p className="mb-3 font-bold">{task.prompt}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {task.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const moved = engine.answer(index === task.correct ? 'benar' : 'salah')
                        if (moved === 'selesai') finishExam()
                        forceUpdate()
                      }}
                      className="tombol-sekunder bg-white text-left"
                    >
                      ☝️ {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : task.type === 'produce' ? (
              (() => {
                const compiled = getCompiled(task.sign)
                if (!compiled) {
                  return (
                    <div className="rounded-2xl bg-white/85 p-4">
                      <p>
                        Balas dengan isyarat{' '}
                        <span className="font-bold">{prettify(task.sign)}</span>. Peragaan belum
                        tersedia, nilai sendiri lalu lanjut.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const moved = engine.answer('benar')
                          if (moved === 'selesai') finishExam()
                          forceUpdate()
                        }}
                        className="tombol-utama mt-3"
                      >
                        Sudah kuperagakan, lanjut
                      </button>
                    </div>
                  )
                }
                return (
                  <div className="rounded-3xl bg-white/90 p-4">
                    <p className="mb-3 font-bold">
                      Balas dengan isyarat: {prettify(task.sign)}
                      {engine.attemptsAtCurrent() > 0
                        ? ` · percobaan gagal: ${engine.attemptsAtCurrent()}`
                        : ''}
                    </p>
                    <PracticeBlock
                      compiled={compiled}
                      signLabel={prettify(task.sign)}
                      onPassed={() => {
                        const moved = engine.answer('benar')
                        if (moved === 'selesai') finishExam()
                        forceUpdate()
                      }}
                      onFailedAttempt={() => {
                        const moved = engine.answer('salah')
                        if (moved === 'selesai') finishExam()
                        forceUpdate()
                      }}
                      onSelfAssessed={() => {
                        const moved = engine.skip()
                        if (moved === 'selesai') finishExam()
                        forceUpdate()
                      }}
                    />
                  </div>
                )
              })()
            ) : (
              (() => {
                const compiled = getCompiled(task.sign)
                return (
                  <div className="rounded-3xl bg-white/90 p-4">
                    <p className="mb-3 font-bold">Apa makna isyarat ini?</p>
                    {compiled ? (
                      <div className="bg-zona-tenang zona-tenang-gradasi relative mb-4 aspect-video w-full max-w-xl overflow-hidden rounded-2xl">
                        <AvatarStage compiled={compiled} className="absolute inset-0" />
                      </div>
                    ) : (
                      <p className="text-teks-sekunder mb-4 text-sm">
                        (Peragaan isyarat ini belum tersedia. Pilih makna berdasarkan konteks
                        percakapan.)
                      </p>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {task.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const moved = engine.answer(option === task.sign ? 'benar' : 'salah')
                            if (moved === 'selesai') finishExam()
                            forceUpdate()
                          }}
                          className="tombol-sekunder bg-white text-left capitalize"
                        >
                          {prettify(option)}
                        </button>
                      ))}
                    </div>
                    {engine.attemptsAtCurrent() >= 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const moved = engine.skip()
                          if (moved === 'selesai') finishExam()
                          forceUpdate()
                        }}
                        className="tombol-sekunder mt-3"
                      >
                        Lewati simpul ini
                      </button>
                    ) : null}
                  </div>
                )
              })()
            )}
          </div>
        </SceneBackdrop>
      ) : null}

      {stage === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="tombol-utama">
            Lihat ringkasan
          </button>
        </div>
      ) : null}

      {stage === 'ringkasan'
        ? (() => {
            const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
            const minutes = Math.max(1, Math.round(summary.durationMs / 60000))
            const selfAssessed = learning
              .progress()
              .filter((item) => item.status === 'dinilai-sendiri')
              .map((item) => item.sign)
            const needsRepeat = [...new Set([...summary.needsRepeat, ...selfAssessed])]
            return (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
                <h1 className="text-3xl font-bold">Ringkasan</h1>
                <p>
                  Selesai dalam sekitar {minutes} menit, melewati {summary.path.length} langkah
                  percakapan.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="border-berhasil rounded-2xl border-2 p-4">
                    <h2 className="text-berhasil font-bold">
                      <span aria-hidden>✓</span> Dikuasai
                    </h2>
                    <ul className="mt-2 capitalize">
                      {summary.mastered.length > 0 ? (
                        summary.mastered
                          .filter((sign) => !needsRepeat.includes(sign))
                          .map((sign) => <li key={sign}>{prettify(sign)}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </section>
                  <section className="border-ulang rounded-2xl border-2 p-4">
                    <h2 className="text-ulang font-bold">
                      <span aria-hidden>↻</span> Perlu diulang
                    </h2>
                    <ul className="mt-2 capitalize">
                      {needsRepeat.length > 0 ? (
                        needsRepeat.map((sign) => <li key={sign}>{prettify(sign)}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </section>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      engine.reset()
                      startedAtRef.current = Date.now()
                      setStage('intro')
                      setLearnView('demo')
                      forceUpdate()
                    }}
                    className="tombol-utama"
                  >
                    Ulangi skenario
                  </button>
                  <Link href="/skenario" className="tombol-sekunder">
                    Skenario lain
                  </Link>
                </div>
              </div>
            )
          })()
        : null}
    </main>
  )
}
