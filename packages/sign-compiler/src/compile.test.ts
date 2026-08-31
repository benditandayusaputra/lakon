import { expect, test } from 'vitest'
import { dtw, featureDistance, handFeatures, jointAngle, shoulderWidth } from '@lakon/cv-core'
import { parseSign, type Handshape } from '@lakon/sign-schema'
import { compileSign, poseToFeatures, SAMPLE_HZ, toRad } from './index'

const flat: Handshape = {
  id: 'telapak-datar',
  label: 'telapak datar',
  flex: {
    thumb: [0, 0, 0],
    index: [0, 0, 0],
    middle: [0, 0, 0],
    ring: [0, 0, 0],
    pinky: [0, 0, 0],
  },
  spread: 0,
}

const fist: Handshape = { ...flat, id: 'kepal', label: 'kepal', flex: {
  thumb: [90, 90, 90],
  index: [90, 90, 90],
  middle: [90, 90, 90],
  ring: [90, 90, 90],
  pinky: [90, 90, 90],
}, spread: 0 }

const sign = parseSign({
  id: 'uji',
  gloss: 'UJI',
  dominant: 'right',
  hands: 'one',
  tracks: {
    right: [
      { t: 0, handshape: 'telapak-datar', location: { x: 0, y: 0, z: 0 }, orientation: { pitch: 0, yaw: 0, roll: 0 } },
      { t: 1000, handshape: 'kepal', location: { x: 1, y: 0, z: 0 }, orientation: { pitch: 0, yaw: 90, roll: 0 } },
    ],
  },
  review: { status: 'approved' },
})

test('derajat di konten menjadi radian di runtime', () => {
  const c = compileSign(sign, [flat, fist])
  const last = c.tracks[0]!.poses.at(-1)!
  expect(last.flex.index![0]).toBeCloseTo(toRad(90), 5)
  expect(last.orientation.yaw).toBeCloseTo(toRad(90), 5)
})

test('resample sesuai SAMPLE_HZ dan berakhir tepat di durasi', () => {
  const c = compileSign(sign, [flat, fist])
  const poses = c.tracks[0]!.poses
  expect(c.duration).toBe(1000)
  expect(poses.at(-1)!.t).toBe(1000)
  expect(poses.length).toBe(SAMPLE_HZ + 1)
})

test('referensi verifikasi memakai layout fitur yang sama dengan cv-core', () => {
  const c = compileSign(sign, [flat, fist])
  const ref = c.tracks[0]!.reference
  expect(ref[0]!.length).toBe(poseToFeatures(c.tracks[0]!.poses[0]!).length)
  expect(dtw(ref, ref)).toBeCloseTo(0, 6)
  expect(dtw(ref, [...ref].reverse())).toBeGreaterThan(0)
})

test('dtw simetris dan nol untuk urutan identik', () => {
  const a = [new Float32Array([0, 0]), new Float32Array([1, 1])]
  const b = [new Float32Array([0, 0]), new Float32Array([1, 1]), new Float32Array([1, 1])]
  expect(dtw(a, a)).toBe(0)
  expect(dtw(a, b)).toBeCloseTo(dtw(b, a), 9)
  expect(featureDistance(a[0]!, a[1]!)).toBeCloseTo(Math.SQRT2, 6)
})

test('fitur tangan dinormalisasi terhadap lebar bahu', () => {
  const pose = Array.from({ length: 13 }, () => ({ x: 0, y: 0, z: 0 }))
  pose[11] = { x: 0.2, y: 0, z: 0 }
  pose[12] = { x: -0.2, y: 0, z: 0 }
  const hand = Array.from({ length: 21 }, (_, i) => ({ x: i * 0.01, y: 0.4, z: 0 }))
  hand[5] = { x: 0.05, y: 0.45, z: 0 }
  hand[17] = { x: -0.05, y: 0.45, z: 0 }

  expect(shoulderWidth(pose)).toBeCloseTo(0.4, 6)
  const f = handFeatures(hand, pose)
  expect(f.length).toBe(22)
  expect(f[20]).toBeCloseTo(0.4 / 0.4, 6)
  expect(jointAngle({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })).toBeCloseTo(0, 6)
})
