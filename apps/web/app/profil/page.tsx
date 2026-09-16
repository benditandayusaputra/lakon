import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Profil } from '@/components/profil'
import { getSessionUser, isDemoAccount } from '@/db/auth'

export const metadata: Metadata = { title: 'Profil | Lakon' }

export default async function ProfilPage() {
  const user = await getSessionUser().catch(() => null)
  if (!user) redirect('/masuk')
  return (
    <Profil
      nama={user.displayName}
      email={user.email}
      peran={user.role}
      avatarAwal={user.avatar}
      genderAwal={user.gender}
      akunDemo={isDemoAccount(user.email)}
    />
  )
}
