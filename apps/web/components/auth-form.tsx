'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Hand,
  KeyRound,
  LogIn,
  Mail,
  Monitor,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserPlus,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { HeroLatar } from '@/components/hero-latar'
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

const features = [
  {
    icon: Hand,
    title: 'Peragaan karakter 3D',
    body: 'Tiga kecepatan, bisa dijeda per frame.',
  },
  {
    icon: Monitor,
    title: 'Verifikasi di perangkatmu',
    body: 'Umpan balik langsung, ulangi sebanyak perlu.',
  },
  {
    icon: Sparkles,
    title: 'Dua peran dalam satu adegan',
    body: 'Sisi Tuli dan sisi petugas layanan.',
  },
]

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-galat flex items-center gap-1.5 text-sm font-bold">
      <TriangleAlert aria-hidden className="h-4 w-4 shrink-0" />
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
  icon: LucideIcon
  error?: string
  children: ReactNode
}) {
  const FieldIcon = icon
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
          <FieldIcon aria-hidden className="h-5 w-5" />
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
          <HeroLatar ringkas />

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
                      <feature.icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-bold">{feature.title}</span>
                      <span className="text-halaman/65 text-sm">{feature.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-halaman/50 font-mono text-xs uppercase tracking-[0.2em]">
              Lakon · alat belajar bahasa untuk dua pihak
            </p>
          </div>
        </aside>

        <main className="bg-terangkat flex flex-1 items-center justify-center px-4 py-8 sm:px-10 sm:py-14">
          <div className="animasi-masuk border-border-halus bg-kartu shadow-kartu-angkat flex w-full max-w-md flex-col gap-7 rounded-3xl border p-6 sm:p-8">
            <div className="flex flex-col gap-2.5">
              <p className="text-aksen flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em]">
                {mode === 'masuk' ? (
                  <LogIn aria-hidden className="h-4 w-4" />
                ) : (
                  <UserPlus aria-hidden className="h-4 w-4" />
                )}
                {mode === 'masuk' ? 'Masuk' : 'Daftar'}
              </p>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t.title}</h1>
              <p className="text-teks-sekunder">{t.lead}</p>
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              {mode === 'daftar' ? (
                <Field id="nama" label="Nama panggilan" icon={UserRound} error={errors.nama}>
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

              <Field id="email" label="Email" icon={Mail} error={errors.email}>
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
                <Field id="sandi" label="Kata sandi" icon={KeyRound} error={errors.sandi}>
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
                    {showSandi ? (
                      <EyeOff aria-hidden className="h-5 w-5" />
                    ) : (
                      <Eye aria-hidden className="h-5 w-5" />
                    )}
                  </button>
                </Field>
                {mode === 'daftar' && !errors.sandi ? (
                  <p
                    id="bantuan-sandi"
                    className={`flex items-center gap-1.5 text-sm ${
                      sandiCukup ? 'text-berhasil font-bold' : 'text-teks-samar'
                    }`}
                  >
                    <Check aria-hidden className={`h-4 w-4 ${sandiCukup ? '' : 'opacity-40'}`} />
                    Minimal 8 karakter
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p
                  role="alert"
                  className="border-galat/40 bg-galat/5 text-galat flex items-start gap-2.5 rounded-xl border-2 px-4 py-3 font-bold"
                >
                  <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
                  {formError}
                </p>
              ) : null}

              <button type="submit" disabled={busy} className="tombol-sorot w-full text-base">
                {busy ? (
                  <>
                    <span
                      aria-hidden
                      className="border-panggung/40 border-t-panggung h-5 w-5 animate-spin rounded-full border-2"
                    />
                    Sebentar…
                  </>
                ) : (
                  <>
                    {t.action}
                    <ArrowRight aria-hidden className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="border-border-halus flex flex-col gap-4 border-t pt-5">
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
              <ShieldCheck aria-hidden className="mr-1.5 inline h-4 w-4 align-[-3px]" />
              Video latihan tidak pernah meninggalkan perangkatmu.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
