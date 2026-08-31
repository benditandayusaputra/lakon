import { expect, test } from 'vitest'
import { dtw, featureDistance, handFeatures, jointAngle, shoulderWidth } from './index'

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
  expect(jointAngle({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })).toBeCloseTo(
    0,
    6,
  )
})
