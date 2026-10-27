#!/usr/bin/env node
// Checks an edrys-Lite lab (classroom configuration) before it is shared.
//
//   node scripts/validate-lab.mjs <lab.yaml|lab.json|URL> [--offline]
//
// Errors break the lab (or part of it); warnings are things to clean up.
// Without --offline every module is fetched and its config is checked
// against the module's module-config schema.
// Exit code: 0 = no errors, 1 = errors, 2 = usage / file not readable.

import { CONFIG_TYPES, checkValue, getModuleInfo, loadText, parse } from './lib/module.mjs'

const args = process.argv.slice(2)
const source = args.find((a) => !a.startsWith('--'))
const offline = args.includes('--offline')
if (!source) {
  console.error('usage: node scripts/validate-lab.mjs <lab.yaml|lab.json|URL> [--offline]')
  process.exit(2)
}

const errors = []
const warnings = []
const error = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

let text
try {
  text = await loadText(source)
} catch (e) {
  console.error(`could not read ${source}: ${e.message}`)
  process.exit(2)
}

if (/^\s*<(!doctype|html)/i.test(text)) {
  console.error(`${source} is an HTML page, not a classroom file. Use the raw URL (raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>), not a github.com/.../blob/... page`)
  process.exit(1)
}

let lab
try {
  lab = parse(text)
} catch (e) {
  console.error(`${source} is neither JSON nor YAML: ${e.message.split('\n')[0]}`)
  process.exit(1)
}
if (!lab || typeof lab !== 'object' || Array.isArray(lab)) {
  console.error(`${source} is not a classroom: edrys-Lite expects a map with name, meta and modules (an HTML page here usually means a non-raw URL)`)
  process.exit(1)
}

// --- top level ---------------------------------------------------------------

if (!lab.name) warn('name', 'missing: the classroom shows an empty title')
for (const key of ['id', 'createdBy']) {
  if (key in lab) warn(key, 'remove it: deploy replaces it')
}
for (const key of ['setupSigner', 'setupSignature']) {
  if (key in lab) warn(key, "remove it: it belongs to one classroom's signature")
}
const known = ['name', 'meta', 'members', 'modules', 'dateCreated', 'communicationConfig', 'keepUrlConfig', 'id', 'createdBy', 'setupSigner', 'setupSignature']
for (const key of Object.keys(lab)) {
  if (!known.includes(key)) warn(key, 'unknown top-level key; edrys-Lite ignores it')
}

// --- meta --------------------------------------------------------------------

const meta = lab.meta ?? {}
let rooms = 0
if (lab.meta === undefined) {
  warn('meta', 'missing: no description or logo on the classroom card')
} else if (typeof meta !== 'object' || Array.isArray(meta)) {
  error('meta', 'must be a map')
} else {
  if (!meta.description) warn('meta.description', 'missing: the classroom card has no description')
  if (meta.logo && !/^https?:\/\//.test(meta.logo)) warn('meta.logo', 'should be an absolute http(s) URL')
  if ('defaultNumberOfRooms' in meta) {
    rooms = Number(meta.defaultNumberOfRooms)
    if (!Number.isInteger(rooms) || rooms < 0) error('meta.defaultNumberOfRooms', `must be a whole number >= 0, got ${JSON.stringify(meta.defaultNumberOfRooms)}`)
    else if (rooms > 50) warn('meta.defaultNumberOfRooms', `${rooms} is more than the maximum of 50 rooms; only 50 are created`)
  }
  if ('selfAssign' in meta) warn('meta.selfAssign', 'remove it: not implemented, nothing reads it')
  if ('id' in meta) warn('meta.id', 'remove it: nothing reads it')
}

// --- members -----------------------------------------------------------------

if (lab.members !== undefined) {
  for (const role of ['teacher', 'student']) {
    const list = lab.members?.[role]
    if (Array.isArray(list) && list.length) warn(`members.${role}`, 'empty it: peer IDs only mean something in the browser they came from')
  }
}

// --- folded scalars (checked on the raw text, the parsed value hides them) ---

if (!/^\s*[{[]/.test(text)) {
  text.split('\n').forEach((line, i) => {
    const m = /^\s*(-\s+)?([\w-]+):\s*>[-+]?\s*$/.exec(line)
    if (m && !['name', 'description', 'logo'].includes(m[2])) warn(`line ${i + 1}`, `"${m[2]}: >" folds lines, which breaks Markdown lists and code; use "|" instead`)
  })
}

// --- modules -----------------------------------------------------------------

const WIDTHS = ['full', 'half', 'third']
const HEIGHTS = ['huge', 'tall', 'medium', 'short']
const FLAGS = ['teacher-only', 'station-only']

// edrys-Lite's heights (Modules.vue); a module never grows with its content
const HEIGHT_PX = { huge: 830, tall: 720, medium: 410, short: 200 }
// a rendered Markdown line, blank ones included, and the frame's padding: a rough
// estimate, so only text clearly too long for its module is reported
const LINE_PX = 24
const PADDING_PX = 40

// Markdown-IT shows config.content, then the content of the viewer's own role config.
function textFit(m) {
  if (!/\/module-markdown-it\//.test(m.url)) return
  const height = typeof m.height === 'number' ? m.height : HEIGHT_PX[m.height] ?? 200
  const lines = (config) => (typeof config?.content === 'string' ? config.content.trimEnd().split('\n').length : 0)
  const shared = lines(m.config)
  const [role, count] = [['everyone', shared], ...['studentConfig', 'teacherConfig', 'stationConfig'].map((r) => [r, shared + lines(m[r])])]
    .reduce((a, b) => (b[1] > a[1] ? b : a))
  const needed = count * LINE_PX + PADDING_PX
  if (needed <= height) return
  const fits = Object.entries(HEIGHT_PX).filter(([, px]) => px >= needed).map(([name]) => name).reverse()[0]
  return `about ${count} lines of text (${role === 'everyone' ? 'config' : `config + ${role}`}) need ~${needed}px, the module is ${height}px and does not grow; the rest scrolls inside it. Use ${fits ? `height: ${fits}` : 'a larger number, or split the text'}`
}

function checkShowIn(where, value) {
  if (Array.isArray(value)) {
    error(where, 'must be a comma-separated string, not a list (edrys-Lite cannot read a list here)')
    return
  }
  if (typeof value !== 'string') {
    error(where, `must be a string, got ${JSON.stringify(value)}`)
    return
  }
  const entries = value.split(',').map((e) => e.trim()).filter(Boolean)
  if (!entries.length) return
  const flags = entries.filter((e) => FLAGS.includes(e))
  const roomEntries = entries.filter((e) => !FLAGS.includes(e))
  for (const e of roomEntries) {
    if (FLAGS.includes(e.toLowerCase())) error(where, `"${e}" must be lowercase to work as a flag; as written it is a room name and the module is shown to everyone`)
  }
  if (flags.length && !roomEntries.some((e) => !FLAGS.includes(e.toLowerCase()))) {
    error(where, `"${flags.join(', ')}" without a room entry matches no room; the module is never shown (add e.g. "station" or "*")`)
  }
  if (flags.length === 2) warn(where, 'both flags given: only teacher-only takes effect')
  for (const e of roomEntries) {
    const m = /^room\s+(\d+)$/i.exec(e)
    if (m && Number(m[1]) > rooms) warn(where, `"${e}" does not exist unless the teacher adds it (meta.defaultNumberOfRooms is ${rooms})`)
  }
}

if (!Array.isArray(lab.modules)) {
  error('modules', lab.modules === undefined ? 'missing: the classroom is empty' : 'must be a list')
} else {
  if (!lab.modules.length) warn('modules', 'empty: the classroom has no modules')

  const infos = new Map()
  if (!offline) {
    const urls = [...new Set(lab.modules.map((m) => m?.url).filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)))]
    await Promise.all(
      urls.map(async (url) => {
        try {
          infos.set(url, await getModuleInfo(url))
        } catch (e) {
          infos.set(url, { loadError: e.message })
        }
      })
    )
  }

  lab.modules.forEach((m, i) => {
    const where = `modules[${i}]`
    if (!m || typeof m !== 'object' || Array.isArray(m)) {
      error(where, 'must be a map; edrys-Lite drops it')
      return
    }
    if (!m.url) {
      error(`${where}.url`, 'missing')
      return
    }
    if (!/^https?:\/\//.test(m.url)) error(`${where}.url`, `must be an absolute http(s) URL, got "${m.url}"`)
    const label = `${where} (${m.url.replace(/^https?:\/\//, '')})`

    if (m.showInCustom !== undefined && m.showInCustom !== '') checkShowIn(`${label}.showInCustom`, m.showInCustom)
    if (m.showIn !== undefined) {
      if (m.showInCustom) warn(`${label}.showIn`, 'remove it: showInCustom is set and wins')
      else warn(`${label}.showIn`, 'legacy key: rename it to showInCustom (comma-separated string)')
    }
    if (m.id !== undefined && typeof m.id !== 'string') warn(`${label}.id`, 'should be a string; leave it out and edrys-Lite generates one')

    if (m.width === undefined) warn(`${label}.width`, `missing: the module is 250px wide; set ${WIDTHS.join(', ')} or a number of pixels`)
    else if (!WIDTHS.includes(m.width) && typeof m.width !== 'number') {
      warn(`${label}.width`, `"${m.width}" is not ${WIDTHS.join(', ')} or a number of pixels; the module gets the smallest size`)
    }
    if (m.height === undefined) warn(`${label}.height`, `missing: the module is 200px high; set ${HEIGHTS.join(', ')} or a number of pixels`)
    else if (!HEIGHTS.includes(m.height) && typeof m.height !== 'number') {
      warn(`${label}.height`, `"${m.height}" is not ${HEIGHTS.join(', ')} or a number of pixels; the module gets the smallest size`)
    }
    const fit = textFit(m)
    if (fit) warn(`${label}.height`, fit)

    for (const type of CONFIG_TYPES) {
      const value = m[type]
      if (typeof value === 'string' && value.trim() !== '') {
        try {
          JSON.parse(value)
          warn(`${label}.${type}`, 'is a JSON string; write it as a YAML map instead')
        } catch {
          error(`${label}.${type}`, 'is a string that is not JSON; the module receives it as a plain string and ignores it. Write it as a YAML map')
        }
      }
    }

    const info = infos.get(m.url)
    if (!info) return
    if (info.loadError) {
      error(`${label}.url`, `could not be loaded: ${info.loadError}`)
      return
    }
    if (info.looksLikeModule === false) warn(`${label}.url`, 'the page does not load edrys.js; is this the module URL?')
    if (info.schemaError) {
      warn(label, `the module's module-config does not parse (${info.schemaError}); its config keys cannot be checked`)
      return
    }
    if (!info.schema) return

    for (const type of CONFIG_TYPES) {
      const value = m[type]
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const fields = info.schema[type]
      if (!fields) {
        warn(`${label}.${type}`, `the module declares no ${type} fields; check its README that it reads them`)
        continue
      }
      for (const [key, v] of Object.entries(value)) {
        if (!(key in fields)) {
          warn(`${label}.${type}.${key}`, `not in the module's form schema (${Object.keys(fields).join(', ')}): a typo, or a key the module reads without declaring it; check its README`)
          continue
        }
        for (const p of checkValue(fields[key], v)) (p.level === 'error' ? error : warn)(`${label}.${type}.${key}`, p.message)
      }
    }
  })
}

// --- report ------------------------------------------------------------------

for (const e of errors) console.log(`error    ${e}`)
for (const w of warnings) console.log(`warning  ${w}`)
const modules = Array.isArray(lab.modules) ? lab.modules.length : 0
console.log(`\n${source}: ${modules} module(s), ${errors.length} error(s), ${warnings.length} warning(s)${offline ? ' (offline: module configs not checked)' : ''}`)
process.exit(errors.length ? 1 : 0)
