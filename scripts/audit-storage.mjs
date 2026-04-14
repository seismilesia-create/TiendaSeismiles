#!/usr/bin/env node
/**
 * Audita el bucket `product-images` de Supabase Storage en busca de:
 *   - Archivos con MIME fuera del allowlist (jpeg/png/webp)
 *   - Archivos por encima del limite de 5 MB
 *   - Archivos con extensiones sospechosas en el nombre (.svg, .html, .htm, .js, .xml)
 *
 * Por que existe: el validador en src/lib/uploads/validate-image.ts evita
 * que ENTRE contenido peligroso, pero no limpia historico. Este script es la
 * red para detectar (y opcionalmente borrar) cualquier objeto que se haya
 * subido antes del fix.
 *
 * Uso:
 *   node scripts/audit-storage.mjs              # solo audita
 *   node scripts/audit-storage.mjs --delete     # borra los hallazgos
 *
 * Requiere las vars de entorno:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Sale con codigo 1 si encuentra algo (util para CI).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// --- Carga de .env.local sin dependencias extras --------------------------
function loadDotenv(file) {
  try {
    const text = readFileSync(resolve(process.cwd(), file), 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // file may not exist; that's fine
  }
}

loadDotenv('.env.local')
loadDotenv('.env')

// --- Config ----------------------------------------------------------------
const BUCKET = 'product-images'
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024
const SUSPICIOUS_EXT = /\.(svg|svgz|html?|xhtml|xml|js|mjs|cjs|php|sh)$/i

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.',
  )
  process.exit(2)
}

const shouldDelete = process.argv.includes('--delete')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// --- Walk recursivo del bucket --------------------------------------------
async function listAll(prefix = '') {
  const out = []
  const stack = [prefix]
  while (stack.length) {
    const dir = stack.pop()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(dir, { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    if (!data) continue
    for (const entry of data) {
      // Folders have null id and null metadata in supabase-js
      if (entry.id === null && !entry.metadata) {
        stack.push(dir ? `${dir}/${entry.name}` : entry.name)
        continue
      }
      out.push({
        path: dir ? `${dir}/${entry.name}` : entry.name,
        name: entry.name,
        mimetype: entry.metadata?.mimetype ?? null,
        size: Number(entry.metadata?.size ?? 0),
      })
    }
  }
  return out
}

// --- Reglas ---------------------------------------------------------------
function classify(obj) {
  const reasons = []
  if (!obj.mimetype || !ALLOWED_MIMES.has(obj.mimetype)) {
    reasons.push(`mime=${obj.mimetype ?? 'null'}`)
  }
  if (obj.size > MAX_BYTES) {
    reasons.push(`size=${(obj.size / 1024 / 1024).toFixed(2)}MB`)
  }
  if (SUSPICIOUS_EXT.test(obj.name)) {
    reasons.push(`ext=${obj.name.split('.').pop()}`)
  }
  return reasons
}

// --- Main -----------------------------------------------------------------
async function main() {
  console.log(`Auditando bucket "${BUCKET}"...`)
  const all = await listAll()
  console.log(`Total objetos: ${all.length}`)

  const flagged = []
  for (const obj of all) {
    const reasons = classify(obj)
    if (reasons.length > 0) flagged.push({ ...obj, reasons })
  }

  if (flagged.length === 0) {
    console.log('OK: ningun objeto sospechoso encontrado.')
    process.exit(0)
  }

  console.log(`\n${flagged.length} objeto(s) sospechoso(s):\n`)
  for (const f of flagged) {
    console.log(`  - ${f.path}`)
    console.log(`      ${f.reasons.join(', ')}`)
  }

  if (!shouldDelete) {
    console.log('\nPara borrarlos: node scripts/audit-storage.mjs --delete')
    process.exit(1)
  }

  console.log('\nBorrando...')
  const paths = flagged.map((f) => f.path)
  // Supabase admite borrar varios paths en una llamada
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) {
    console.error('Error al borrar:', error.message)
    process.exit(3)
  }
  console.log(`Borrados ${paths.length} objeto(s).`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fallo el audit:', err)
  process.exit(4)
})
