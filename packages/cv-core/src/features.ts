export type Vec3 = { x: number; y: number; z: number }

export const HAND_FEATURE_DIM = 22

export const FEATURE_LAYOUT = {
  flex: [0, 15],
  spread: [15, 16],
  orientation: [16, 19],
  location: [19, 22],
} as const

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})
const len = (a: Vec3) => Math.sqrt(dot(a, a))
const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}

export const jointAngle = (a: Vec3, b: Vec3, c: Vec3): number => {
  const u = norm(sub(a, b))
  const v = norm(sub(c, b))
  return Math.PI - Math.acos(Math.min(1, Math.max(-1, dot(u, v))))
}

const FINGER_CHAINS: readonly (readonly [number, number, number, number])[] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
]

export const POSE = { leftShoulder: 11, rightShoulder: 12 } as const

export type PoseFrame = readonly Vec3[]
export type HandFrame = readonly Vec3[]

export const shoulderWidth = (pose: PoseFrame): number => {
  const l = pose[POSE.leftShoulder]
  const r = pose[POSE.rightShoulder]
  if (!l || !r) return 0
  return len(sub(l, r))
}

export const shoulderCenter = (pose: PoseFrame): Vec3 => {
  const l = pose[POSE.leftShoulder]
  const r = pose[POSE.rightShoulder]
  if (!l || !r) return { x: 0, y: 0, z: 0 }
  return { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2, z: (l.z + r.z) / 2 }
}

export const handFeatures = (hand: HandFrame, pose: PoseFrame): Float32Array => {
  const out = new Float32Array(HAND_FEATURE_DIM)
  const wrist = hand[0]
  if (!wrist) return out

  let i = 0
  for (const chain of FINGER_CHAINS) {
    const [a, b, c, d] = chain
    const p0 = wrist
    const p1 = hand[a]
    const p2 = hand[b]
    const p3 = hand[c]
    const p4 = hand[d]
    if (p0 && p1 && p2) out[i] = jointAngle(p0, p1, p2)
    if (p1 && p2 && p3) out[i + 1] = jointAngle(p1, p2, p3)
    if (p2 && p3 && p4) out[i + 2] = jointAngle(p2, p3, p4)
    i += 3
  }

  const indexMcp = hand[5]
  const pinkyMcp = hand[17]
  if (indexMcp && pinkyMcp) {
    const u = norm(sub(indexMcp, wrist))
    const v = norm(sub(pinkyMcp, wrist))
    out[15] = Math.acos(Math.min(1, Math.max(-1, dot(u, v))))
  }

  if (indexMcp && pinkyMcp) {
    const forward = norm(sub(indexMcp, wrist))
    const side = norm(sub(pinkyMcp, wrist))
    const palm = norm(cross(forward, side))
    out[16] = Math.atan2(palm.y, palm.z)
    out[17] = Math.atan2(palm.x, palm.z)
    const up = norm(cross(palm, forward))
    out[18] = Math.atan2(up.x, up.y)
  }

  const w = shoulderWidth(pose) || 1
  const c = shoulderCenter(pose)
  out[19] = (wrist.x - c.x) / w
  out[20] = (wrist.y - c.y) / w
  out[21] = (wrist.z - c.z) / w

  return out
}
