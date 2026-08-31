import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(import.meta.dirname, '..')

const readFolder = async (folder) => {
  const dir = join(root, 'content', folder)
  const files = {}
  let names = []
  try {
    names = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  } catch {
    return files
  }
  for (const name of names) {
    const raw = await readFile(join(dir, name), 'utf8')
    try {
      files[basename(name, '.json')] = JSON.parse(raw)
    } catch (err) {
      files[basename(name, '.json')] = { __jsonError: err.message }
    }
  }
  return files
}

export const loadContent = async () => ({
  handshapes: await readFolder('handshapes'),
  signs: await readFolder('signs'),
  scenarios: await readFolder('scenarios'),
})

export const report = (issues) => {
  for (const issue of issues) {
    console.error(`  - ${issue.file} → ${issue.path}: ${issue.message}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { validateContent } = await import('../packages/sign-schema/src/index.ts')
  const content = await loadContent()
  const issues = validateContent(content)
  const counts = `${Object.keys(content.handshapes).length} handshape, ${Object.keys(content.signs).length} isyarat, ${Object.keys(content.scenarios).length} skenario`
  if (issues.length > 0) {
    console.error(`Konten tidak valid (${counts}):`)
    report(issues)
    process.exit(1)
  }
  console.log(`Konten valid: ${counts}`)
}
