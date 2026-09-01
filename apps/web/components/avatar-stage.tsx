'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { CompiledSign, CompilerRig } from '@lakon/sign-compiler'
import { CompiledAvatar, type Playback } from '@/components/compile-lab'

export function AvatarStage({
  compiled,
  showControls = false,
  mirrorDefault = false,
  className = '',
  stageClassName = '',
  signLabel,
  onRigReady,
}: {
  compiled: CompiledSign | null
  showControls?: boolean
  mirrorDefault?: boolean
  className?: string
  stageClassName?: string
  signLabel?: string
  onRigReady?: (rig: CompilerRig) => void
}) {
  const playbackRef = useRef<Playback>({ compiled: null, playing: true, speed: 1, time: 0 })
  const timeEl = useRef<HTMLSpanElement | null>(null)
  const sliderEl = useRef<HTMLInputElement | null>(null)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [mirror, setMirror] = useState(mirrorDefault)
  const [rigError, setRigError] = useState<string | null>(null)
  const onRigReadyRef = useRef(onRigReady)
  onRigReadyRef.current = onRigReady

  useEffect(() => {
    playbackRef.current.compiled = compiled
    playbackRef.current.time = 0
  }, [compiled])

  useEffect(() => {
    playbackRef.current.playing = playing
    playbackRef.current.speed = speed
  }, [playing, speed])

  const stepFrame = (direction: 1 | -1) => {
    const active = playbackRef.current.compiled
    if (!active) return
    setPlaying(false)
    playbackRef.current.playing = false
    playbackRef.current.time = Math.min(
      active.duration,
      Math.max(0, playbackRef.current.time + (direction * 1000) / active.fps),
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={`relative min-h-0 flex-1 ${stageClassName}`}>
        <div className={`absolute inset-0 ${mirror ? '-scale-x-100' : ''}`}>
          <Canvas camera={{ fov: 30, position: [0, 1.35, 1.7] }}>
            <CompiledAvatar
              playbackRef={playbackRef}
              timeEl={timeEl}
              sliderEl={sliderEl}
              onRigReady={(rig) => onRigReadyRef.current?.(rig)}
              onRigError={setRigError}
            />
          </Canvas>
        </div>
        {signLabel ? (
          <p className="text-halaman absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-wide">
            {signLabel}
          </p>
        ) : null}
      </div>
      {rigError ? (
        <p role="alert" className="text-galat text-sm">
          Avatar gagal dimuat: {rigError}
        </p>
      ) : null}
      {showControls ? (
        <div className="border-border-halus bg-kartu flex flex-wrap items-center justify-center gap-2 rounded-2xl border p-2 text-sm">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={playing ? 'tombol-utama px-4 py-1.5' : 'tombol-sekunder px-4 py-1.5'}
            style={{ minHeight: 48 }}
          >
            {playing ? '⏸ Jeda' : '▶ Putar'}
          </button>
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 48 }}
            aria-label="Mundur satu frame"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={() => stepFrame(1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 48 }}
            aria-label="Maju satu frame"
          >
            ⏭
          </button>
          <span aria-hidden className="bg-border-halus mx-1 hidden h-6 w-px sm:block" />
          {[1, 0.5, 0.25].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className={speed === value ? 'tombol-utama px-3 py-1.5' : 'tombol-sekunder px-3 py-1.5'}
              style={{ minHeight: 48 }}
            >
              {value === 1 ? '1×' : `${value}×`}
            </button>
          ))}
          <span aria-hidden className="bg-border-halus mx-1 hidden h-6 w-px sm:block" />
          <button
            type="button"
            onClick={() => setMirror((value) => !value)}
            aria-pressed={mirror}
            className={mirror ? 'tombol-utama px-3 py-1.5' : 'tombol-sekunder px-3 py-1.5'}
            style={{ minHeight: 48 }}
          >
            🪞 Cermin
          </button>
          <span ref={timeEl} className="sr-only" aria-live="off" />
          <input
            ref={sliderEl}
            type="range"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            readOnly
          />
        </div>
      ) : (
        <>
          <span ref={timeEl} className="sr-only" />
          <input
            ref={sliderEl}
            type="range"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            readOnly
          />
        </>
      )}
    </div>
  )
}
