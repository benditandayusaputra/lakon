import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { getSessionUser } from '@/db/auth'

const patchSchema = z.object({
  avatar: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .max(300_000)
    .nullable(),
})

export async function PATCH(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Foto tidak valid.' }, { status: 400 })
  }
  await db
    .update(schema.users)
    .set({ avatar: parsed.data.avatar })
    .where(eq(schema.users.id, user.id))
  return NextResponse.json({ ok: true, avatar: parsed.data.avatar })
}

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: true, user: null })
  }
}
