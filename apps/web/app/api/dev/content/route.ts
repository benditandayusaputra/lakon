import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import { handshapeSchema, signSchema, type Sign } from '@lakon/sign-schema'

export const dynamic = 'force-dynamic'

const contentRoot = join(process.cwd(), '..', '..', 'content')

const readFolder = async (folder: string): Promise<Record<string, unknown>> => {
  const dir = join(contentRoot, folder)
  const files: Record<string, unknown> = {}
  let names: string[] = []
  try {
    names = (await readdir(dir)).filter((name) => name.endsWith('.json'))
  } catch {
    return files
  }
  for (const name of names) {
    const raw = await readFile(join(dir, name), 'utf8')
    files[name.replace(/\.json$/, '')] = JSON.parse(raw)
  }
  return files
}

export async function GET() {
  return NextResponse.json({
    handshapes: await readFolder('handshapes'),
    signs: await readFolder('signs'),
    scenarios: await readFolder('scenarios'),
  })
}

const writeJson = (folder: string, id: string, data: unknown) =>
  writeFile(join(contentRoot, folder, `${id}.json`), JSON.stringify(data, null, 2) + '\n')

const refreshUsedIn = async () => {
  const signs = await readFolder('signs')
  const usedIn = new Map<string, Set<string>>()
  for (const [signId, raw] of Object.entries(signs)) {
    const sign = raw as Sign
    for (const phase of sign.phases ?? []) {
      for (const spec of [phase.dominant, phase.nonDominant]) {
        if (!spec) continue
        if (!usedIn.has(spec.handshape)) usedIn.set(spec.handshape, new Set())
        usedIn.get(spec.handshape)!.add(signId)
      }
    }
  }
  const handshapes = await readFolder('handshapes')
  for (const [shapeId, raw] of Object.entries(handshapes)) {
    const shape = raw as { usedIn?: string[] }
    const next = [...(usedIn.get(shapeId) ?? new Set())].sort()
    const current = [...(shape.usedIn ?? [])].sort()
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      await writeJson('handshapes', shapeId, { ...shape, usedIn: next })
    }
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    signs?: Record<string, unknown>
    handshapes?: Record<string, unknown>
  }
  const issues: string[] = []
  const validSigns: [string, unknown][] = []
  const validShapes: [string, unknown][] = []

  for (const [id, raw] of Object.entries(body.signs ?? {})) {
    const result = signSchema.safeParse(raw)
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => `${id}: ${issue.path.join('.')}: ${issue.message}`),
      )
      continue
    }
    if (result.data.id !== id) {
      issues.push(`${id}: id tidak sama dengan kunci`)
      continue
    }
    validSigns.push([id, result.data])
  }

  for (const [id, raw] of Object.entries(body.handshapes ?? {})) {
    const result = handshapeSchema.safeParse(raw)
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => `${id}: ${issue.path.join('.')}: ${issue.message}`),
      )
      continue
    }
    if (result.data.id !== id) {
      issues.push(`${id}: id tidak sama dengan kunci`)
      continue
    }
    validShapes.push([id, result.data])
  }

  if (issues.length > 0) {
    return NextResponse.json({ ok: false, issues }, { status: 422 })
  }

  for (const [id, data] of validSigns) await writeJson('signs', id, data)
  for (const [id, data] of validShapes) await writeJson('handshapes', id, data)
  await refreshUsedIn()

  return NextResponse.json({ ok: true, saved: validSigns.length + validShapes.length })
}
