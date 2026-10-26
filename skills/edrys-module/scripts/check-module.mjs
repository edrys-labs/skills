#!/usr/bin/env node
// Checks a module the way edrys-Lite reads it (scrapeModule in src/ts/Utils.ts,
// ModuleConfigForm.vue), plus common mistakes in its code that fail silently.
//
//   node scripts/check-module.mjs <index.html | folder | module.yml | URL>
//
// Exit code 1 if there are errors. Warnings are things to look at, not
// necessarily wrong. Needs `npm install --prefix scripts` once (js-yaml).

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'js-yaml'

const CONFIG_TYPES = ['config', 'studentConfig', 'teacherConfig', 'stationConfig']
const FIELD_TYPES = ['boolean', 'checkboxes', 'radio-button', 'select', 'combobox', 'number', 'text-area', 'code-area', 'date', 'color', 'string']
const NEEDS_OPTIONS = ['checkboxes', 'radio-button', 'select']
const EDRYS_JS = 'https://edrys-labs.github.io/module/edrys.js'

const source = process.argv[2]
if (!source) {
  console.error('usage: node scripts/check-module.mjs <index.html | folder | module.yml | URL>')
  process.exit(2)
}

const problems = []
const error = (message) => problems.push({ level: 'error', message })
const warn = (message) => problems.push({ level: 'warning', message })

const isUrl = (s) => /^https?:\/\//i.test(s)

async function load(src) {
  if (isUrl(src)) {
    const response = await fetch(src)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!response.headers.get('access-control-allow-origin')) {
      warn('the server sends no Access-Control-Allow-Origin header: edrys-Lite cannot fetch the module from another origin')
    }
    return { text: await response.text(), file: src }
  }
  let file = src
  if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
  return { text: await readFile(file, 'utf8'), file }
}

// Like edrys-Lite: JSON first, then YAML (which accepts single quotes).
function parseSchema(text) {
  try {
    return JSON.parse(text)
  } catch {
    return YAML.load(text)
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITIES[e.toLowerCase()] ?? m)
  )

// Attributes of each tag `name`, quote-aware (hints may contain '>').
function tags(html, name) {
  const found = []
  const re = new RegExp(`<${name}\\b`, 'gi')
  let match
  while ((match = re.exec(html))) {
    const attrs = {}
    let i = match.index + match[0].length
    while (i < html.length && html[i] !== '>') {
      const attr = /^\s*([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/.exec(html.slice(i))
      if (!attr || attr[0].length === 0) {
        i++
        continue
      }
      attrs[attr[1].toLowerCase()] = decode(attr[3] ?? attr[4] ?? attr[5] ?? '')
      i += attr[0].length
    }
    found.push(attrs)
    re.lastIndex = i
  }
  return found
}

// ---------------------------------------------------------------------------

let loaded
try {
  loaded = await load(source)
} catch (e) {
  console.error(`could not load ${source}: ${e.message}`)
  process.exit(1)
}

const isYaml = /\.ya?ml$/i.test(loaded.file.replace(/[?#].*$/, ''))
let name = ''
let description = ''
let showIn = ['*']
let rawSchema = ''
let scripts = []
let links = []
let code = ''
let inlined = isYaml

if (isYaml) {
  let yaml
  try {
    yaml = YAML.load(loaded.text) || {}
  } catch (e) {
    error(`the YAML does not parse: ${e.message.split('\n')[0]}`)
    yaml = {}
  }
  name = yaml.name || ''
  description = yaml.description || ''
  showIn = yaml['show-in'] || ['*']
  if (!Array.isArray(showIn)) {
    error(`show-in must be a YAML list in a YAML module (show-in: ['*']); a string fails to load ("Could not load the YAML-declaration")`)
    showIn = String(showIn).split(',')
  }
  rawSchema = yaml['module-config'] ?? ''
  if (rawSchema && typeof rawSchema === 'object') {
    error('module-config is a YAML map: the settings form only reads a string. Write `module-config: |` and indent the schema under it')
    rawSchema = YAML.dump(rawSchema)
  }
  scripts = yaml.load?.scripts || []
  links = yaml.load?.links || []
  code = String(yaml.main || '') + '\n' + String(yaml.body || '')
  if (!yaml.main) warn('no `main`: the module has no script')
  for (const url of [...scripts, ...links]) {
    if (!/^https?:\/\//i.test(url)) warn(`load: "${url}" is relative; it is fetched and injected asynchronously, after main has run. Use an absolute https:// URL`)
  }
} else {
  const html = loaded.text
  const meta = {}
  for (const tag of tags(html, 'meta')) if (tag.name) meta[tag.name] = tag.content ?? ''
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  if (title) name = decode(title[1]).trim()
  else error('no <title>: edrys-Lite fails to read the module ("<Error: exception scraping module>")')
  description = meta.description || ''
  showIn = (meta['show-in'] || '*').replace(/\s+/g, ' ').split(',').map((s) => s.trim())
  rawSchema = meta['module-config'] || ''
  inlined = !!meta.fetch && meta.fetch !== 'false'
  scripts = tags(html, 'script').map((t) => t.src).filter(Boolean)
  links = tags(html, 'link').filter((t) => /stylesheet/i.test(t.rel || '')).map((t) => t.href).filter(Boolean)
  code = html

  // Read local scripts too, for the code checks
  if (!isUrl(loaded.file)) {
    for (const src of scripts) {
      if (/^(https?:)?\/\//i.test(src)) continue
      try {
        code += '\n' + (await readFile(path.join(path.dirname(loaded.file), src.replace(/[?#].*$/, '')), 'utf8'))
      } catch {
        warn(`script "${src}" not found next to the page`)
      }
    }
  }
  if (inlined) {
    warn('<meta name="fetch"> inlines the page as a data: URL: relative assets outside <head> break, and localStorage is unavailable. Remove it unless you need it')
  }
}

// ---- declaration ----

if (isYaml && !name) error('no `name`')
if (!description) warn('no description: the module list shows nothing about the module')
else if (!/https?:\/\//.test(description)) warn('the description links no repository')

const entries = showIn.map((s) => String(s).trim()).filter(Boolean)
const ROLE_FILTERS = ['teacher-only', 'station-only']
for (const entry of entries) {
  if (ROLE_FILTERS.includes(entry.toLowerCase()) && entry !== entry.toLowerCase()) {
    error(`show-in "${entry}": role filters are lowercase; "${entry}" is read as a room name`)
  }
}
const lowered = entries.map((e) => e.toLowerCase())
if (lowered.some((e) => ROLE_FILTERS.includes(e)) && !lowered.some((e) => !ROLE_FILTERS.includes(e))) {
  error(`show-in "${entries.join(', ')}": a role filter needs a room entry too, e.g. "*, teacher-only" or "station, station-only"`)
}

const edrysScripts = scripts.filter((s) => /edrys(\.min)?\.js/i.test(s))
if (!edrysScripts.length) {
  if (/\bEdrys\./.test(code)) warn(`edrys.js is not loaded by a <script>/load.scripts entry (fine if a bundle loads it). Load ${EDRYS_JS}`)
  else error(`edrys.js is not loaded: add <script src="${EDRYS_JS}"></script>`)
} else if (!edrysScripts.includes(EDRYS_JS)) {
  warn(`edrys.js is loaded from "${edrysScripts[0]}": a copy misses API fixes. Use ${EDRYS_JS}`)
}

// ---- module-config ----

let schema = null
if (typeof rawSchema === 'string' && rawSchema.trim()) {
  try {
    schema = parseSchema(rawSchema)
    if (!schema || typeof schema !== 'object') throw new Error('not a map')
  } catch (e) {
    error(`module-config does not parse, so no settings form is shown: ${e.message.split('\n')[0]}`)
    schema = null
  }
}

const declared = new Set()
if (schema) {
  for (const key of Object.keys(schema)) {
    if (!CONFIG_TYPES.includes(key)) warn(`module-config section "${key}" is ignored; sections are ${CONFIG_TYPES.join(', ')}`)
  }
  for (const section of CONFIG_TYPES) {
    const fields = schema[section]
    if (!fields) continue
    for (const [field, spec] of Object.entries(fields)) {
      const where = `${section}.${field}`
      declared.add(field)
      if (!spec || typeof spec !== 'object') {
        error(`${where}: must be a map like { type: 'string', hint: '…' }`)
        continue
      }
      const type = spec.type ?? 'string'
      // 'text' is common in published modules and renders like 'string'
      if (!FIELD_TYPES.includes(type) && type !== 'text') warn(`${where}: type "${type}" is unknown and shown as a text field (types: ${FIELD_TYPES.join(', ')})`)
      if (!spec.hint) warn(`${where}: no hint; it is the only help the lab author sees`)
      const options = spec.options
      if ((NEEDS_OPTIONS.includes(type) || type === 'combobox') && options !== undefined && !Array.isArray(options)) {
        error(`${where}: options must be a list`)
      } else if (NEEDS_OPTIONS.includes(type) && !(options || []).length) {
        error(`${where}: a ${type} needs options`)
      }
      if (spec.default !== undefined) checkDefault(where, type, spec)
      if (spec.presets !== undefined) checkPresets(where, section, type, spec, fields)
    }
  }
}

function checkDefault(where, type, spec) {
  const d = spec.default
  const bad = (what) => warn(`${where}: default ${JSON.stringify(d)} should be ${what}`)
  switch (type) {
    case 'boolean':
      if (typeof d !== 'boolean') bad('true or false')
      break
    case 'number':
      if (typeof d !== 'number') bad('a number')
      break
    case 'radio-button':
    case 'select':
      if (Array.isArray(spec.options) && !spec.options.includes(d)) bad(`one of ${spec.options.join(', ')}`)
      break
    case 'checkboxes':
      if (!d || typeof d !== 'object' || Array.isArray(d)) bad('a map option: true/false')
      break
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d))) bad('"YYYY-MM-DD"')
      break
    case 'color':
      if (!/^#[0-9a-f]{3,8}$/i.test(String(d))) bad('a hex colour like "#1e88e5"')
      break
    default:
      if (typeof d === 'object') bad('text (the form edits text here)')
  }
}

function checkPresets(where, section, type, spec, fields) {
  if (type !== 'select') {
    warn(`${where}: presets only work on a select field`)
    return
  }
  if (!spec.presets || typeof spec.presets !== 'object') {
    error(`${where}: presets must be a map option -> { field: value }`)
    return
  }
  for (const [option, preset] of Object.entries(spec.presets)) {
    if (Array.isArray(spec.options) && !spec.options.includes(option)) warn(`${where}: preset "${option}" is not one of the options`)
    for (const key of Object.keys(preset || {})) {
      if (!fields[key]) warn(`${where}: preset "${option}" sets "${key}", which is not a field of ${section}; it is ignored`)
    }
  }
}

// ---- code ----

// Without the module-config text, so declared names don't count as "used", and
// without comments (a `//` after ':' is part of a URL and stays)
const body = (typeof rawSchema === 'string' && rawSchema ? code.split(rawSchema).join('') : code)
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

for (const field of declared) {
  if (!new RegExp(`\\b${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(body)) {
    warn(`config field "${field}" is declared but appears nowhere in the page or its local scripts (ignore if bundled code reads it)`)
  }
}

if (/\bEdrys\.(liveClass|liveRoom|liveUser)\b[\w$.?\[\]'"]*\s*(=(?!=)|\+=|-=)/.test(body)) {
  error('the code assigns to Edrys.liveClass / liveRoom / liveUser: those are read-only snapshots, a write reaches nobody else. Use Edrys.getState')
}

for (const m of body.matchAll(/\bEdrys\.sendMessage\(\s*([^,()]*(\([^()]*\))?[^,()]*)\)/g)) {
  warn(`Edrys.sendMessage(${m[1].trim()}) has no body: a message without a body is dropped. Pass one, e.g. sendMessage(subject, true)`)
}

if (inlined) {
  // edrys-Lite builds the data: URL with escape(): '…' becomes '%u2026' and is shown literally
  const lines = loaded.text.split('\n')
  const bad = lines.map((line, i) => [i + 1, line.match(/[^\x00-\x7f]/)?.[0]]).filter(([, ch]) => ch)
  if (bad.length) {
    const where = bad.slice(0, 5).map(([n, ch]) => `line ${n} "${ch}"`).join(', ')
    error(`non-ASCII characters (${where}${bad.length > 5 ? ', …' : ''}) are garbled on the data: URL (e.g. "Loading%u2026"). Use HTML entities (&hellip;) or JS escapes (\\u2026)`)
  }
}

if (inlined && /\b(localStorage|sessionStorage|indexedDB|Edrys\.(setItem|getItem))\b/.test(body)) {
  error('the module runs on a data: URL (YAML or fetch) but uses localStorage / sessionStorage / indexedDB / Edrys.setItem, which throw there')
}

if (/\bonMessage\([\s\S]{0,400}?,\s*true\s*\)/.test(body) && !/\bsubject\b/.test(body)) {
  warn('a promiscuous onMessage(…, true) without any subject check: it receives every module\'s messages')
}

for (const url of [...scripts, ...links, ...body.matchAll(/https?:\/\/[^\s"'`)<>]+/g)].map((u) => (typeof u === 'string' ? u : u[0]))) {
  if (/@latest\b/.test(url)) warn(`unpinned dependency (@latest): ${url}`)
  else if (/^https?:\/\/(cdn\.jsdelivr\.net\/npm|unpkg\.com)\/(@[^/]+\/)?[^/@]+(\/|$)/.test(url)) warn(`dependency without a version: ${url}`)
}

// ---- report ----

const unique = [...new Map(problems.map((p) => [p.level + p.message, p])).values()]
console.log(`${name || '(no name)'}  ·  ${isYaml ? 'YAML module' : inlined ? 'inlined HTML module (fetch)' : 'HTML module'}  ·  show-in: ${entries.join(', ') || '*'}`)
if (schema) {
  for (const section of CONFIG_TYPES) {
    if (schema[section]) console.log(`  ${section}: ${Object.keys(schema[section]).join(', ')}`)
  }
} else {
  console.log('  no module-config')
}
const errors = unique.filter((p) => p.level === 'error')
const warnings = unique.filter((p) => p.level === 'warning')
for (const p of errors) console.log(`error: ${p.message}`)
for (const p of warnings) console.log(`warning: ${p.message}`)
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
