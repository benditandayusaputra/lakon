export const featureDistance = (a: Float32Array, b: Float32Array): number => {
  let sum = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0)
    sum += d * d
  }
  return Math.sqrt(sum)
}

export const dtw = (
  a: readonly Float32Array[],
  b: readonly Float32Array[],
  dist = featureDistance,
): number => {
  if (a.length === 0 || b.length === 0) return Infinity
  const w = b.length
  let prev = new Float64Array(w + 1).fill(Infinity)
  let curr = new Float64Array(w + 1).fill(Infinity)
  prev[0] = 0
  for (let i = 1; i <= a.length; i++) {
    curr[0] = Infinity
    for (let j = 1; j <= w; j++) {
      const c = dist(a[i - 1]!, b[j - 1]!)
      curr[j] = c + Math.min(prev[j]!, curr[j - 1]!, prev[j - 1]!)
    }
    const t = prev
    prev = curr
    curr = t
  }
  return prev[w]! / (a.length + b.length)
}

export const confidence = (distance: number, tolerance: number): number =>
  distance <= 0 ? 1 : Math.max(0, Math.min(1, 1 - distance / tolerance))
