# Cross-device test checklist (manual)

Run on a production build (`LAKON_ALLOW_DRAFT=1 pnpm build && next start`).
Record results in the empty column. The "path" column is read from
/dev/pipeline (admin account required).

## Device matrix

| Device / browser           | Capture path (expected) | MediaPipe backend | Classification backend | Inference rate             | Pass? |
| -------------------------- | ----------------------- | ----------------- | ---------------------- | -------------------------- | ----- |
| Chrome desktop (macOS/Win) | track-processor         | GPU (WebGL)       | WebGPU                 | ≥ 24 fps                   |       |
| Safari desktop             | video-frame-callback    | GPU (WebGL)       | WASM SIMD              | ≥ 24 fps                   |       |
| Firefox desktop            | video-frame-callback    | GPU/CPU           | WASM SIMD              | ≥ 24 fps                   |       |
| Mid-range Chrome Android   | track-processor         | GPU (WebGL)       | WASM SIMD              | **≥ 24 fps (hard budget)** |       |
| Safari iOS                 | video-frame-callback    | GPU (WebGL)       | WASM SIMD              | ≥ 24 fps                   |       |

If Android runs below 24 fps, mitigate in this order (never downgrade
HandLandmarker):

1. Lower the capture resolution in `features/practice/capture.ts` (640×480 → 480×360).
2. Run PoseLandmarker every 3 frames in `workers/cv.worker.ts`.
3. Lower the classification `inferEvery` from the /dev/pipeline panel.

## Flows to check on each device

- [ ] Landing → try-a-sign block without signing in, camera on, verification running
- [ ] Camera permission denied → the "Latihan tanpa kamera" (practice without camera) path works
- [ ] /dev/mirror: open palm, fist, point; rotate the wrist 180°; two hands; no jitter when still
- [ ] Test with a left-handed person and different hand sizes (M2 gate)
- [ ] /dev/verify: deliberately get one finger wrong → the feedback sentence names that finger (M6 gate)
- [ ] Full scenario in direction A and direction B through to the summary
- [ ] Airplane mode after the first load → the whole scenario still runs
- [ ] Progress persists after closing and reopening the browser
- [ ] prefers-reduced-motion on → mood transitions are off

## Before the presentation

- [ ] Record a 2–3 minute demo video as a backup (the app depends on the webcam and lighting)
- [ ] Warm up the system at least 15 minutes before presenting (SW cache filled, models loaded)
- [ ] Prepare a warmed-up backup device
- [ ] Test the demo from a network the team does not own (a different hotspot)
- [ ] Make sure the demo account (`demo@lakon.id`) has progress: `node tools/seed.mjs`
- [ ] Check that /dev/health is all green before presenting
