import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const dir = join(import.meta.dirname, '..', 'content', 'signs')
const errors = []

let files = []
try {
  files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
} catch {
  console.log('content/signs kosong, lewati')
  process.exit(0)
}

for (const file of files) {
  const raw = await readFile(join(dir, file), 'utf8')
  let sign
  try {
    sign = JSON.parse(raw)
  } catch (e) {
    errors.push(`${file}: JSON tidak valid (${e.message})`)
    continue
  }
  const name = basename(file, '.json')
  if (sign.id !== name) errors.push(`${file}: id "${sign.id}" tidak sama dengan nama berkas`)
  if (sign.review?.status !== 'approved') {
    errors.push(`${file}: review.status "${sign.review?.status ?? 'kosong'}" bukan approved`)
  }
}

if (errors.length) {
  console.error('Build diblokir:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log(`${files.length} isyarat approved`)
