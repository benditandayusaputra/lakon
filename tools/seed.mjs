import { randomBytes, scryptSync } from 'node:crypto'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(join(import.meta.dirname, '..', 'apps', 'web', 'package.json'))
const { neon } = require('@neondatabase/serverless')

process.loadEnvFile(join(import.meta.dirname, '..', '.env'))
const sql = neon(process.env.DATABASE_URL)

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

const upsertUser = async (email, displayName, password, role) => {
  const rows = await sql(
    `insert into users (email, display_name, password_hash, role)
     values ($1, $2, $3, $4)
     on conflict (email) do update set display_name = $2, password_hash = $3, role = $4
     returning id`,
    [email, displayName, hashPassword(password), role],
  )
  return rows[0].id
}

const demoId = await upsertUser('demo@lakon.id', 'Akun Demo', 'CobaLakon2026', 'pengguna')
await upsertUser('admin@lakon.id', 'Admin Lakon', 'AdminLakon2026', 'admin')
await upsertUser('validator@lakon.id', 'Validator Lakon', 'ValidasiLakon2026', 'validator')

const progress = [
  ['halo', 'dikuasai', 2],
  ['kopi', 'dikuasai', 3],
  ['panas', 'dikuasai', 1],
  ['berapa', 'berlatih', 4],
  ['bayar', 'berlatih', 2],
  ['terima-kasih', 'dinilai-sendiri', 5],
]
for (const [signId, status, attempts] of progress) {
  await sql(
    `insert into sign_progress (user_id, sign_id, status, attempts, updated_at)
     values ($1, $2, $3, $4, now())
     on conflict (user_id, sign_id) do update set status = $3, attempts = $4, updated_at = now()`,
    [demoId, signId, status, attempts],
  )
}

await sql(`delete from scenario_runs where user_id = $1`, [demoId])
await sql(
  `insert into scenario_runs (user_id, scenario_id, direction, duration_ms, mastered, needs_repeat, completed_at)
   values ($1, 'kedai-kopi', 'deaf', 540000, $2, $3, now() - interval '2 days')`,
  [demoId, JSON.stringify(['halo', 'kopi', 'panas']), JSON.stringify(['berapa', 'terima-kasih'])],
)

console.log('seed selesai: demo@lakon.id / CobaLakon2026 (progres parsial terisi)')
console.log('              admin@lakon.id / AdminLakon2026')
console.log('              validator@lakon.id / ValidasiLakon2026')
