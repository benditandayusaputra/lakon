export type Point3 = { x: number; y: number; z: number }
export type Point2 = { x: number; y: number }

export type Handedness = 'Left' | 'Right'

export type HandObservation = {
  handedness: Handedness
  score: number
  world: Point3[]
  overlay: Point2[]
}

export type PoseObservation = {
  world: Point3[]
  overlay: Point2[]
}

export type Backend = 'GPU (WebGL)' | 'CPU (WASM SIMD)'

export type WorkerConfig = {
  wasmBase: string
  handModel: string
  poseModel: string
  numHands: number
  delegate: 'GPU' | 'CPU'
}

export const MEDIAPIPE_VERSION = '0.10.35'

export const DEFAULT_WORKER_CONFIG: WorkerConfig = {
  wasmBase: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`,
  handModel:
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  poseModel:
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  numHands: 2,
  delegate: 'GPU',
}

export type CaptureFrame = VideoFrame | ImageBitmap

export type ToWorker =
  | { type: 'init'; config: WorkerConfig }
  | { type: 'frame'; frame: CaptureFrame; timestamp: number }
  | { type: 'stop' }

export type FromWorker =
  | { type: 'ready'; backend: Backend }
  | {
      type: 'landmarks'
      hands: HandObservation[]
      pose: PoseObservation | null
      timestamp: number
      inferenceMs: number
    }
  | { type: 'error'; message: string }

export const POSE_LEFT_SHOULDER = 11
export const POSE_RIGHT_SHOULDER = 12
