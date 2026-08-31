# Lakon

Aplikasi web belajar bahasa isyarat Indonesia (BISINDO, varian Jakarta) melalui
skenario transaksi nyata. Peragaan avatar 3D, praktik webcam dengan verifikasi
di perangkat, dan simulasi percakapan dua arah.

## Menjalankan

```bash
pnpm install
cp .env.example .env        # isi DATABASE_URL (Postgres/Neon)
pnpm db:push                # terapkan skema
node tools/seed.mjs         # akun demo + admin + validator
pnpm dev                    # http://localhost:3000
```

Build produksi: `LAKON_ALLOW_DRAFT=1 pnpm build` (tanpa variabel itu, build
diblokir bila ada isyarat yang belum berstatus `approved`; itu disengaja).

## Akun demo

| Peran     | Email              | Kata sandi        |
| --------- | ------------------ | ----------------- |
| Pengguna  | demo@lakon.id      | CobaLakon2026     |
| Admin     | admin@lakon.id     | AdminLakon2026    |
| Validator | validator@lakon.id | ValidasiLakon2026 |

Akun demo sudah berisi progres parsial (skenario kedai kopi) supaya aplikasi
terlihat dalam keadaan terpakai. Rute `/dev/*` dan `/tools/*` memerlukan peran
admin atau validator.

## Skrip

| Perintah                    | Fungsi                              |
| --------------------------- | ----------------------------------- |
| `pnpm test`                 | Uji unit (Vitest)                   |
| `pnpm e2e`                  | Uji end-to-end (Playwright)         |
| `pnpm check:content`        | Validasi seluruh berkas content/    |
| `pnpm check:signs`          | Gerbang build status review isyarat |
| `pnpm typecheck` / `lint`   | TypeScript dan ESLint               |
| `node tools/seed.mjs`       | Seed database sampai siap demo      |
| `python3 training/train.py` | Latih pengklasifikasi, ekspor ONNX  |
