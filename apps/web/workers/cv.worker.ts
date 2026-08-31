import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type Category,
  type Landmark,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import type {
  Backend,
  FromWorker,
  HandObservation,
  Handedness,
  PoseObservation,
  ToWorker,
  WorkerConfig,
} from '../features/practice/protocol'

type Runtime = {
  hand: HandLandmarker
  pose: PoseLandmarker
  backend: Backend
  canvas: OffscreenCanvas
}

let runtime: Runtime | null = null
let lastTimestamp = -1

const post = (message: FromWorker, transfer: Transferable[] = []) => {
  self.postMessage(message, transfer)
}

const toWorld = (points: Landmark[] | undefined) =>
  (points ?? []).map((p) => ({ x: p.x, y: p.y, z: p.z }))

const toOverlay = (points: NormalizedLandmark[] | undefined) =>
  (points ?? []).map((p) => ({ x: p.x, y: p.y }))

const pickHandedness = (categories: Category[] | undefined): Handedness =>
  categories?.[0]?.categoryName === 'Left' ? 'Left' : 'Right'

const build = async (config: WorkerConfig, delegate: 'GPU' | 'CPU'): Promise<Runtime> => {
  const fileset = await FilesetResolver.forVisionTasks(config.wasmBase)
  const canvas = new OffscreenCanvas(1, 1)

  const hand = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: config.handModel, delegate },
    numHands: config.numHands,
    runningMode: 'VIDEO',
    canvas,
  })

  const pose = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: config.poseModel, delegate },
    numPoses: 1,
    runningMode: 'VIDEO',
    canvas,
  })

  return { hand, pose, canvas, backend: delegate === 'GPU' ? 'GPU (WebGL)' : 'CPU (WASM SIMD)' }
}

const init = async (config: WorkerConfig) => {
  try {
    runtime = await build(config, config.delegate)
  } catch (gpuError) {
    if (config.delegate !== 'GPU') {
      post({ type: 'error', message: describe(gpuError) })
      return
    }
    try {
      runtime = await build(config, 'CPU')
    } catch (cpuError) {
      post({ type: 'error', message: describe(cpuError) })
      return
    }
  }
  lastTimestamp = -1
  post({ type: 'ready', backend: runtime.backend })
}

const describe = (err: unknown) => (err instanceof Error ? err.message : String(err))

const infer = (frame: VideoFrame | ImageBitmap, timestamp: number) => {
  if (!runtime) {
    frame.close()
    return
  }

  const ts = timestamp > lastTimestamp ? timestamp : lastTimestamp + 1
  lastTimestamp = ts
  const started = performance.now()

  try {
    const handResult = runtime.hand.detectForVideo(frame, ts)
    const poseResult = runtime.pose.detectForVideo(frame, ts)

    const hands: HandObservation[] = handResult.worldLandmarks.map((world, i) => ({
      handedness: pickHandedness(handResult.handedness[i]),
      score: handResult.handedness[i]?.[0]?.score ?? 0,
      world: toWorld(world),
      overlay: toOverlay(handResult.landmarks[i]),
    }))

    const poseWorld = poseResult.worldLandmarks[0]
    const pose: PoseObservation | null = poseWorld
      ? { world: toWorld(poseWorld), overlay: toOverlay(poseResult.landmarks[0]) }
      : null

    post({
      type: 'landmarks',
      hands,
      pose,
      timestamp: ts,
      inferenceMs: performance.now() - started,
    })
  } catch (err) {
    post({ type: 'error', message: describe(err) })
  } finally {
    frame.close()
  }
}

const stop = () => {
  runtime?.hand.close()
  runtime?.pose.close()
  runtime = null
  lastTimestamp = -1
}

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data
  if (message.type === 'init') void init(message.config)
  else if (message.type === 'frame') infer(message.frame, message.timestamp)
  else if (message.type === 'stop') stop()
}
