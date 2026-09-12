'use client'

import { FlipHorizontal, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { CompiledSign, CompilerRig } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { CompiledAvatar, type Playback } from '@/components/compile-lab'
import { signTersimpan } from '@/features/content/use-content'
import {
  KAMERA_SUDUT,
  SUDUT_PERAGA,
  sudutTersedia,
  sumberSudut,
  type SudutPeraga,
} from '@/features/ui/peraga'

const LABEL_SUDUT: Record<SudutPeraga, string> = {
  depan: 'Depan',
  kanan: 'Kanan',
  kiri: 'Kiri',
}

export function AvatarStage({
  compiled,
  sign,
  showControls = false,
  sudutKontrol,
  mirrorDefault = false,
  className = '',
  stageClassName = '',
  signLabel,
  onRigReady,
}: {
  compiled: CompiledSign | null
  sign?: Sign
  showControls?: boolean
  sudutKontrol?: boolean
  mirrorDefault?: boolean
  className?: string
  stageClassName?: string
  signLabel?: string
  onRigReady?: (rig: CompilerRig) => void
}) {
  const playbackRef = useRef<Playback>({ compiled: null, playing: true, speed: 1, time: 0 })
  const timeEl = useRef<HTMLSpanElement | null>(null)
  const sliderEl = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [mirror, setMirror] = useState(mirrorDefault)
  const [sudut, setSudut] = useState<SudutPeraga>('depan')
  const [rigError, setRigError] = useState<string | null>(null)
  const [videoGagal, setVideoGagal] = useState(false)
  const [sempit, setSempit] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const onRigReadyRef = useRef(onRigReady)
  onRigReadyRef.current = onRigReady

  const isyarat = sign ?? (compiled ? signTersimpan(compiled.id) : undefined)
  const video = isyarat?.media?.video
  const sumber = videoGagal ? undefined : sumberSudut(video, sudut)

  useEffect(() => {
    playbackRef.current.compiled = compiled
    playbackRef.current.time = 0
  }, [compiled])

  useEffect(() => {
    playbackRef.current.playing = playing
    playbackRef.current.speed = speed
  }, [playing, speed])

  useEffect(() => {
    setVideoGagal(false)
  }, [isyarat?.id])

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSempit(entry.contentRect.width < 520)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const dekat = sempit ? 0.92 : 1
  const posisiKamera = [
    KAMERA_SUDUT[sudut][0] * dekat,
    KAMERA_SUDUT[sudut][1] + (sempit ? 0.08 : 0),
    KAMERA_SUDUT[sudut][2] * dekat,
  ] as const
  const adaKontrol = Boolean(sudutKontrol ?? showControls)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.playbackRate = speed
    if (playing) void el.play().catch(() => {})
    else el.pause()
  }, [playing, speed, sumber])

  const langkahFrame = (arah: 1 | -1) => {
    setPlaying(false)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + arah * 0.1))
      return
    }
    const aktif = playbackRef.current.compiled
    if (!aktif) return
    playbackRef.current.playing = false
    playbackRef.current.time = Math.min(
      aktif.duration,
      Math.max(0, playbackRef.current.time + (arah * 1000) / aktif.fps),
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        ref={stageRef}
        className={`relative min-h-0 flex-1 ${adaKontrol ? 'max-sm:min-h-[26rem]' : ''} ${stageClassName}`}
      >
        <div className={`absolute inset-0 ${mirror ? '-scale-x-100' : ''}`}>
          {sumber ? (
            <video
              key={sumber}
              ref={videoRef}
              src={sumber}
              poster={isyarat?.media?.poster}
              className="h-full w-full object-contain"
              playsInline
              muted
              loop
              autoPlay
              onError={() => setVideoGagal(true)}
            />
          ) : (
            <Canvas camera={{ fov: 30, position: [...posisiKamera] as [number, number, number] }}>
              <CompiledAvatar
                playbackRef={playbackRef}
                timeEl={timeEl}
                sliderEl={sliderEl}
                sudut={posisiKamera}
                onRigReady={(rig) => onRigReadyRef.current?.(rig)}
                onRigError={setRigError}
              />
            </Canvas>
          )}
        </div>
        <p className="text-halaman absolute right-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
          {sumber ? 'video penanda' : 'peraga 3D'} · {sudut}
        </p>
        {signLabel ? (
          <p className="text-halaman absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-wide">
            {signLabel}
          </p>
        ) : null}
      </div>
      {rigError ? (
        <p role="alert" className="text-galat text-sm">
          Peraga gagal dimuat: {rigError}
        </p>
      ) : null}
      {(sudutKontrol ?? showControls) ? (
        <div
          role="group"
          aria-label="Sudut pandang peragaan"
          className="border-border-halus bg-kartu flex items-center justify-center gap-2 rounded-2xl border p-2 text-sm"
        >
          {SUDUT_PERAGA.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSudut(id)}
              aria-pressed={sudut === id}
              disabled={sumber ? !sudutTersedia(video, id) : false}
              className={
                sudut === id
                  ? 'tombol-utama flex-1 px-3 py-1.5'
                  : 'tombol-sekunder flex-1 px-3 py-1.5'
              }
              style={{ minHeight: 48 }}
            >
              {LABEL_SUDUT[id]}
            </button>
          ))}
        </div>
      ) : null}
      {showControls ? (
        <div className="border-border-halus bg-kartu flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border p-2 text-sm sm:gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={playing ? 'tombol-utama px-3 py-1.5' : 'tombol-sekunder px-3 py-1.5'}
            style={{ minHeight: 48 }}
          >
            {playing ? (
              <Pause aria-hidden className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom" />
            ) : (
              <Play aria-hidden className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom" />
            )}
            {playing ? 'Jeda' : 'Putar'}
          </button>
          <button
            type="button"
            onClick={() => langkahFrame(-1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 48 }}
            aria-label="Mundur satu frame"
          >
            <SkipBack aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => langkahFrame(1)}
            className="tombol-sekunder px-3 py-1.5"
            style={{ minHeight: 48 }}
            aria-label="Maju satu frame"
          >
            <SkipForward aria-hidden className="h-4 w-4" />
          </button>
          <span aria-hidden className="bg-border-halus mx-1 hidden h-6 w-px sm:block" />
          {[1, 0.5, 0.25].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className={
                speed === value ? 'tombol-utama px-3 py-1.5' : 'tombol-sekunder px-3 py-1.5'
              }
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
            <FlipHorizontal
              aria-hidden
              className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
            />
            Cermin
          </button>
        </div>
      ) : null}
      <span ref={timeEl} className="sr-only" aria-live="off" />
      <input ref={sliderEl} type="range" className="sr-only" tabIndex={-1} aria-hidden readOnly />
    </div>
  )
}
