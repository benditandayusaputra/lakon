'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Mode = 'masuk' | 'daftar'

type FieldErrors = Partial<Record<'nama' | 'email' | 'sandi', string>>

const label: Record<
  Mode,
  { title: string; action: string; switchText: string; switchHref: string; switchLabel: string }
> = {
  masuk: {
    title: 'Masuk',
    action: 'Masuk',
    switchText: 'Belum punya akun?',
    switchHref: '/daftar',
    switchLabel: 'Daftar',
  },
  daftar: {
    title: 'Daftar',
    action: 'Buat akun',
    switchText: 'Sudah punya akun?',
    switchHref: '/masuk',
    switchLabel: 'Masuk',
  },
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-ulang flex items-center gap-1.5 text-sm font-bold">
      <span aria-hidden>⚠</span>
      {message}
    </p>
  )
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const t = label[mode]
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nama = String(data.get('nama') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const sandi = String(data.get('sandi') ?? '')

    const next: FieldErrors = {}
    if (mode === 'daftar' && nama.length < 2) next.nama = 'Isi nama panggilanmu.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Alamat email belum lengkap.'
    if (sandi.length < 8) next.sandi = 'Kata sandi minimal 8 karakter.'
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mode === 'daftar' ? { nama, email, sandi } : { email, sandi }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        field?: keyof FieldErrors
      }
      if (!response.ok || !result.ok) {
        if (result.field && result.error) {
          setErrors({ [result.field]: result.error })
        } else {
          setFormError(result.error ?? 'Email atau kata sandi tidak cocok.')
        }
        return
      }
      router.push('/skenario')
    } catch {
      setFormError('Koneksi gagal. Periksa jaringanmu lalu coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div>
        <Link href="/" className="text-xl font-bold">
          Lakon
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{t.title}</h1>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {mode === 'daftar' ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nama" className="font-bold">
              Nama panggilan
            </label>
            <input
              id="nama"
              name="nama"
              autoComplete="nickname"
              aria-invalid={Boolean(errors.nama)}
              aria-describedby="galat-nama"
              className="border-border-tegas min-h-12 rounded-xl border-2 px-4"
            />
            <FieldError id="galat-nama" message={errors.nama} />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-bold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="galat-email"
            className="border-border-tegas min-h-12 rounded-xl border-2 px-4"
          />
          <FieldError id="galat-email" message={errors.email} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sandi" className="font-bold">
            Kata sandi
          </label>
          <input
            id="sandi"
            name="sandi"
            type="password"
            autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
            aria-invalid={Boolean(errors.sandi)}
            aria-describedby="galat-sandi"
            className="border-border-tegas min-h-12 rounded-xl border-2 px-4"
          />
          <FieldError id="galat-sandi" message={errors.sandi} />
        </div>

        {formError ? (
          <p role="alert" className="text-ulang flex items-center gap-1.5 font-bold">
            <span aria-hidden>⚠</span>
            {formError}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="tombol-utama">
          {busy ? 'Sebentar…' : t.action}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-sm">
        <p>
          {t.switchText}{' '}
          <Link href={t.switchHref} className="font-bold underline underline-offset-4">
            {t.switchLabel}
          </Link>
        </p>
        <p>
          <Link href="/#coba" className="underline underline-offset-4">
            Coba dulu tanpa akun
          </Link>
        </p>
      </div>
    </main>
  )
}
