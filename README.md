# Lakon

A web app for learning Indonesian Sign Language (BISINDO, Jakarta variant)
through real transaction scenarios. Learners study each sign from a video of a
real signer or a 3D avatar, practise it in front of their webcam with on-device
verification, then play a full branching conversation simulation.

One scenario, two roles: the Deaf side learns to carry out the transaction,
the service-worker side learns to serve Deaf customers. Lakon is a language
learning tool for both sides — never framed as assistance for one.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- React Three Fiber + three.js + @pixiv/three-vrm (3D avatar)
- MediaPipe Tasks Vision in a Web Worker (hand + pose landmarks, self-hosted)
- ONNX Runtime Web (WebGPU, WASM SIMD fallback) for the optional classifier
- Custom sign compiler: one parametric spec → avatar keyframes **and** the
  DTW verification reference (single source of truth)
- Drizzle ORM + Postgres (Neon), session auth, progress saved straight to the
  database, service-worker offline cache
- Vitest (63 unit tests), Playwright (13 end-to-end tests incl. offline and
  camera-denied flows)

## Getting started

```bash
pnpm install
cp .env.example .env          # set DATABASE_URL (Postgres/Neon)
pnpm db:push                  # apply schema
node tools/seed.mjs           # demo + admin + validator accounts
pnpm dev                      # http://localhost:3000 (assets auto-fetched)
```

Human demonstration videos: put renamed clips (e.g. `SAMA SAMA.MP4`) in
`content/BISINDO/` (kept out of git) and run `pnpm peraga`. It crops them to
4:3, encodes 720p H.264 without audio into `apps/web/public/peraga/` and links
each clip to the sign with the matching name.

Production build: `LAKON_ALLOW_DRAFT=1 pnpm build`. Without that variable the
build **fails if any sign is not `approved`** — that is the content-governance
gate, enforced by script, not memory.

Current coffee-shop signs (halo, terima-kasih, panas) are drafts derived from
videos of Deaf signers (see [docs/attribution.md](docs/attribution.md)),
honestly labeled in the UI and awaiting a validation session.

`predev`/`prebuild` run `tools/fetch-assets.mjs`, which copies the MediaPipe
WASM from node_modules and downloads the two landmark models into
`apps/web/public/` (self-hosted so practice works offline and without a CDN).

## Demo accounts (seeded)

| Role      | Email                 | Password          |
| --------- | --------------------- | ----------------- |
| Learner   | `demo@lakon.id`       | CobaLakon2026     |
| Admin     | `admin@lakon.id`      | AdminLakon2026    |
| Validator | `validator@lakon.id`  | ValidasiLakon2026 |
| Learner   | `bendi@lakon.id`      | BendiLakon2026    |
| Learner   | `kevin@lakon.id`      | KevinLakon2026    |
| Learner   | `jessica@lakon.id`    | JessicaLakon2026  |
| Learner   | `nawal@lakon.id`      | NawalLakon2026    |
| Demo      | `demo.baru@lakon.id`  | BaruLakon2026     |
| Demo      | `demo.dua@lakon.id`   | DuaLakon2026      |
| Demo      | `demo.penuh@lakon.id` | PenuhLakon2026    |

The demo account ships with partial progress so judges see the app in use.
`/dev/*` and `/tools/*` require the admin or validator role; validators may
only change `review` fields of content, never sign parameters.

For presentations, `demo.baru` starts empty, `demo.dua` has the first two
scenes finished (scene three unlocked) and `demo.penuh` has all five scenes
finished, in both roles. Re-running `node tools/seed.mjs` resets all three.

## Technical documentation

- [docs/architecture.md](docs/architecture.md) — data-flow diagram, package
  layout, key decisions
- [docs/attribution.md](docs/attribution.md) — third-party licenses and the
  VRM avatar's embedded permission metadata
- [docs/accessibility-audit/](docs/accessibility-audit/) — axe-core (0
  violations across 10 screens) and Lighthouse reports, performance budget
- [docs/uji-lintas-perangkat.md](docs/uji-lintas-perangkat.md) — manual
  cross-device checklist and presentation prep

Internal pages (admin): `/dev/pipeline` (CV diagnostics), `/dev/mirror`
(rotation-solver mirror), `/dev/compile` (sign preview), `/dev/verify` (DTW
scoring), `/dev/health` (system health), `/tools/collect` (training-data
collector), `/tools/sign-editor` (sign editor with video-to-draft import).

Scripts: `pnpm test` (unit), `pnpm e2e` (Playwright, builds production and
uses a fake camera feed), `pnpm check:content` (content validator),
`pnpm typecheck`, `pnpm lint`, `python3 training/train.py` (classifier
training + ONNX export with per-contributor accuracy reporting).

## Design decisions made manually by the team

These are deliberate human decisions, recorded here as required by our design
handoff checklist:

- **Two-direction concept** — every scenario playable from the Deaf side and
  the service side — is the product's core idea and is surfaced in the UI, not
  hidden in a menu.
- **Quiet zone vs. lively zone**: practice and demonstration screens use a
  fixed neutral backdrop (`#6e7a86`) with a radial luminance-equalizing
  gradient behind the hands; personality (Betawi-derived, desaturated
  palettes) lives only on landing, scenario cards, and summaries.
- **No red for "not yet right"** and no color-only states; feedback always
  pairs icon + text + position. Red is reserved for real system failures.
- **The emergency scenario (S5) is deliberately the calmest palette** —
  anxious people learn worse; tension comes from the conversation content.
- **17 px base typography**, short sentences: many Deaf users read long
  written Indonesian with extra effort.
- **No audio anywhere**, and no hearing metaphors in copy.
- **Sign forms are never guessed**: BISINDO signs enter the product only
  after validation by Deaf signers or interpreters (enforced by the build
  gate). The current `uji-gerak` sign is an honestly-labeled technical test.

## Credits

3D avatar (development stand-in): **"Seed-san" © VirtualCast, Inc.**, used
under the [VRM Public License 1.0](https://vrm.dev/licenses/1.0/). See
[docs/attribution.md](docs/attribution.md) for full details.
