# Panduan sumber BISINDO untuk Lakon

Adaptasi dari `../../docs/BISINDO_AGENT_GUIDE.md` (versi umum) ke realitas
Lakon. Aturan dasar yang sudah ada di `CLAUDE.md` dan
`rencana-konten-kedai-kopi.md` tidak diulang di sini — dokumen ini hanya
menambah: peringkat sumber yang sudah diverifikasi, pemetaan status, dan
kebijakan nama produk.

Terakhir diverifikasi: 1 Sep 2026.

## Peringkat sumber (hasil verifikasi, bukan klaim)

### Tier A — otoritatif

| Sumber | Status verifikasi | Peran untuk Lakon |
| --- | --- | --- |
| Pusbisindo (pusbisindo.org, kanal YouTube/FB/TikTok resmi) | Kamus daring di situs **kosong** per 1 Sep 2026; kanal media sosialnya aktif dan berisi video penanda Tuli | Jalur validasi (kontak: pusat@pusbisindo.org / WA di situs) + sumber klip dari media sosial resminya; prioritas tertinggi untuk varian Jakarta |
| Balai Bahasa Prov. Jawa Timur — Video Kosaisyarat (<https://balaibahasajatim.kemendikdasmen.go.id/video>) | Nyata dan diverifikasi (pindai MediaPipe sambil diputar): satu kata per MP4, pola ±2 dtk diam → isyarat → diam | Sumber klip siap-impor, **varian Jawa Timur** — lihat kebijakan varian |

Balai Bahasa Jatim TIDAK punya: halo, kopi, pesan, mau, berapa, bayar,
terima kasih. Yang relevan dan tersedia: SATU–SEMBILAN, MINUM, PANAS,
DINGIN, BESAR, KECIL, MANIS, PAHIT.

### Tier B — komunitas Tuli kredibel (konteks Jakarta)

Kopi Tuli (Duren Tiga), Sunyi Coffee, Silang.id, kreator Tuli yang
identitasnya jelas. Berguna untuk kosakata transaksi kafe yang tidak ada di
Tier A. Wajib cek: penandanya Tuli, variannya Jakarta.

### Tier C — pembanding saja

Aplikasi/dataset akademik. Tidak pernah jadi satu-satunya dasar bentuk.

## Kebijakan varian

Target Lakon tetap BISINDO Jakarta. Keputusan pemilik proyek (1 Sep 2026):
varian Jawa Timur dari Balai Bahasa Jatim **boleh dipakai sebagai draf**
selama `notes` mencatat variannya eksplisit (contoh:
`varian: Jawa Timur (Balai Bahasa Jatim), ganti bila ada sumber Jakarta`).
Jangan pernah mencampur varian tanpa catatan seperti itu.

## Pemetaan status ke skema Lakon

Panduan umum memakai status sendiri; di Lakon semuanya terpetakan ke
`review.status` + `notes`:

- `verified_source_available` → berkas dibuat, `review.status: "draft"`,
  provenance di `notes`. (Yang boleh `approved` hanya validator manusia.)
- `needs_validation` / `static_reference_only` /
  `needs_dynamic_letter_validation` → **tidak dibuat berkasnya sama sekali**.
  Isyarat tanpa sumber video yang memadai tidak masuk `content/signs/`.
- `rejected_sibi` → tolak sumbernya; SIBI dan sumber yang tidak jelas
  BISINDO/SIBI tidak dipakai.

## Nama produk & istilah asing (americano dll.)

Nama produk tanpa isyarat khusus yang tervalidasi → fingerspelling alfabet
BISINDO, bukan mengarang gerakan. Konsekuensi untuk Lakon: butuh 26 berkas
isyarat huruf (banyak yang dua tangan) sebelum skenario "pesan americano"
bisa ada. Keputusan pemilik proyek: ini **fase setelah** 6 kata kedai-kopi
selesai. Sumber alfabet nanti tetap tunduk pada tier di atas.

## Ceklis sebelum menyimpan draf di sign-editor

Turunan ceklis panduan umum, dipetakan ke parameter Lakon:

- Sumber eksplisit BISINDO (bukan SIBI), penanda/organisasi teridentifikasi.
- `structure` sesuai sumber (satu/dua tangan; symmetric/asymmetric).
- Handshape per fase sesuai (sunting sudut jari bila 18 kandidat tak ada
  yang mirip).
- Anchor + offset, orientasi telapak, dan lintasan sesuai video.
- Gerakan berulang, posisi awal/akhir diperhatikan.
- `gloss` (id+en) benar; `notes` berisi kanal, URL, nama penanda, varian,
  tanggal akses.
- Ragu → jangan simpan. Sedikit tapi benar mengalahkan banyak tapi tebakan.
