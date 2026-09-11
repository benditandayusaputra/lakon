'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'

type Mode = 'masuk' | 'daftar'

type FieldErrors = Partial<Record<'nama' | 'email' | 'sandi', string>>

const label: Record<
  Mode,
  {
    title: string
    lead: string
    action: string
    switchText: string
    switchHref: string
    switchLabel: string
    panelTitle: string
    panelBody: string
  }
> = {
  masuk: {
    title: 'Selamat datang kembali',
    lead: 'Masuk untuk melanjutkan latihan dari adegan terakhirmu.',
    action: 'Masuk',
    switchText: 'Belum punya akun?',
    switchHref: '/daftar',
    switchLabel: 'Daftar gratis',
    panelTitle: 'Panggungmu masih menunggu.',
    panelBody:
      'Kemajuanmu tersimpan per adegan dan per peran. Lanjutkan tepat dari tempatmu berhenti.',
  },
  daftar: {
    title: 'Buat akun',
    lead: 'Satu akun untuk lima adegan dan dua peran.',
    action: 'Buat akun',
    switchText: 'Sudah punya akun?',
    switchHref: '/masuk',
    switchLabel: 'Masuk',
    panelTitle: 'Naik ke panggung pertamamu.',
    panelBody:
      'Simpan kemajuan latihanmu: isyarat yang sudah lulus, adegan yang sedang berjalan, dan hasil ujian percakapan.',
  },
}

const scenes = [
  ['Kedai kopi', '#b4632c'],
  ['Puskesmas', '#3e7d5e'],
  ['Transportasi', '#33608c'],
  ['Wawancara kerja', '#8a6a45'],
  ['Darurat', '#5b7285'],
] as const

function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

const paths = {
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z M7 11V7a5 5 0 0 1 10 0v4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff:
    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22',
  alert:
    'M12 9v4 M12 17h.01 M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  arrowRight: 'M5 12h14 M12 5l7 7-7 7',
  check: 'M20 6 9 17l-5-5',
  camera:
    'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  hand: 'M18 11V6a2 2 0 0 0-4 0v5 M14 10V4a2 2 0 0 0-4 0v6 M10 10.5V6a2 2 0 0 0-4 0v8 M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
  monitor: 'M2 3h20v14H2z M8 21h8 M12 17v4',
  sparkle:
    'M9.94 15.5 8.5 21l-1.44-5.5L1.5 14l5.56-1.5L8.5 7l1.44 5.5L15.5 14l-5.56 1.5Z M19 3v4 M17 5h4',
}

const features = [
  {
    icon: paths.hand,
    title: 'Peragaan karakter 3D',
    body: 'Tiga kecepatan, bisa dijeda per frame.',
  },
  {
    icon: paths.monitor,
    title: 'Verifikasi di perangkatmu',
    body: 'Umpan balik langsung, ulangi sebanyak perlu.',
  },
  {
    icon: paths.sparkle,
    title: 'Dua peran dalam satu adegan',
    body: 'Sisi Tuli dan sisi petugas layanan.',
  },
]

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-galat flex items-center gap-1.5 text-sm font-bold">
      <Icon d={paths.alert} className="h-4 w-4 shrink-0" />
      {message}
    </p>
  )
}

function Field({
  id,
  label: fieldLabel,
  icon,
  error,
  children,
}: {
  id: string
  label: string
  icon: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {fieldLabel}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center ${
            error ? 'text-galat' : 'text-teks-samar'
          }`}
        >
          <Icon d={icon} />
        </span>
        {children}
      </div>
      <FieldError id={`galat-${id}`} message={error} />
    </div>
  )
}

function inputClass(invalid: boolean) {
  return `bg-kartu min-h-12 w-full rounded-xl border-2 pl-11 text-base transition-colors ${
    invalid
      ? 'border-galat'
      : 'border-border-halus hover:border-border-tegas focus:border-border-tegas'
  }`
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const t = label[mode]
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showSandi, setShowSandi] = useState(false)
  const [sandiValue, setSandiValue] = useState('')

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

  const sandiCukup = sandiValue.length >= 8

  return (
    <div className="bg-halaman flex min-h-dvh flex-col">
      <div aria-hidden className="garis-tenda h-1.5 shrink-0" />

      <header className="bg-panggung text-halaman lg:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Logo className="h-6 w-6" />
            Lakon
          </Link>
          <p className="text-halaman/60 font-mono text-xs uppercase tracking-[0.2em]">
            BISINDO Jakarta
          </p>
        </div>
      </header>

      <div className="flex flex-1 lg:grid lg:grid-cols-[10fr_9fr]">
        <aside className="bg-panggung text-halaman relative hidden overflow-hidden lg:flex lg:flex-col">
          <div aria-hidden className="sorot-panggung absolute inset-0" />
          <div
            aria-hidden
            className="sorot-kerucut absolute -top-24 left-1/2 h-[36rem] w-full -translate-x-1/2"
          />

          <div className="relative flex flex-1 flex-col justify-between gap-12 px-10 py-10 xl:px-16">
            <Link href="/" className="flex items-center gap-2.5 self-start text-xl font-bold">
              <Logo />
              Lakon
            </Link>

            <div className="animasi-masuk flex max-w-lg flex-col gap-10">
              <div className="flex flex-col gap-5">
                <p className="text-sorot flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em]">
                  <span aria-hidden className="bg-sorot h-px w-7" />
                  BISINDO Varian Jakarta
                </p>
                <h2 className="font-display text-balance text-4xl font-semibold leading-[1.1] xl:text-[2.75rem]">
                  {t.panelTitle}
                </h2>
                <p className="text-halaman/75 text-pretty text-lg leading-relaxed">{t.panelBody}</p>
              </div>

              <ul className="flex flex-col gap-5">
                {features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-4">
                    <span className="bg-halaman/10 text-sorot flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                      <Icon d={feature.icon} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-bold">{feature.title}</span>
                      <span className="text-halaman/65 text-sm">{feature.body}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-halaman/15 flex flex-col gap-3 border-t pt-6">
                <p className="text-halaman/60 font-mono text-xs uppercase tracking-[0.2em]">
                  Lima adegan
                </p>
                <ul className="flex flex-wrap gap-2">
                  {scenes.map(([name, color]) => (
                    <li
                      key={name}
                      className="border-halaman/20 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                    >
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-halaman/60 flex items-center gap-2.5 text-sm">
              <Icon d={paths.shield} className="text-sorot h-4.5 w-4.5 shrink-0" />
              Video latihan tidak pernah meninggalkan perangkatmu.
            </p>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 sm:py-14">
          <div className="animasi-masuk flex w-full max-w-md flex-col gap-8">
            <div className="flex flex-col gap-2.5">
              <p className="text-aksen flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em]">
                <span aria-hidden className="bg-aksen h-px w-7" />
                {mode === 'masuk' ? 'Masuk' : 'Daftar'}
              </p>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t.title}</h1>
              <p className="text-teks-sekunder">{t.lead}</p>
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              {mode === 'daftar' ? (
                <Field id="nama" label="Nama panggilan" icon={paths.user} error={errors.nama}>
                  <input
                    id="nama"
                    name="nama"
                    autoComplete="nickname"
                    placeholder="Nama yang dipakai di adegan"
                    aria-invalid={Boolean(errors.nama)}
                    aria-describedby="galat-nama"
                    className={inputClass(Boolean(errors.nama))}
                  />
                </Field>
              ) : null}

              <Field id="email" label="Email" icon={paths.mail} error={errors.email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="galat-email"
                  className={inputClass(Boolean(errors.email))}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Field id="sandi" label="Kata sandi" icon={paths.lock} error={errors.sandi}>
                  <input
                    id="sandi"
                    name="sandi"
                    type={showSandi ? 'text' : 'password'}
                    autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'daftar' ? 'Minimal 8 karakter' : 'Kata sandimu'}
                    onChange={(event) => setSandiValue(event.currentTarget.value)}
                    aria-invalid={Boolean(errors.sandi)}
                    aria-describedby="galat-sandi bantuan-sandi"
                    className={`${inputClass(Boolean(errors.sandi))} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSandi((v) => !v)}
                    aria-label={showSandi ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    aria-pressed={showSandi}
                    className="text-teks-samar hover:text-teks absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg transition-colors"
                  >
                    <Icon d={showSandi ? paths.eyeOff : paths.eye} />
                  </button>
                </Field>
                {mode === 'daftar' && !errors.sandi ? (
                  <p
                    id="bantuan-sandi"
                    className={`flex items-center gap-1.5 text-sm ${
                      sandiCukup ? 'text-berhasil font-bold' : 'text-teks-samar'
                    }`}
                  >
                    <Icon d={paths.check} className={`h-4 w-4 ${sandiCukup ? '' : 'opacity-40'}`} />
                    Minimal 8 karakter
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p
                  role="alert"
                  className="border-galat/40 bg-galat/5 text-galat flex items-start gap-2.5 rounded-xl border-2 px-4 py-3 font-bold"
                >
                  <Icon d={paths.alert} className="mt-0.5 h-5 w-5 shrink-0" />
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="bg-teks text-halaman hover:bg-panggung inline-flex min-h-14 items-center justify-center gap-2.5 rounded-xl px-6 font-bold transition-colors"
              >
                {busy ? (
                  <>
                    <span
                      aria-hidden
                      className="border-halaman/40 border-t-halaman h-5 w-5 animate-spin rounded-full border-2"
                    />
                    Sebentar…
                  </>
                ) : (
                  <>
                    {t.action}
                    <Icon d={paths.arrowRight} className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-col gap-5">
              <p className="text-teks-sekunder flex items-center gap-3 text-sm">
                <span aria-hidden className="bg-border-halus h-px flex-1" />
                atau
                <span aria-hidden className="bg-border-halus h-px flex-1" />
              </p>

              <Link
                href="/#coba"
                className="border-border-tegas hover:bg-terangkat inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border-2 px-6 font-bold transition-colors"
              >
                <Icon d={paths.camera} className="text-aksen h-5 w-5" />
                Coba dulu tanpa akun
              </Link>

              <p className="text-center text-sm">
                {t.switchText}{' '}
                <Link
                  href={t.switchHref}
                  className="text-aksen font-bold underline underline-offset-4"
                >
                  {t.switchLabel}
                </Link>
              </p>
            </div>

            <p className="text-teks-samar text-center text-xs lg:hidden">
              <Icon d={paths.shield} className="mr-1.5 inline h-4 w-4 align-[-3px]" />
              Video latihan tidak pernah meninggalkan perangkatmu.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
