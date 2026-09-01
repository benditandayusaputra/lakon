# Daftar periksa uji lintas perangkat (manual)

Jalankan pada build produksi (`LAKON_ALLOW_DRAFT=1 pnpm build && next start`).
Catat hasil di kolom kosong. Kolom "jalur" dibaca dari /dev/pipeline
(perlu akun admin).

## Matriks perangkat

| Perangkat / peramban          | Jalur capture (harapan) | Backend MediaPipe | Backend klasifikasi | Laju inferensi                | Lulus? |
| ----------------------------- | ----------------------- | ----------------- | ------------------- | ----------------------------- | ------ |
| Chrome desktop (macOS/Win)    | track-processor         | GPU (WebGL)       | WebGPU              | ≥ 24 fps                      |        |
| Safari desktop                | video-frame-callback    | GPU (WebGL)       | WASM SIMD           | ≥ 24 fps                      |        |
| Firefox desktop               | video-frame-callback    | GPU/CPU           | WASM SIMD           | ≥ 24 fps                      |        |
| Chrome Android kelas menengah | track-processor         | GPU (WebGL)       | WASM SIMD           | **≥ 24 fps (anggaran keras)** |        |
| Safari iOS                    | video-frame-callback    | GPU (WebGL)       | WASM SIMD           | ≥ 24 fps                      |        |

Bila Android < 24 fps, urutan mitigasi (jangan turunkan HandLandmarker):

1. Turunkan resolusi capture di `features/practice/capture.ts` (640×480 → 480×360).
2. Jalankan PoseLandmarker tiap 3 frame di `workers/cv.worker.ts`.
3. Turunkan `inferEvery` klasifikasi lewat panel /dev/pipeline.

## Alur yang diperiksa per perangkat

- [ ] Landing → blok coba satu isyarat tanpa login, kamera menyala, verifikasi berjalan
- [ ] Izin kamera ditolak → jalur "Latihan tanpa kamera" berfungsi
- [ ] /dev/mirror: buka telapak, kepalan, tunjuk; putar pergelangan 180°; dua tangan; tidak bergetar saat diam
- [ ] Uji dengan orang kidal dan ukuran tangan berbeda (gerbang M2)
- [ ] /dev/verify: sengaja salahkan satu jari → kalimat umpan balik menunjuk jari itu (gerbang M6)
- [ ] Skenario penuh arah A dan arah B sampai ringkasan
- [ ] Mode pesawat setelah pemuatan pertama → seluruh skenario tetap jalan
- [ ] Progres bertahan setelah menutup dan membuka lagi peramban
- [ ] prefers-reduced-motion aktif → transisi suasana mati

## Persiapan menjelang presentasi

- [ ] Rekam video demo 2–3 menit sebagai cadangan (aplikasi bergantung webcam dan pencahayaan)
- [ ] Panaskan sistem minimal 15 menit sebelum presentasi (cache SW terisi, model termuat)
- [ ] Siapkan perangkat cadangan yang sudah dipanaskan
- [ ] Uji demo dari jaringan yang bukan milik tim (hotspot berbeda)
- [ ] Pastikan akun demo (`demo@lakon.id`) berisi progres: `node tools/seed.mjs`
- [ ] Cek /dev/health hijau semua sebelum maju
