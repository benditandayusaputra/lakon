'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, LogOut, Trash2, UserRound } from 'lucide-react'
import { SyncBadge } from '@/components/sync-badge'
import {
  clearAllProgress,
  listRuns,
  listSignProgress,
  pullFromServer,
} from '@/features/progress/store'

export function Profil({ nama, email, peran }: { nama: string; email: string; peran: string }) {
  const [dikuasai, setDikuasai] = useState(0)
  const [sesi, setSesi] = useState(0)
  const [adegan, setAdegan] = useState(0)
  const [dihapus, setDihapus] = useState(false)
  const [minta, setMinta] = useState(false)

  const muat = () => {
    void listSignProgress().then((entries) =>
      setDikuasai(
        entries.filter((entry) => entry.status !== 'belum' && entry.status !== 'berlatih').length,
      ),
    )
    void listRuns().then((runs) => {
      setSesi(runs.length)
      setAdegan(new Set(runs.map((run) => run.scenarioId)).size)
    })
  }

  useEffect(() => {
    void pullFromServer()
      .catch(() => {})
      .then(muat)
  }, [])

  const hapus = () => {
    void clearAllProgress().then(() => {
      setDikuasai(0)
      setSesi(0)
      setAdegan(0)
      setMinta(false)
      setDihapus(true)
    })
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung/90 text-halaman sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-6 py-3.5">
          <Link
            href="/skenario"
            className="flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
            style={{ minHeight: 44 }}
          >
            <ArrowLeft aria-hidden size={15} />
            Skenario
          </Link>
          <span className="bg-halaman rounded-full px-3 py-1.5">
            <SyncBadge />
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <section className="border-border-halus bg-kartu shadow-kartu flex items-center gap-4 rounded-3xl border p-6">
          <span
            aria-hidden
            className="bg-panggung text-sorot flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          >
            <UserRound size={30} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-3xl font-semibold">{nama}</h1>
            <p className="text-teks-sekunder truncate">{email}</p>
            <p className="text-teks-samar mt-0.5 font-mono text-xs uppercase tracking-wide">
              peran akun: {peran}
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Progres belajarmu</h2>
          <dl className="divide-border-halus border-border-halus bg-kartu shadow-kartu mt-3 grid grid-cols-3 divide-x rounded-2xl border">
            {(
              [
                [dikuasai, 'isyarat dikuasai'],
                [sesi, 'sesi selesai'],
                [adegan, 'adegan dijalani'],
              ] as const
            ).map(([nilai, label]) => (
              <div key={label} className="px-4 py-4">
                <dd className="font-display text-3xl font-semibold">{nilai}</dd>
                <dt className="text-teks-sekunder mt-0.5 text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-border-halus bg-kartu shadow-kartu flex flex-col gap-4 rounded-3xl border p-6">
          <h2 className="font-display text-2xl font-semibold">Akun</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void fetch('/api/auth/keluar', { method: 'POST' }).then(() => {
                  window.location.assign('/')
                })
              }}
              className="tombol-utama"
            >
              <LogOut aria-hidden size={16} />
              Keluar
            </button>
          </div>
        </section>

        <section className="border-border-tegas bg-kartu flex flex-col gap-3 rounded-3xl border-2 p-6">
          <h2 className="font-display text-2xl font-semibold">Hapus data belajar</h2>
          <p className="text-teks-sekunder max-w-prose">
            Menghapus seluruh progres isyarat dan riwayat sesi, di perangkat ini dan di server.
            Akunmu tetap ada. Tindakan ini tidak bisa dibatalkan.
          </p>
          <p aria-live="polite" className="text-sm">
            {dihapus ? (
              <span className="text-berhasil flex items-center gap-2 font-bold">
                <CheckCircle2 aria-hidden size={16} />
                Seluruh data belajarmu sudah dihapus.
              </span>
            ) : null}
          </p>
          {minta ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-bold">Yakin hapus seluruh data belajarmu?</p>
              <button type="button" onClick={hapus} className="tombol-utama">
                Ya, hapus sekarang
              </button>
              <button type="button" onClick={() => setMinta(false)} className="tombol-sekunder">
                Batal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDihapus(false)
                setMinta(true)
              }}
              className="border-border-tegas text-teks-sekunder hover:border-galat hover:text-galat flex items-center gap-2 self-start rounded-lg border px-4 text-sm transition-colors"
              style={{ minHeight: 44 }}
            >
              <Trash2 aria-hidden size={15} />
              Hapus seluruh data belajarku
            </button>
          )}
        </section>
      </div>
    </main>
  )
}
