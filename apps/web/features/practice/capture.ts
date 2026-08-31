import type { CaptureFrame } from './protocol'

export type CaptureRoute = 'track-processor' | 'video-frame-callback'

export type CaptureUnavailable =
  | { ok: false; reason: 'denied' }
  | { ok: false; reason: 'no-camera' }
  | { ok: false; reason: 'unsupported' }
  | { ok: false; reason: 'error'; message: string }

export type CaptureHandle = {
  ok: true
  route: CaptureRoute
  settings: MediaTrackSettings
  stop: () => void
}

export type CaptureResult = CaptureHandle | CaptureUnavailable

export type CaptureOptions = {
  video: HTMLVideoElement
  onFrame: (frame: CaptureFrame, timestampMs: number) => void
  width?: number
  height?: number
  frameRate?: number
  route?: CaptureRoute
}

export const hasTrackProcessor = () => typeof globalThis.MediaStreamTrackProcessor !== 'undefined'

export const hasVideoFrameCallback = () =>
  typeof HTMLVideoElement !== 'undefined' &&
  'requestVideoFrameCallback' in HTMLVideoElement.prototype

export const detectRoute = (): CaptureRoute | null => {
  if (hasTrackProcessor()) return 'track-processor'
  if (hasVideoFrameCallback()) return 'video-frame-callback'
  return null
}

export const closeFrame = (frame: CaptureFrame) => {
  frame.close()
}

const classify = (err: unknown): CaptureUnavailable => {
  const name = err instanceof DOMException ? err.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
    return { ok: false, reason: 'denied' }
  }
  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'OverconstrainedError'
  ) {
    return { ok: false, reason: 'no-camera' }
  }
  return { ok: false, reason: 'error', message: err instanceof Error ? err.message : String(err) }
}

export const startCapture = async (options: CaptureOptions): Promise<CaptureResult> => {
  const { video, onFrame, width = 640, height = 480, frameRate = 30 } = options

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: 'unsupported' }
  }

  const route = options.route ?? detectRoute()
  if (!route) return { ok: false, reason: 'unsupported' }
  if (route === 'track-processor' && !hasTrackProcessor())
    return { ok: false, reason: 'unsupported' }
  if (route === 'video-frame-callback' && !hasVideoFrameCallback()) {
    return { ok: false, reason: 'unsupported' }
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width, height, frameRate, facingMode: 'user' },
      audio: false,
    })
  } catch (err) {
    return classify(err)
  }

  const track = stream.getVideoTracks()[0]
  if (!track) {
    stream.getTracks().forEach((t) => t.stop())
    return { ok: false, reason: 'no-camera' }
  }

  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  try {
    await video.play()
  } catch (err) {
    stream.getTracks().forEach((t) => t.stop())
    return classify(err)
  }

  let stopped = false
  let reader: ReadableStreamDefaultReader<VideoFrame> | null = null

  const stop = () => {
    if (stopped) return
    stopped = true
    reader?.cancel().catch(() => {})
    stream.getTracks().forEach((t) => t.stop())
    video.srcObject = null
  }

  if (route === 'track-processor') {
    const processor = new MediaStreamTrackProcessor({ track, maxBufferSize: 1 })
    reader = processor.readable.getReader() as ReadableStreamDefaultReader<VideoFrame>
    void (async () => {
      while (!stopped) {
        let result: ReadableStreamReadResult<VideoFrame>
        try {
          result = await reader.read()
        } catch {
          break
        }
        if (result.done) break
        const frame = result.value
        if (stopped) {
          frame.close()
          break
        }
        onFrame(frame, frame.timestamp / 1000)
      }
    })()
  } else {
    const tick = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (stopped) return
      createImageBitmap(video)
        .then((bitmap) => {
          if (stopped) {
            bitmap.close()
            return
          }
          onFrame(bitmap, metadata.mediaTime * 1000)
          video.requestVideoFrameCallback(tick)
        })
        .catch(() => {
          if (!stopped) video.requestVideoFrameCallback(tick)
        })
    }
    video.requestVideoFrameCallback(tick)
  }

  return { ok: true, route, settings: track.getSettings(), stop }
}
