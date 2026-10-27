#!/usr/bin/env node
// Maintainer tool (not installed with the skills): refreshes the generated
// part of skills/edrys-lab/reference/module-catalog/ from the published
// modules listed in tools/catalog-modules.json.
//
//   npm install --prefix skills/edrys-lab/scripts
//   node tools/build-catalog.mjs [file ...]       # all modules, or only these
//
// Each catalog file keeps everything outside the GENERATED markers, so the
// hand-written notes survive a refresh. Missing files are created with a stub.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONFIG_TYPES, entryYaml, getModuleInfo } from '../skills/edrys-lab/scripts/lib/module.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const catalogDir = path.join(root, 'skills/edrys-lab/reference/module-catalog')
const START = '<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->'
const END = '<!-- GENERATED:END -->'

const modules = JSON.parse(await readFile(path.join(root, 'tools/catalog-modules.json'), 'utf8'))
const only = process.argv.slice(2)
const today = new Date().toISOString().slice(0, 10)

// Module descriptions are HTML-ish text: keep link targets, drop tags.
const plain = (s) =>
  s
    .replace(/<a\b[^>]*href=['"]([^'"]+)['"][^>]*>[\s\S]*?<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()

function generated(entry, info) {
  const lines = [START, '', `- **URL:** \`${entry.url}\``, `- **Source:** https://github.com/${entry.repo}`]
  lines.push(`- **Default rooms (\`show-in\`):** \`${info.showIn.join(', ')}\``)
  if (info.kind !== 'html') lines.push('- **Inlined** (data: URL): runs with an opaque origin')
  if (info.description) lines.push(`- **Description:** ${plain(info.description)}`)
  lines.push(`- **Schema read:** ${today}`)
  lines.push('')

  if (info.schemaError) {
    lines.push(`The module's \`module-config\` does not parse (${info.schemaError}); edrys-Lite shows no form for it.`, '')
  } else if (!info.schema) {
    lines.push('The module declares no `module-config` schema. Its config keys are described in the notes below.', '')
  } else {
    lines.push('### Config schema', '')
    for (const type of CONFIG_TYPES) {
      const fields = info.schema[type]
      if (!fields) continue
      lines.push(`**\`${type}\`**`, '', '| Key | Type | Default | Hint |', '|-----|------|---------|------|')
      for (const [key, f] of Object.entries(fields)) {
        let type = f.type || 'string'
        if (f.options) type += `: ${f.options.join(' / ')}`
        if (f.presets) type += ' (presets)'
        const def = f.default !== undefined ? `\`${JSON.stringify(f.default)}\`` : ''
        lines.push(`| \`${key}\` | ${cell(type)} | ${cell(def)} | ${cell(f.hint || '')} |`)
      }
      lines.push('')
    }

    lines.push(
      '### Entry skeleton',
      '',
      'Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:',
      'the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for',
      'this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).',
      '',
      '```yaml',
      entryYaml(entry.url, info, { width: 'full', height: 'tall' }),
      '```',
      ''
    )
  }
  lines.push(END)
  return lines.join('\n')
}

function stub(entry, info) {
  return `# ${info.name || entry.file}

${generated(entry, info)}

## Notes

TODO: what it is for, which config keys it actually reads (and how role configs fall back to \`config\`),
station requirements, a working example from a real lab, and pitfalls.
`
}

await mkdir(catalogDir, { recursive: true })
let failed = 0
for (const entry of modules) {
  if (only.length && !only.includes(entry.file)) continue
  const file = path.join(catalogDir, `${entry.file}.md`)
  let info
  try {
    info = await getModuleInfo(entry.url)
  } catch (e) {
    console.error(`FAIL ${entry.file}: ${e.message}`)
    failed++
    continue
  }
  let text
  try {
    const old = await readFile(file, 'utf8')
    const a = old.indexOf(START)
    const b = old.indexOf(END)
    if (a < 0 || b < a) throw new Error(`${file} has no GENERATED markers; not touching it`)
    text = old.slice(0, a) + generated(entry, info) + old.slice(b + END.length)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(`FAIL ${entry.file}: ${e.message}`)
      failed++
      continue
    }
    text = stub(entry, info)
  }
  await writeFile(file, text)
  console.log(`ok   ${entry.file}${info.schema ? '' : info.schemaError ? ' (schema does not parse)' : ' (no schema)'}`)
}
process.exit(failed ? 1 : 0)
