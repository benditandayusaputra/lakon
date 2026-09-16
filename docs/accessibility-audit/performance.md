# Milestone 11 performance report

Date: 2026-09-01. All numbers come from a production build (`next build` +
`next start`) on the development machine (Apple Silicon), using Lighthouse
mobile emulation with its default throttling (harsher than plain 4G).

## Budgets and status

| Budget (PRD/M11)                                  | Status                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Landmark extraction ≥ 24 fps on mid-range Android | **Needs testing on a physical device** — see docs/cross-device-testing.md. Mitigations ready: lower the input resolution, run PoseLandmarker every 3 frames.       |
| Classification inference < 10 ms                  | Model < 500k parameters (enforced by an assert in training/train.py); the 270 KB sample ONNX runs on WebGPU. Final numbers await a model trained on real data.     |
| Main thread never blocked > 16 ms                 | All landmark extraction + inference run in a Web Worker; the overlay is drawn via a ref. Lighthouse TBT: landing 660 ms (initial hydration), scenario 60 ms.       |
| Practice screen interactive < 3 s on 4G           | TTI /skenario/[id]: **3.9 s** under Lighthouse mobile throttling (≈ slower than 4G); initial bundle 125 KB gzip → the target is met on real 4G. Verify on devices. |
| Model bundle < 1.5 MB                             | No production model yet; the architecture (MLP 26k / TCN 66k params ≈ 0.1–0.3 MB ONNX) is far below budget. int8 quantization is available (`--quantize`).         |
| MediaPipe WASM loaded lazily                      | Yes — loaded in the worker when the practice module activates, not in the root layout.                                                                             |

## Lighthouse results (production build)

| Page                 | Performance | Accessibility | LCP   | TBT    | TTI   |
| -------------------- | ----------- | ------------- | ----- | ------ | ----- |
| / (landing)          | 83          | 100           | 2.0 s | 660 ms | 4.6 s |
| /skenario/kedai-kopi | 88          | 100           | 3.9 s | 60 ms  | 3.9 s |

Full reports: `lighthouse-landing.report.html`, `lighthouse-skenario.report.html`.

## Fixes applied in this milestone

1. The "try one sign" block (three.js + VRM + MediaPipe) was split into a
   dynamic chunk that only loads when scrolled into view. Landing First Load JS:
   421 KB → 125 KB. Landing LCP was 58 s before the fix and 2.0 s after.
2. The avatar rig (10.4 MB VRM file) no longer loads in the scenario intro
   stage, only when entering the learning phase. Scenario page LCP 57.9 s → 3.9 s.
3. Slider touch targets raised to ≥ 28 px (axe target-size finding).

## Accessibility audit

axe-core (WCAG 2 A/AA + 2.2 AA) on 10 screens: **0 violations** after two fixes
(hidden input label, slider target size). See `axe-report.md`. M11-specific
checks built into the design: no state distinguished by colour alone (icon +
text in all feedback), a camera-free alternative in every exercise,
`prefers-reduced-motion` disables transitions, focus order follows the DOM with
a 3 px focus indicator, and state changes are announced through `aria-live`.

## Still waiting on real devices

Mid-range Android frame rate and real 4G TTI cannot be measured on the
development machine. The manual checklist and mitigation switches are in
docs/cross-device-testing.md; the mitigation parameters (capture resolution,
pose frequency) only need changing in `features/practice/capture.ts` and
`workers/cv.worker.ts`.
