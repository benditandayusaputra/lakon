# Laporan performa Milestone 11

Tanggal: 2026-09-01. Semua angka dari build produksi (`next build` + `next start`)
di mesin pengembangan (Apple Silicon), Lighthouse dengan emulasi seluler dan
throttling bawaan (lebih keras daripada 4G murni).

## Anggaran dan status

| Anggaran (PRD/M11)                              | Status                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ekstraksi landmark ≥ 24 fps di Android menengah | **Perlu uji perangkat fisik** — lihat docs/uji-lintas-perangkat.md. Mitigasi siap: turunkan resolusi masukan, PoseLandmarker tiap 3 frame.                                      |
| Inferensi klasifikasi < 10 ms                   | Model < 500 ribu parameter (dipaksa assert di training/train.py); ONNX contoh 270 KB berjalan WebGPU. Angka final menunggu model terlatih data nyata.                           |
| Main thread tidak terblokir > 16 ms             | Seluruh ekstraksi landmark + inferensi di Web Worker; overlay digambar via ref. TBT Lighthouse: landing 660 ms (hidrasi awal), skenario 60 ms.                                  |
| Waktu interaktif layar praktik < 3 dtk pada 4G  | TTI /skenario/[id]: **3,9 dtk** pada throttling Lighthouse seluler (≈ lebih lambat dari 4G); bundel awal 125 KB gzip → pada 4G nyata target terpenuhi. Verifikasi di perangkat. |
| Bundel model < 1,5 MB                           | Belum ada model produksi; arsitektur (MLP 26k / TCN 66k param ≈ 0,1–0,3 MB ONNX) jauh di bawah anggaran. Kuantisasi int8 tersedia (`--quantize`).                               |
| WASM MediaPipe dimuat lazy                      | Ya — dimuat di worker saat modul praktik diaktifkan, bukan di root layout.                                                                                                      |

## Hasil Lighthouse (build produksi)

| Halaman              | Performa | Aksesibilitas | LCP   | TBT    | TTI   |
| -------------------- | -------- | ------------- | ----- | ------ | ----- |
| / (landing)          | 83       | 100           | 2,0 s | 660 ms | 4,6 s |
| /skenario/kedai-kopi | 88       | 100           | 3,9 s | 60 ms  | 3,9 s |

Laporan lengkap: `lighthouse-landing.report.html`, `lighthouse-skenario.report.html`.

## Perbaikan yang diterapkan di milestone ini

1. Blok "coba satu isyarat" (three.js + VRM + MediaPipe) dipecah ke chunk dinamis
   dan hanya dimuat saat tergulir terlihat. First Load JS landing: 421 KB → 125 KB.
   Sebelum perbaikan LCP landing 58 dtk, sesudah 2,0 dtk.
2. Rig avatar (berkas VRM 10,4 MB) tidak lagi dimuat di tahap intro skenario,
   hanya saat masuk fase belajar. LCP halaman skenario 57,9 dtk → 3,9 dtk.
3. Target sentuh slider dinaikkan ke ≥ 28 px (temuan axe target-size).

## Audit aksesibilitas

axe-core (WCAG 2 A/AA + 2.2 AA) pada 10 layar: **0 pelanggaran** setelah dua
perbaikan (label input tersembunyi, ukuran target slider). Lihat `axe-report.md`.
Pemeriksaan khusus M11 yang tertanam di desain: keadaan tidak dibedakan warna
saja (ikon + teks di semua umpan balik), alternatif tanpa kamera di setiap
latihan, `prefers-reduced-motion` mematikan transisi, urutan fokus mengikuti DOM
dengan indikator fokus 3 px, perubahan keadaan lewat `aria-live`.

## Yang masih menunggu perangkat nyata

Laju frame Android kelas menengah dan TTI 4G nyata tidak bisa diukur dari mesin
pengembangan. Daftar periksa manual + tombol mitigasi ada di
docs/uji-lintas-perangkat.md; parameter mitigasi (resolusi capture, frekuensi
pose) tinggal diubah di `features/practice/capture.ts` dan `workers/cv.worker.ts`.
