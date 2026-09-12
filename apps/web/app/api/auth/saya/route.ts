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
    .nullable()
    .optional(),
  gender: z.enum(['perempuan', 'laki-laki']).nullable().optional(),
})

export async function PATCH(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Foto tidak valid.' }, { status: 400 })
  }
  const perubahan: { avatar?: string | null; gender?: 'perempuan' | 'laki-laki' | null } = {}
  if (parsed.data.avatar !== undefined) perubahan.avatar = parsed.data.avatar
  if (parsed.data.gender !== undefined) perubahan.gender = parsed.data.gender
  if (Object.keys(perubahan).length > 0) {
    await db.update(schema.users).set(perubahan).where(eq(schema.users.id, user.id))
  }
  return NextResponse.json({ ok: true, ...perubahan })
}

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: true, user: null })
  }
}
