# Lakon

A web app for learning Indonesian Sign Language (BISINDO, Jakarta variant)
through real transaction scenarios. Learners study each sign from a video of a
real signer or a 3D avatar, practise it in front of their webcam with on-device
verification, then play a full branching conversation simulation.

One scenario, two roles: the Deaf side learns to carry out the transaction,
the service-worker side learns to serve Deaf customers. Lakon is a language
learning tool for both sides — never framed as assistance for one.

**Live demo: <https://lakon-learn.vercel.app>** — built for the GAYATAMA 5
International Web Technology Competition 2026. The app is in Indonesian and
the landing page has an English switch. Practice uses a webcam (desktop Chrome
recommended); every exercise also has a camera-free path.

## Why it matters

Communication between Deaf people and service workers breaks down on both
sides, yet most tools only translate signs for the hearing party and teach
vocabulary rather than whole situations. Lakon teaches both sides the same
everyday transactions, in the language Deaf Indonesians use with each other.

| SDG                                   | Contribution                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| 4 Quality Education                   | BISINDO lessons built around real situations, outside formal special education |
| 10 Reduced Inequalities               | Service workers learn to adapt instead of leaving the burden on Deaf customers |
| 8 Decent Work and Economic Growth     | Job-interview scenario and inclusive service skills                            |
| 3 Good Health and Well-being          | Health-centre and emergency scenarios                                          |
| 11 Sustainable Cities and Communities | Transport scenario for independent mobility                                    |

## Features

- **Five scenes, two roles**: coffee shop, community health centre, transport,
  emergency and job interview, each an eight-step conversation playable from
  the Deaf side or the service-worker side, with progress tracked per role.
- **Journey map**: scenes unlock in order and a walking character travels to
  the next one; checkpoints resume a scene where the learner left it.
- **Sign demonstration**: a real signer's video by default, or a 3D avatar with
  front, right and left views; both offer 1×, 0.5× and 0.25× speed, step playback and a mirror toggle.
- **Webcam practice verified on the device**: MediaPipe runs in a Web Worker,
  and DTW against the compiled reference highlights the part of the hand to
  fix. No video frame leaves the device. In the learning phase, three failed attempts reveal the demonstration and a self-comparison option.
- **Reading practice for the service side**: the customer signs and the learner
  picks the meaning.
- **Accessible by design**: no audio, no colour-only states, keyboard-operable controls and `prefers-reduced-motion` support.

## Sample accounts

Sign in at <https://lakon-learn.vercel.app/masuk>. Every account below is
created by `node tools/seed.mjs`; re-running it resets the progress of the
four `demo` accounts.

| Email                 | Password         | Role    | What you see                                                   |
| --------------------- | ---------------- | ------- | -------------------------------------------------------------- |
| `demo.baru@lakon.id`  | BaruLakon2026    | Learner | Brand-new account: no progress, only scene 1 open              |
| `demo.dua@lakon.id`   | DuaLakon2026     | Learner | Scenes 1–2 finished, scene 3 unlocked, in both roles           |
| `demo.penuh@lakon.id` | PenuhLakon2026   | Learner | All five scenes finished in both roles, new scenes coming soon |
| `demo@lakon.id`       | CobaLakon2026    | Learner | Partial progress: coffee shop finished on the Deaf side        |
| `bendi@lakon.id`      | BendiLakon2026   | Learner | Sample learner                                                 |
| `kevin@lakon.id`      | KevinLakon2026   | Learner | Sample learner                                                 |
| `jessica@lakon.id`    | JessicaLakon2026 | Learner | Sample learner                                                 |
| `nawal@lakon.id`      | NawalLakon2026   | Learner | Sample learner                                                 |

These accounts are shared, and the four `demo` accounts cannot delete their
learning data or change their profile. To start from a clean slate, register
your own account at <https://lakon-learn.vercel.app/daftar>.

The internal `admin@lakon.id` and `validator@lakon.id` accounts unlock
`/dev/*` and `/tools/*`. Their passwords are never committed: set
`SEED_ADMIN_PASSWORD` and `SEED_VALIDATOR_PASSWORD` in `.env` before running
`node tools/seed.mjs`.

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS
- React Three Fiber + three.js + @pixiv/three-vrm (3D avatar)
- MediaPipe Tasks Vision in a Web Worker (hand + pose landmarks, self-hosted)
- ONNX Runtime Web (WebGPU, WASM SIMD fallback) for the optional classifier
- Custom sign compiler: one parametric spec → avatar keyframes **and** the
  DTW verification reference (single source of truth)
- Drizzle ORM + Postgres (Neon), session auth, progress saved straight to the
  database, service-worker offline cache
- Vitest (69 unit tests), Playwright (21 end-to-end tests incl. offline and
  camera-denied flows)

## Getting started

Requirements: Node.js 20.12 or newer, pnpm 9 or newer, a
[Neon](https://neon.tech) Postgres database (the app uses Neon's serverless
driver; the free tier is enough) and internet access on the first run to
download the MediaPipe models. `ffmpeg` is only needed for `pnpm peraga`, and
Python 3 with `training/requirements.txt` only for training.

```bash
pnpm install
cp .env.example .env                  # set DATABASE_URL (Neon Postgres)
ln -s ../../.env apps/web/.env.local  # Next.js reads env files from apps/web
pnpm db:push                          # apply schema
node tools/seed.mjs                   # demo + admin + validator accounts
pnpm dev                              # http://localhost:3000 (assets auto-fetched)
```

On Windows, copy `.env` to `apps/web/.env.local` instead of linking it.

Human demonstration videos: put renamed clips (e.g. `SAMA SAMA.MP4`) in
`content/BISINDO/` (kept out of git) and run `pnpm peraga`. It crops them to
4:3, encodes 720p H.264 without audio into `apps/web/public/peraga/` and links
each clip to the sign with the matching name.

Production build: `LAKON_ALLOW_DRAFT=1 pnpm build`. Without that variable the
build **fails if any sign is not `approved`** — that is the content-governance
gate, enforced by script, not memory.

All 16 signs in the five scenes are still drafts derived from public BISINDO
videos and animations (sources in [docs/attribution.md](docs/attribution.md)).
They are recorded as drafts in their data files and await a Deaf validation session, which is why the live demo is built with `LAKON_ALLOW_DRAFT=1`; the scene interface does not yet label them as drafts.

`predev`/`prebuild` run `tools/fetch-assets.mjs`, which copies the MediaPipe
WASM from node_modules and downloads the two landmark models into
`apps/web/public/` (self-hosted so practice works offline and without a CDN).

Two things need a manual refresh when the assets behind them change:

- Replacing `apps/web/public/models/seed-san.vrm` invalidates the measurements
  in `apps/web/features/avatar/seed-san-rig.ts`, which the sign compiler reads
  instead of downloading the 10 MB avatar. Regenerate that file from the new
  VRM before relying on it.
- Replacing anything under `apps/web/public/models/` or `/mediapipe/` needs
  `CACHE_VERSION` in `apps/web/public/sw.js` bumped, otherwise devices that
  already cached the old file keep serving it.

## Technical documentation

- [docs/architecture.md](docs/architecture.md) — data-flow diagram, package
  layout, key decisions
- [docs/attribution.md](docs/attribution.md) — sign sources, third-party
  licenses and the VRM avatar's embedded permission metadata
- [docs/accessibility-audit/](docs/accessibility-audit/) — axe-core (0
  violations across 10 screens) and Lighthouse reports, performance budget
  (1 Sep 2026)
- [docs/cross-device-testing.md](docs/cross-device-testing.md) — manual
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
- **Sign forms are never guessed**: BISINDO signs are published only after
  validation by Deaf signers or interpreters (enforced by the build gate on review status; the current demo overrides it, and every sign is still recorded as a draft). The `uji-gerak`
  sign is an honestly-labeled technical test.

## Credits

3D avatar (development stand-in): **"Seed-san" © VirtualCast, Inc.**, used
under the [VRM Public License 1.0](https://vrm.dev/licenses/1.0/). Sign
sources, human demonstration videos, and library and font licenses are listed
in [docs/attribution.md](docs/attribution.md).
