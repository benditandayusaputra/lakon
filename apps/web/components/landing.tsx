'use client'

import { useState } from 'react'

const copy = {
  id: {
    title: 'Belajar BISINDO lewat percakapan nyata',
    body: 'Latih isyarat dengan peragaan avatar, praktik di depan kamera, lalu jalani simulasi transaksi. Untuk teman Tuli dan untuk pekerja layanan.',
    cta: 'Mulai belajar',
    alt: 'Bahasa Indonesia',
  },
  en: {
    title: 'Learn BISINDO through real conversations',
    body: 'Study signs with an avatar, practise on camera, then run a full transaction simulation. For Deaf signers and for service workers.',
    cta: 'Start learning',
    alt: 'English',
  },
} as const

type Lang = keyof typeof copy

export function Landing() {
  const [lang, setLang] = useState<Lang>('id')
  const t = copy[lang]
  const other: Lang = lang === 'id' ? 'en' : 'id'

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLang(other)}
          className="rounded-md border border-ink/20 px-3 py-1.5 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {copy[other].alt}
        </button>
      </div>
      <h1 className="text-4xl font-semibold text-balance" lang={lang}>
        {t.title}
      </h1>
      <p className="text-lg text-pretty" lang={lang}>
        {t.body}
      </p>
      <p>
        <a
          href="/belajar"
          className="inline-block rounded-md bg-ink px-5 py-3 text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          lang={lang}
        >
          {t.cta}
        </a>
      </p>
    </main>
  )
}
