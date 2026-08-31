import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'Daftar — Lakon' }

export default function DaftarPage() {
  return <AuthForm mode="daftar" />
}
