# Attribution and licenses

## Libraries and fonts

| Resource                                                     | License                               | Role                                                           |
| ------------------------------------------------------------ | ------------------------------------- | -------------------------------------------------------------- |
| Next.js, React                                               | MIT                                   | Application framework                                          |
| three.js                                                     | MIT                                   | 3D rendering                                                   |
| @pixiv/three-vrm                                             | MIT                                   | VRM loader and humanoid rig                                    |
| @react-three/fiber                                           | MIT                                   | three.js integration for React                                 |
| MediaPipe Tasks Vision (Google)                              | Apache-2.0                            | Hand and pose landmark extraction in a Web Worker              |
| `hand_landmarker` and `pose_landmarker_lite` models (Google) | Apache-2.0                            | Landmark model weights, downloaded by `tools/fetch-assets.mjs` |
| ONNX Runtime Web (Microsoft)                                 | MIT                                   | Optional classifier inference in the Web Worker (WebGPU/WASM)  |
| Drizzle ORM                                                  | Apache-2.0                            | Database access                                                |
| @neondatabase/serverless                                     | MIT                                   | Postgres driver for Neon                                       |
| Zod, Zustand                                                 | MIT                                   | Validation, application state                                  |
| Tailwind CSS                                                 | MIT                                   | Styling                                                        |
| Lucide icons (`lucide-react`)                                | ISC                                   | Icons                                                          |
| Fraunces typeface (Google Fonts, via `next/font`)            | SIL Open Font License 1.1             | Typeface                                                       |
| PyTorch                                                      | BSD-3-Clause                          | Classifier training in `training/` (not shipped)               |
| NumPy / ONNX / ONNX Runtime / onnxscript                     | BSD-3-Clause / Apache-2.0 / MIT / MIT | ONNX export in `training/` (not shipped)                       |

## 3D avatar and its VRM permission metadata

Avatar: **Seed-san** (`apps/web/public/models/seed-san.vrm`), VRM 1.0, taken
from the VRM Consortium's official specification repository
(`vrm-c/vrm-specification`, samples directory).

`VRMC_vrm.meta` embedded in the file (read directly from the binary):

| Field                | Value                           |
| -------------------- | ------------------------------- |
| name                 | Seed-san                        |
| authors              | VirtualCast, Inc.               |
| copyrightInformation | VirtualCast, Inc.               |
| licenseUrl           | https://vrm.dev/licenses/1.0/   |
| avatarPermission     | everyone                        |
| commercialUsage      | corporation                     |
| allowRedistribution  | true                            |
| modification         | allowModificationRedistribution |
| creditNotation       | **required**                    |

The credit requirement is met here and in the README:
**3D avatar: "Seed-san" © VirtualCast, Inc., used under the VRM Public License 1.0.**

The production plan uses two characters made by the team in VRoid Studio (see
the character brief in the design documents); Seed-san is a development
stand-in until those models are finished.

## Sign content sources

The team does not invent BISINDO sign forms. Every sign in `content/signs/` was
drafted with the sign editor's video import (reverse path) from the public
sources below and stays `draft` until a Deaf signer or certified interpreter
approves it in the file's `review` field. The UI labels these signs as not yet
validated, and a production build rejects them unless `LAKON_ALLOW_DRAFT=1` is
set. Only sign forms were derived: no third-party footage or image is included
in this repository or loaded by the app. Clip timestamps for each sign are in
its `notes` field.

| Signs                                                                    | Source                                                                                                                                                              | Signer                                                | Variant    | Terms                                                                         | Accessed   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------- | ----------------------------------------------------------------------------- | ---------- |
| halo, terima-kasih, sakit, sama-sama                                     | "PRIVATE LESSON IN SIGN LANGUAGE WITH SURYA SAHETAPY", Gogirl! TV, <https://www.youtube.com/watch?v=G_MnbyHWa50>                                                    | Surya Sahetapy                                        | Jakarta    | Creative Commons (reuse allowed)                                              | 1 Sep 2026 |
| kopi                                                                     | "Belajar Bahasa Isyarat di Kopi Tuli", BenarNews Indonesia, <https://www.youtube.com/watch?v=0TBz-UHOYtM>                                                           | Adhika Prakoso, founder of Kopi Tuli (KOPTUL) Jakarta | Jakarta    | No reuse license stated; sign form referenced only                            | 1 Sep 2026 |
| maaf                                                                     | "Maaf" animation, Starbucks Indonesia × Pusbisindo, in Kompas JEO "Kopi, Bahasa Isyarat, dan Rasa Aman", <https://jeo.kompas.com/kopi-bahasa-isyarat-dan-rasa-aman> | Animation; vocabulary compiled with Pusbisindo        | Not stated | No reuse license stated; sign form referenced only                            | 1 Sep 2026 |
| dingin, dokter, makan, manis, mata, minum, pahit, panas, perawat, tangan | "Video Kosaisyarat BISINDO" series, Balai Bahasa Provinsi Jawa Timur (Kemendikdasmen), <https://balaibahasajatim.kemendikdasmen.go.id/video>                        | Not named                                             | East Java  | Government publication without an explicit license; sign form referenced only | 1 Sep 2026 |

The East Java signs will be replaced once a Jakarta-variant source is
available. `uji-gerak` is a technical motion test, not a BISINDO sign. The
eighteen handshape candidates in `content/handshapes/` are anatomical
candidates from the team's inventory document, not claims about BISINDO forms.

## Human demonstration videos

The 16 clips in `apps/web/public/peraga/` are recordings of a human signer
supplied by the Lakon team; the raw files stay out of git (`content/BISINDO/`).
`pnpm peraga` crops them to 4:3, re-encodes them to 720p without audio and
links each clip to the sign of the same name through `media.video`. The videos
do not change any sign's `review` status.
