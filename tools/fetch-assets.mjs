import { cp, mkdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const publicDir = join(root, 'apps', 'web', 'public')

const exists = async (path) => {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

const wasmSource = join(
  root,
  'node_modules',
  '.pnpm',
  'node_modules',
  '@mediapipe',
  'tasks-vision',
  'wasm',
)
const wasmFallback = join(root, 'apps', 'web', 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')
const wasmTarget = join(publicDir, 'mediapipe', 'wasm')

const from = (await exists(wasmSource)) ? wasmSource : wasmFallback
if (!(await exists(from))) {
  console.error('paket @mediapipe/tasks-vision belum terpasang, jalankan pnpm install')
  process.exit(1)
}
await mkdir(wasmTarget, { recursive: true })
await cp(from, wasmTarget, { recursive: true })
console.log('WASM MediaPipe disalin ke public/mediapipe/wasm')

const MODELS = [
  [
    'hand_landmarker.task',
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  ],
  [
    'pose_landmarker_lite.task',
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  ],
]

const modelDir = join(publicDir, 'models', 'mediapipe')
await mkdir(modelDir, { recursive: true })
for (const [name, url] of MODELS) {
  const target = join(modelDir, name)
  if (await exists(target)) {
    console.log(`${name} sudah ada, lewati`)
    continue
  }
  const response = await fetch(url)
  if (!response.ok) {
    console.error(`gagal mengunduh ${name}: ${response.status}`)
    process.exit(1)
  }
  await writeFile(target, Buffer.from(await response.arrayBuffer()))
  console.log(`${name} terunduh (${((await stat(target)).size / 1e6).toFixed(1)} MB)`)
}
