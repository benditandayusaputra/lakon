import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { createSession, setSessionCookie, verifyPassword } from '@/db/auth'

const bodySchema = z.object({
  email: z.string().trim().email(),
  sandi: z.string().min(1),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data formulir belum lengkap.' }, { status: 400 })
  }
  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.data.email.toLowerCase()))
      .limit(1)
    const user = rows[0]
    if (!user || !verifyPassword(parsed.data.sandi, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: 'Email atau kata sandi tidak cocok.' },
        { status: 401 },
      )
    }
    const session = await createSession(user.id)
    await setSessionCookie(session.token, session.maxAge)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server bermasalah. Coba lagi.' }, { status: 500 })
  }
}
