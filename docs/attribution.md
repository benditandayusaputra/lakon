# Atribusi dan lisensi

## Pustaka pihak ketiga

| Pustaka                                                   | Lisensi    | Peran                                                    |
| --------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| MediaPipe Tasks Vision (Google)                           | Apache-2.0 | Ekstraksi landmark tangan dan pose di Web Worker         |
| Model `hand_landmarker` & `pose_landmarker_lite` (Google) | Apache-2.0 | Bobot model landmark, diunduh via tools/fetch-assets.mjs |
| three.js                                                  | MIT        | Rendering 3D                                             |
| @pixiv/three-vrm                                          | MIT        | Pemuat dan rig humanoid VRM                              |
| @react-three/fiber                                        | MIT        | Integrasi three.js dengan React                          |
| ONNX Runtime Web (Microsoft)                              | MIT        | Inferensi pengklasifikasi di Web Worker (WebGPU/WASM)    |
| PyTorch                                                   | BSD-3      | Pelatihan pengklasifikasi (training/)                    |
| Next.js, React                                            | MIT        | Kerangka aplikasi                                        |
| Drizzle ORM, Zod, Zustand, Tailwind CSS                   | MIT        | Basis data, validasi, state, gaya                        |

## Metadata izin berkas VRM

Avatar: **Seed-san** (`apps/web/public/models/seed-san.vrm`), format VRM 1.0,
diambil dari repositori spesifikasi resmi VRM Consortium
(`vrm-c/vrm-specification`, direktori samples).

Metadata `VRMC_vrm.meta` yang tertanam di berkas (dibaca langsung dari biner):

| Field                | Nilai                           |
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

Kewajiban kredit dipenuhi lewat dokumen ini dan README:
**Avatar 3D: "Seed-san" © VirtualCast, Inc., dipakai sesuai VRM Public License 1.0.**

Rencana produksi memakai dua karakter buatan tim di VRoid Studio (lihat brief
karakter di dokumen desain); Seed-san adalah pengganti pengembangan sampai
model tersebut selesai.

## Konten isyarat

Bentuk isyarat BISINDO hanya berasal dari sesi validasi penanda Tuli atau juru
bahasa isyarat, dicatat pada field `review` tiap berkas di `content/`. Delapan
belas kandidat bentuk tangan awal adalah kandidat anatomis dari dokumen
inventaris tim, bukan klaim bentuk BISINDO.
