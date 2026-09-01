import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'Masuk | Lakon' }

export default function MasukPage() {
  return <AuthForm mode="masuk" />
}
