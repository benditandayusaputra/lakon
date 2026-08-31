import { FEATURE_LAYOUT, HAND_FEATURE_DIM } from '@lakon/cv-core'
import { FINGERS, type Handshape, type Keyframe, type Sign } from '@lakon/sign-schema'

export const SAMPLE_HZ = 20

export const toRad = (d: number) => (d * Math.PI) / 180

export type Side = 'left' | 'right'

export type AvatarPose = {
  t: number
  flex: Record<string, [number, number, number]>
  spread: number
  orientation: { pitch: number; yaw: number; roll: number }
  location: { x: number; y: number; z: number }
}

export type CompiledTrack = {
  side: Side
  poses: AvatarPose[]
  reference: Float32Array[]
}

export type CompiledSign = {
  id: string
  duration: number
  tracks: CompiledTrack[]
}

const lerp = (a: number, b: number, u: number) => a + (b - a) * u

const lerpAngle = (a: number, b: number, u: number) => {
  let d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI
  if (d < -Math.PI) d += 2 * Math.PI
  return a + d * u
}

const poseAt = (
  frames: readonly Keyframe[],
  shapes: Map<string, Handshape>,
  t: number,
): AvatarPose => {
  let i = 0
  while (i < frames.length - 2 && frames[i + 1]!.t <= t) i++
  const a = frames[i]!
  const b = frames[Math.min(i + 1, frames.length - 1)]!
  const span = b.t - a.t
  const u = span > 0 ? Math.min(1, Math.max(0, (t - a.t) / span)) : 0

  const sa = shapes.get(a.handshape)
  const sb = shapes.get(b.handshape)
  if (!sa) throw new Error(`handshape tidak ditemukan: ${a.handshape}`)
  if (!sb) throw new Error(`handshape tidak ditemukan: ${b.handshape}`)

  const flex: Record<string, [number, number, number]> = {}
  for (const f of FINGERS) {
    const x = sa.flex[f]
    const y = sb.flex[f]
    flex[f] = [
      lerp(toRad(x[0]), toRad(y[0]), u),
      lerp(toRad(x[1]), toRad(y[1]), u),
      lerp(toRad(x[2]), toRad(y[2]), u),
    ]
  }

  return {
    t,
    flex,
    spread: lerp(toRad(sa.spread), toRad(sb.spread), u),
    orientation: {
      pitch: lerpAngle(toRad(a.orientation.pitch), toRad(b.orientation.pitch), u),
      yaw: lerpAngle(toRad(a.orientation.yaw), toRad(b.orientation.yaw), u),
      roll: lerpAngle(toRad(a.orientation.roll), toRad(b.orientation.roll), u),
    },
    location: {
      x: lerp(a.location.x, b.location.x, u),
      y: lerp(a.location.y, b.location.y, u),
      z: lerp(a.location.z, b.location.z, u),
    },
  }
}

export const poseToFeatures = (p: AvatarPose): Float32Array => {
  const out = new Float32Array(HAND_FEATURE_DIM)
  let i = FEATURE_LAYOUT.flex[0]
  for (const f of FINGERS) {
    const v = p.flex[f]!
    out[i++] = v[0]
    out[i++] = v[1]
    out[i++] = v[2]
  }
  out[FEATURE_LAYOUT.spread[0]] = p.spread
  out[FEATURE_LAYOUT.orientation[0]] = p.orientation.pitch
  out[FEATURE_LAYOUT.orientation[0] + 1] = p.orientation.yaw
  out[FEATURE_LAYOUT.orientation[0] + 2] = p.orientation.roll
  out[FEATURE_LAYOUT.location[0]] = p.location.x
  out[FEATURE_LAYOUT.location[0] + 1] = p.location.y
  out[FEATURE_LAYOUT.location[0] + 2] = p.location.z
  return out
}

export const compileSign = (sign: Sign, handshapes: readonly Handshape[]): CompiledSign => {
  const shapes = new Map(handshapes.map((h) => [h.id, h]))
  const step = 1000 / SAMPLE_HZ
  const tracks: CompiledTrack[] = []
  let duration = 0

  for (const side of ['right', 'left'] as const) {
    const frames = sign.tracks[side]
    if (!frames || frames.length < 2) continue
    const end = frames[frames.length - 1]!.t
    duration = Math.max(duration, end)

    const poses: AvatarPose[] = []
    for (let t = 0; t <= end; t += step) poses.push(poseAt(frames, shapes, t))
    if (poses[poses.length - 1]!.t < end) poses.push(poseAt(frames, shapes, end))

    tracks.push({ side, poses, reference: poses.map(poseToFeatures) })
  }

  if (tracks.length === 0) throw new Error(`isyarat tanpa track: ${sign.id}`)
  return { id: sign.id, duration, tracks }
}
