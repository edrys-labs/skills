#!/usr/bin/env node
// Shows what edrys-Lite reads from a module: name, description, default rooms
// and the module-config schema of each role config.
//
//   node scripts/module-info.mjs <module URL or local path> [--entry] [--json]
//
//   --entry  print a lab entry to paste: keys with a schema default are set,
//            the others are listed as comments to fill in
//   --json   print the parsed declaration as JSON

import { CONFIG_TYPES, entryYaml, getModuleInfo } from './lib/module.mjs'

const args = process.argv.slice(2)
const source = args.find((a) => !a.startsWith('--'))
if (!source) {
  console.error('usage: node scripts/module-info.mjs <module URL or local path> [--entry] [--json]')
  process.exit(2)
}

let info
try {
  info = await getModuleInfo(source)
} catch (e) {
  console.error(`could not load ${source}: ${e.message}`)
  process.exit(1)
}

if (args.includes('--json')) {
  const { rawSchema, ...rest } = info
  console.log(JSON.stringify(rest, null, 2))
  process.exit(0)
}

if (args.includes('--entry')) {
  console.log(entryYaml(source, info, { width: 'full', height: 'tall' }))
  process.exit(0)
}

const kinds = {
  html: 'HTML page (loaded from its URL)',
  inlined: 'HTML page inlined via the `fetch` meta tag (data: URL, opaque origin, no Edrys.setItem/getItem)',
  yaml: 'YAML module (inlined: data: URL, opaque origin, no Edrys.setItem/getItem)',
}

console.log(`name:        ${info.name || '(none)'}`)
console.log(`kind:        ${kinds[info.kind]}`)
console.log(`show-in:     ${info.showIn.join(', ')}`)
if (info.description) console.log(`description: ${info.description.replace(/\s+/g, ' ').trim()}`)
if (info.looksLikeModule === false) console.log('warning:     the page does not load edrys.js; it may not be an edrys module')

if (info.schemaError) {
  console.log(`\nmodule-config does not parse (${info.schemaError}); edrys-Lite shows no form for it.`)
} else if (!info.schema) {
  console.log('\nNo module-config schema: the module declares no config fields. Check its README for the keys it reads.')
} else {
  for (const type of CONFIG_TYPES) {
    const fields = info.schema[type]
    if (!fields) continue
    console.log(`\n${type}:`)
    for (const [key, field] of Object.entries(fields)) {
      const parts = [field.type || 'string']
      if (field.options) parts.push(`options: ${field.options.join(' | ')}`)
      if (field.default !== undefined) parts.push(`default: ${JSON.stringify(field.default)}`)
      if (field.presets) parts.push(`presets for: ${Object.keys(field.presets).join(', ')}`)
      console.log(`  ${key}  (${parts.join('; ')})`)
      if (field.hint) console.log(`      ${field.hint.replace(/\s+/g, ' ').trim()}`)
    }
  }
  const unknown = Object.keys(info.schema).filter((k) => !CONFIG_TYPES.includes(k))
  if (unknown.length) console.log(`\nignored by edrys-Lite (not a config type): ${unknown.join(', ')}`)
}
