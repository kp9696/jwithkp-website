// Prints the SQL that creates (or resets the password of) a dashboard user. Nothing is sent anywhere.
//   node scripts/create-admin.mjs you@example.com "Your Name" admin
// Then run the printed command to apply it to the database.
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline'
import { writeFileSync } from 'node:fs'

const [email, name = '', role = 'sales'] = process.argv.slice(2)
if (!email || !['admin', 'sales'].includes(role)) {
  console.error('Usage: node scripts/create-admin.mjs <email> "<name>" <admin|sales>')
  process.exit(1)
}

const rl = createInterface({ input: process.stdin, output: process.stderr })
const password = await new Promise((r) => rl.question('Choose a password (at least 12 characters): ', r))
rl.close()
if (password.length < 12) {
  console.error('Password must be at least 12 characters.')
  process.exit(1)
}

const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, 100_000, 32, 'sha256')
const stored = `pbkdf2$100000$${salt.toString('base64')}$${hash.toString('base64')}`
const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const sql = `INSERT INTO admin_users (email, name, role, password_hash) VALUES (${q(email.toLowerCase())}, ${q(name)}, ${q(role)}, ${q(stored)}) ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = excluded.role, password_hash = excluded.password_hash;`
// The hash contains '$' characters, which a shell would expand, so the SQL goes to a file instead of the command line.
const file = '.create-admin.sql'
writeFileSync(file, `${sql}\n`, { mode: 0o600 })
console.error(`\nWrote ${file}. Apply it, then delete it:\n`)
console.log(`npx wrangler d1 execute jwithkp --remote --file ${file} && rm ${file}`)
console.error('\n(Use --local instead of --remote to test against the local database.)')
