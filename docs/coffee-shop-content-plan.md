# Plan: first learning case — coffee-shop scenario (BISINDO Jakarta)

Status: approved by the project owner (1 Sep 2026), not yet started.
Next Claude Code session: work through this document top to bottom.

## Goal

The `kedai-kopi` scenario becomes the first genuine learning case: 6 DRAFT
signs whose forms are sourced from authoritative Deaf signers on the
internet, cleaned up in sign-editor, and honestly displayed labeled
"draft, not yet validated". WITHOUT touching the `approved` status.

## Rules that must not be broken (from CLAUDE.md + agreement)

1. Sign forms are NOT set from guesses/random searches. The source must
   be an authoritative Deaf signer — priority: **Pusbisindo** (Pusat
   Bahasa Isyarat Indonesia, a Deaf community institution based in
   Jakarta = target variant), or content from clearly identified Jakarta
   Deaf creators.
2. `review.status` stays `"draft"` for everything. Only a human validator
   via a validator account may approve.
3. Every sign file records provenance in the `notes` field: source
   title/channel, URL, signer name if known.
4. Claude cannot watch video — the project owner is the one who verifies
   that each clip correctly demonstrates the intended word, and judges
   how well the avatar matches the source. The automatic reverse path +
   visual cleanup are the tools for that.
5. Results shown to judges are presented plainly: "a draft sourced from a
   Deaf signer, awaiting a validation session".

## Word list (6, from the kedai-kopi scenario task graph)

| Word         | Node  | Notes on possible form                                           |
| ------------ | ----- | ---------------------------------------------------------------- |
| halo         | sapa  | possibly one-handed (dominant-only)                              |
| kopi         | pesan | check whether two-handed (asymmetric, base hand)                 |
| panas        | suhu  |                                                                  |
| berapa       | harga |                                                                  |
| bayar        | bayar |                                                                  |
| terima-kasih | tutup | often two-handed / from the chin — check structure in the source |

`halo` matters most: it's also used by the "try one sign" block on the
landing page (automatically replacing `uji-gerak` once
`content/signs/halo.json` exists).

## Work steps

### 0. Prerequisites

- `pnpm dev` running; log in with `admin@lakon.id / AdminLakon2026` (seed: `node tools/seed.mjs`).
- Project owner prepares 6 video clips (one word per clip, may be cut
  from a longer video; ideally: signer facing the camera, hands+shoulders
  visible, plain background). Save locally, e.g. `~/lakon-sumber/halo.mp4`
  etc.
- Claude may help SEARCH for candidate links (WebSearch: "Pusbisindo
  kopi", "kamus BISINDO Jakarta halo", etc.) but the decision on which
  clip to use rests with the project owner.

### 1. Per word: import → clean up → save (in /tools/sign-editor)

1. Fill in the draft id field (e.g. `halo`), select the signer's
   dominant hand side in the clip.
2. Import the video → the reverse path produces a draft (phases from
   speed minima, nearest handshape from 18 candidates, nearest location
   anchor, orientation).
3. Clean up while comparing against the source clip (play side by side
   manually): number/duration of phases, handshape per phase,
   anchor+offset, orientation, path. Draft defaults to `dominant-only` —
   change `structure` to `symmetric`/`asymmetric` + fill in nonDominant
   if the source is two-handed.
4. Before saving, make sure `gloss` (id+en) is correct and `notes`
   contains the source. (If the editor UI doesn't yet have gloss/notes
   fields, edit the JSON directly after saving — then run
   `pnpm check:content`.)
5. Save → the file goes into `content/signs/<word>.json`, the
   handshape's `usedIn` fills in automatically.

Known technical gotchas:

- Importing video needs a browser (MediaPipe worker + rVFC); local
  MediaPipe assets are already automatic via `predev`.
- `draftSignFromFrames` sums the phase durations → the `duration` field
  is automatically valid; if you edit the duration manually, the editor
  recalculates.
- If the source handshape doesn't resemble any of the 18 candidates,
  edit the nearest candidate's finger angles in the "Sudut bentuk
  tangan" panel (source automatically becomes `authored`) or create a
  new handshape file via JSON.

### 2. Wire into the scenario

- `content/scenarios/kedai-kopi.json`: set `vocab` =
  `["halo","kopi","panas","berapa","bayar","terima-kasih"]`.
  (The content validator then enforces vocab ↔ file ↔ task.)
- `pnpm check:content` must be green.

### 3. Verify

- `/dev/compile`: every sign plays back smoothly, slow motion at 0.25×
  to check.
- `/dev/verify`: practice `halo` yourself in front of the camera — score
  & feedback make sense; deliberately get one finger wrong → the
  feedback points to that finger.
- Full flow: landing (the try block now shows "halo") → the kedai-kopi
  scenario, directions A and B, through to the summary — the learning
  card now shows the demonstration, not "not yet validated".
- `pnpm test` and `pnpm e2e` stay green. WARNING: e2e flows 4/6/7/9 rely
  on the "Lewati dulu" button (sign without a file) — once the content
  is filled in, that path turns into PracticeBlock; update the
  `skipAllLearning`/`finishExam` helper in `apps/web/e2e/alur.spec.ts` to
  use the "Bandingkan sendiri → continue" path (fake camera with no
  hands). This is an EXPECTED test change, not a regression.

### 4. Documentation & deploy

- `docs/attribution.md`, "Sign content" section: add a source table per
  word (channel, URL, signer, date accessed).
- README: one sentence that the 6 kedai-kopi signs are draft status,
  sourced from a Deaf signer, awaiting validation.
- Commit (rule stays: no gitmoji, no co-author). Vercel already has
  `LAKON_ALLOW_DRAFT=1` — drafts get deployed too, with their honest
  label.

### 5. Afterward (outside this plan)

- Real validation session: validator logs in, checks each sign, changes
  `review` (status/validatedBy/role/date) via sign-editor → once
  everything is approved, remove `LAKON_ALLOW_DRAFT` from Vercel.
- Record training data via `/tools/collect` → `training/train.py` → a
  real classification model.
