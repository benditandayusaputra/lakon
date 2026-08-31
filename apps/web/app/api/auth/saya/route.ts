import { NextResponse } from 'next/server'
import { getSessionUser } from '@/db/auth'

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: true, user: null })
  }
}
