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
  onRigReady,
}: {
  compiled: CompiledSign | null
  showControls?: boolean
  mirrorDefault?: boolean
  className?: string
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
      <div className={`relative min-h-0 flex-1 ${mirror ? '-scale-x-100' : ''}`}>
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
      {rigError ? (
        <p role="alert" className="text-galat text-sm">
          Avatar gagal dimuat: {rigError}
        </p>
      ) : null}
      {showControls ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 44 }}
          >
            {playing ? '⏸ Jeda' : '▶ Putar'}
          </button>
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 44 }}
            aria-label="Mundur satu frame"
          >
            ⏮ frame
          </button>
          <button
            type="button"
            onClick={() => stepFrame(1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 44 }}
            aria-label="Maju satu frame"
          >
            frame ⏭
          </button>
          <label className="flex items-center gap-1">
            <span>Kecepatan</span>
            <select
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="border-border-tegas rounded-md border px-2 py-1.5"
            >
              <option value={1}>1×</option>
              <option value={0.5}>0.5×</option>
              <option value={0.25}>0.25×</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={mirror}
              onChange={(event) => setMirror(event.target.checked)}
            />
            <span>Mode cermin</span>
          </label>
          <span className="text-teks-samar text-xs">seret avatar untuk memutar sudut</span>
          <span ref={timeEl} className="sr-only" aria-live="off" />
          <input ref={sliderEl} type="range" className="sr-only" tabIndex={-1} readOnly />
        </div>
      ) : (
        <>
          <span ref={timeEl} className="sr-only" />
          <input ref={sliderEl} type="range" className="sr-only" tabIndex={-1} readOnly />
        </>
      )}
    </div>
  )
}
