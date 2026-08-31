import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

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
