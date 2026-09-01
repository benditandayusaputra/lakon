# Kandidat sumber video — 6 isyarat kedai kopi

Hasil pencarian Claude (1 Sep 2026) untuk Langkah 0 di
`rencana-konten-kedai-kopi.md`. Claude TIDAK bisa menonton video — pemilik
proyek yang memutuskan klip mana dipakai, memverifikasi bahwa penandanya Tuli
(prioritas Pusbisindo / varian Jakarta), lalu memotong satu kata per klip ke
`~/lakon-sumber/<kata>.mp4`.

Tandai ✅ = paling menjanjikan menurut metadata (bukan jaminan isi).

## halo

- ✅ Pusbisindo (kanal resmi @pusbisindo): "Perkenalan ketiga bahasa isyarat
  tentang kegiatan sehari-hari" — <https://www.youtube.com/watch?v=aJGm75cpKag>
  — deskripsi menyebut urutan monolog dimulai "Halo, Selamat pagi/siang/malam".
- "Kalimat Sehari-hari dalam BISINDO part 1" —
  <https://www.youtube.com/watch?v=NaafQwd0XEY> — sapaan sehari-hari; cek
  identitas penanda.

## kopi

- "Menu-menu minuman kopi di Dapur Dif_Able dalam Bahasa Isyarat" —
  <https://www.youtube.com/watch?v=udX_nkj5MnQ>
- ✅ "Belajar Bahasa Isyarat di Kopi Tuli" —
  <https://www.youtube.com/watch?v=0TBz-UHOYtM> — Kopi Tuli (Koptul) kedai
  milik Tuli di Duren Tiga, Jakarta.
- "Mau Bantu Teman Tuli Pesan Minuman? Ini 5 Kosa Isyarat-nya!" (Silang.id) —
  <https://www.youtube.com/shorts/qS-scokHIkw>
- Sunyi Coffee (barista Tuli, Jakarta): "Cara Pesan di Kopi Sunyi" —
  <https://www.tiktok.com/@sunyicoffee/video/7019932443750714625>

## panas

- ✅ Balai Bahasa Provinsi Jawa Timur (Kemendikdasmen) —
  <https://balaibahasajatim.kemendikdasmen.go.id/video>, MP4 langsung:
  <https://balaibahasajatim.kemendikdasmen.go.id/storage/videos/01K9MCTSN98SM1Z56XJ4T9HZZH.mp4>
  — DIVERIFIKASI 1 Sep 2026 (pindai MediaPipe sambil diputar): isyarat di
  2,3–4,8 dtk, tangan kanan, telapak terbuka dikibas di samping kepala; label
  handedness "Right" konsisten. Varian **Jawa Timur** — disetujui sebagai
  draf berlabel varian di `notes`. Klip di `~/lakon-sumber/panas.mp4`.
  (Catatan: pemeriksaan awal sempat salah menyimpulkan file kosong — itu bug
  metode seek pemeriksa, bukan filenya.)
- "Cuaca Ekstrem | BISINDO" — <https://www.youtube.com/watch?v=LW1pt62U8MA>
  (22 detik).
- "Mengenal Cuaca dalam Bahasa Isyarat Indonesia" —
  <https://www.youtube.com/watch?v=Sw8g4kWmJhE>
- Kandidat lain yang muncul berlabel SIBI — JANGAN dipakai.

## Catatan sumber dari docs/BISINDO_AGENT_GUIDE.md (diverifikasi 1 Sep 2026)

- Kamus Pusbisindo (<https://www.pusbisindo.org/kamus-kosa-isyarat>) saat ini
  **kosong** — elemen konten utamanya tidak berisi entri apa pun. Pusbisindo
  tetap jalur validasi (kontak: pusat@pusbisindo.org / WA di situs), bukan
  sumber klip langsung.
- Balai Bahasa Jatim punya ±150 video kosaisyarat (satu kata per video, MP4
  langsung, isyarat sungguhan — diverifikasi) termasuk SATU–SEMBILAN, MINUM,
  PANAS, DINGIN, BESAR, KECIL, MANIS, PAHIT — tapi TIDAK punya: halo, kopi,
  pesan, mau, berapa, bayar, terima kasih. Semua varian Jatim. Pola klipnya:
  ±2 dtk diam → isyarat → diam; bagian diam otomatis terbuang saat impor
  (frame tanpa tangan dilewati).

## berapa

- "Bahasa isyarat harga berapa #bisindo" —
  <https://www.youtube.com/shorts/WFxTd40hTf0>
- "Tutorial jual beli dalam bahasa isyarat" —
  <https://www.youtube.com/watch?v=TMrWSTRBqlY> — cek varian & penanda.

## bayar

- Kandidat khusus belum ketemu lewat pencarian teks. Kemungkinan besar ada di
  dalam klip transaksi di atas (jual-beli, Kopi Tuli, Sunyi Coffee, Silang) —
  saat menonton kandidat kopi/berapa, tandai timestamp "bayar" sekalian.

## terima-kasih

- ✅ Pusbisindo (Facebook resmi): "BISINDO VERSI JAKARTA: Selamat Hari Ibu.
  Terima kasih…" —
  <https://www.facebook.com/Pusbisindo/videos/905711538411494/> — satu-satunya
  kandidat yang eksplisit "versi Jakarta" dari Pusbisindo.
- "Bisindo Terima Kasih" — <https://www.youtube.com/watch?v=S-2Lj8OzPqQ> (6 detik).
- Shorts: <https://www.youtube.com/shorts/FG3p5q50oGk>,
  "4 Kata Ajaib (maaf/tolong/terima kasih/permisi)"
  <https://www.youtube.com/shorts/BQtY9_nYoH4>
- TikTok @jennifernatalie_: "Bahasa Isyarat Terimakasih di Bisindo" —
  <https://www.tiktok.com/@jennifernatalie_/video/7154323968529321242>

## Peringatan varian

Playlist "Bahasa Isyarat BISINDO" (PLfsmXCUc8kvHMpSJI4aYLID1qVIAh1GCZ) yang
sering muncul di pencarian adalah **versi Yogyakarta** — varian salah untuk
Lakon, jangan dipakai sebagai sumber bentuk.

## Setelah klip dipilih

Isi tabel ini (menjadi bahan `notes` + `docs/attribution.md`), lalu lanjut
Langkah 1 rencana:

| Kata         | Sumber terpilih (kanal, URL, penanda, timestamp) |
| ------------ | ------------------------------------------------ |
| halo         |                                                  |
| kopi         |                                                  |
| panas        |                                                  |
| berapa       |                                                  |
| bayar        |                                                  |
| terima-kasih |                                                  |
