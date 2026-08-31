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
          className="border-ink/20 focus-visible:outline-accent rounded-md border px-3 py-1.5 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {copy[other].alt}
        </button>
      </div>
      <h1 className="text-balance text-4xl font-semibold" lang={lang}>
        {t.title}
      </h1>
      <p className="text-pretty text-lg" lang={lang}>
        {t.body}
      </p>
      <p>
        <a
          href="/belajar"
          className="bg-ink text-paper focus-visible:outline-accent inline-block rounded-md px-5 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
          lang={lang}
        >
          {t.cta}
        </a>
      </p>
    </main>
  )
}
