# Rencana: case belajar pertama — skenario kedai kopi (BISINDO Jakarta)

Status: disetujui pemilik proyek (1 Sep 2026), belum dikerjakan.
Sesi Claude Code berikutnya: kerjakan dokumen ini dari atas ke bawah.

## Tujuan

Skenario `kedai-kopi` menjadi case belajar sungguhan pertama: 6 isyarat DRAF
yang bentuknya bersumber dari penanda Tuli otoritatif di internet, dirapikan di
sign-editor, dan tampil jujur berlabel "draf, belum divalidasi". TANPA
menyentuh status `approved`.

## Aturan yang tidak boleh dilanggar (dari CLAUDE.md + kesepakatan)

1. Bentuk isyarat TIDAK ditetapkan dari tebakan/pencarian acak. Sumber wajib
   penanda Tuli otoritatif — prioritas: **Pusbisindo** (Pusat Bahasa Isyarat
   Indonesia, lembaga komunitas Tuli, basis Jakarta = varian target), atau
   konten kreator Tuli Jakarta yang identitasnya jelas.
2. `review.status` tetap `"draft"` untuk semuanya. Yang boleh approve hanya
   validator manusia lewat akun validator.
3. Setiap berkas isyarat mencatat provenance di field `notes`: judul/kanal
   sumber, URL, nama penanda bila diketahui.
4. Claude tidak bisa menonton video — pemilik proyek yang memverifikasi bahwa
   tiap klip benar memperagakan kata yang dimaksud, dan menilai kecocokan
   avatar terhadap sumber. Jalur balik otomatis + perapian visual adalah
   alatnya.
5. Hasil ke juri diposisikan apa adanya: "draf dari sumber penanda Tuli,
   menunggu sesi validasi".

## Daftar kata (6, dari graph tugas skenario kedai-kopi)

| Kata         | Simpul | Catatan bentuk yang mungkin                                |
| ------------ | ------ | ---------------------------------------------------------- |
| halo         | sapa   | kemungkinan satu tangan (dominant-only)                    |
| kopi         | pesan  | perhatikan apakah dua tangan (asymmetric, tangan landasan) |
| panas        | suhu   |                                                            |
| berapa       | harga  |                                                            |
| bayar        | bayar  |                                                            |
| terima-kasih | tutup  | sering dua tangan / dari dagu — cek struktur di sumber     |

`halo` paling penting: dipakai juga oleh blok "coba satu isyarat" di landing
(otomatis menggantikan `uji-gerak` begitu `content/signs/halo.json` ada).

## Langkah kerja

### 0. Prasyarat

- `pnpm dev` jalan; login `admin@lakon.id / AdminLakon2026` (seed: `node tools/seed.mjs`).
- Pemilik proyek menyiapkan 6 klip video (satu kata per klip, boleh dipotong
  dari video panjang; ideal: penanda menghadap kamera, tangan+bahu terlihat,
  latar polos). Simpan lokal, mis. `~/lakon-sumber/halo.mp4` dst.
- Claude boleh membantu MENCARI kandidat tautan (WebSearch: "Pusbisindo kopi",
  "kamus BISINDO Jakarta halo", dsb) tapi keputusan klip mana yang dipakai ada
  di pemilik proyek.

### 1. Per kata: impor → rapikan → simpan (di /tools/sign-editor)

1. Isi kolom id draf (mis. `halo`), pilih sisi tangan dominan penanda di klip.
2. Impor video → jalur balik menghasilkan draf (fase dari minimum kecepatan,
   handshape terdekat dari 18 kandidat, jangkar lokasi terdekat, orientasi).
3. Rapikan sambil membandingkan dengan klip sumber (putar berdampingan secara
   manual): jumlah/durasi fase, handshape per fase, anchor+offset, orientasi,
   lintasan. Draf default `dominant-only` — ubah `structure` ke
   `symmetric`/`asymmetric` + isi nonDominant bila sumbernya dua tangan.
4. Sebelum simpan, pastikan `gloss` (id+en) benar dan `notes` berisi sumber.
   (Bila UI editor belum punya kolom gloss/notes, edit JSON-nya langsung
   setelah tersimpan — lalu `pnpm check:content`.)
5. Simpan → berkas masuk `content/signs/<kata>.json`, `usedIn` handshape
   terisi otomatis.

Gotcha teknis yang sudah diketahui:

- Impor video butuh peramban (worker MediaPipe + rVFC); aset MediaPipe lokal
  sudah otomatis lewat `predev`.
- `draftSignFromFrames` menjumlahkan durasi fase → field `duration` valid
  otomatis; kalau mengedit durasi manual, editor menghitung ulang.
- Bila handshape sumber tidak mirip satu pun dari 18 kandidat, sunting sudut
  jari kandidat terdekat di panel "Sudut bentuk tangan" (source otomatis jadi
  `authored`) atau buat berkas handshape baru via JSON.

### 2. Pasang ke skenario

- `content/scenarios/kedai-kopi.json`: isi `vocab` =
  `["halo","kopi","panas","berapa","bayar","terima-kasih"]`.
  (Validator konten lalu menegakkan vocab ↔ berkas ↔ task.)
- `pnpm check:content` harus hijau.

### 3. Verifikasi

- `/dev/compile`: tiap isyarat diputar mulus, gerak lambat 0.25× untuk cek.
- `/dev/verify`: praktikkan `halo` sendiri di depan kamera — skor & umpan
  balik masuk akal; sengaja salahkan satu jari → umpan balik menunjuk jari itu.
- Alur penuh: landing (blok coba kini "halo") → skenario kedai kopi arah A
  dan B sampai ringkasan — kartu belajar kini menampilkan peragaan, bukan
  "belum divalidasi".
- `pnpm test` dan `pnpm e2e` tetap hijau. PERHATIAN: e2e alur 4/6/7/9
  mengandalkan tombol "Lewati dulu" (isyarat tanpa berkas) — setelah konten
  terisi, jalur itu berubah menjadi PracticeBlock; perbarui helper
  `skipAllLearning`/`finishExam` di `apps/web/e2e/alur.spec.ts` agar memakai
  jalur "Bandingkan sendiri → lanjut" (kamera palsu tanpa tangan). Ini
  perubahan uji yang DIHARAPKAN, bukan regresi.

### 4. Dokumentasi & deploy

- `docs/attribution.md` bagian "Konten isyarat": tambah tabel sumber per kata
  (kanal, URL, penanda, tanggal akses).
- README: satu kalimat bahwa 6 isyarat kedai kopi berstatus draf bersumber
  penanda Tuli, menunggu validasi.
- Commit (aturan tetap: tanpa gitmoji, tanpa co-author). Vercel sudah
  `LAKON_ALLOW_DRAFT=1` — draf ikut terdeploy dengan label jujurnya.

### 5. Setelahnya (di luar rencana ini)

- Sesi validasi sungguhan: validator login, cek tiap isyarat, ubah `review`
  (status/validatedBy/role/date) via sign-editor → begitu semua approved,
  hapus `LAKON_ALLOW_DRAFT` dari Vercel.
- Rekam data latih via `/tools/collect` → `training/train.py` → model
  klasifikasi nyata.
