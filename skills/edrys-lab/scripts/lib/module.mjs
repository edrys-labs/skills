// Loads an edrys-Lite module and reads its declaration the way edrys-Lite does
// (scrapeModule in src/ts/Utils.ts, parse in the same file).

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'js-yaml'

export { YAML }

export const CONFIG_TYPES = ['config', 'studentConfig', 'teacherConfig', 'stationConfig']

// Same as edrys-Lite's parse(): JSON first, YAML otherwise. YAML also accepts
// the single quotes and trailing commas most module-config tags use.
export function parse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return YAML.load(text)
  }
}

const isUrl = (s) => /^https?:\/\//i.test(s)

/** Text of a module URL or local path (a directory means its index.html). */
export async function loadText(source) {
  if (isUrl(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${source}`)
    return response.text()
  }
  let file = source
  if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
  return readFile(file, 'utf8')
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return String.fromCodePoint(code)
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

// Attributes of every <meta> tag. Quote-aware, because module-config values
// may contain '>' inside hints.
function metaTags(html) {
  const tags = []
  const re = /<meta\b/gi
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
      attrs[attr[1].toLowerCase()] = decodeEntities(attr[3] ?? attr[4] ?? attr[5] ?? '')
      i += attr[0].length
    }
    tags.push(attrs)
    re.lastIndex = i
  }
  return tags
}

function titleOf(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  return m ? decodeEntities(m[1]).trim() : ''
}

/**
 * Declaration of a module: name, description, showIn, kind and the parsed
 * module-config schema. `schemaError` is set when the schema does not parse,
 * in which case edrys-Lite shows no form either.
 */
export async function getModuleInfo(source) {
  const text = await loadText(source)
  const info = { source, kind: 'html', name: '', description: '', icon: '', showIn: ['*'], schema: null, schemaError: null, rawSchema: '' }

  if (/\.ya?ml$/i.test(source.replace(/[?#].*$/, ''))) {
    const yaml = YAML.load(text) || {}
    info.kind = 'yaml'
    info.name = yaml.name || ''
    info.description = yaml.description || ''
    info.icon = yaml.icon || ''
    info.showIn = yaml['show-in'] || ['*']
    info.rawSchema = yaml['module-config'] || ''
  } else {
    const meta = {}
    for (const tag of metaTags(text)) if (tag.name) meta[tag.name] = tag.content ?? ''
    if (meta.fetch && meta.fetch !== 'false') info.kind = 'inlined'
    info.name = titleOf(text) || meta.name || ''
    info.description = meta.description || ''
    info.icon = meta.icon || ''
    info.showIn = (meta['show-in'] || '*').replace(/\s+/g, '').split(',')
    info.rawSchema = meta['module-config'] || ''
    info.looksLikeModule = /edrys\.js/i.test(text)
  }

  if (typeof info.rawSchema === 'object' && info.rawSchema) {
    info.schema = info.rawSchema
  } else if (info.rawSchema.trim()) {
    try {
      info.schema = parse(info.rawSchema)
    } catch (e) {
      info.schemaError = e.message.split('\n')[0]
    }
  }
  return info
}

/** The value the settings form starts with for a field (ModuleConfigForm.vue). */
export function defaultValue(field) {
  if (field.default !== undefined) return field.default
  switch (field.type) {
    case 'boolean':
      return false
    case 'checkboxes':
      return Object.fromEntries((field.options || []).map((o) => [o, false]))
    case 'number':
      return 0
    case 'radio-button':
      return field.options?.[0] ?? ''
    case 'color':
      return '#000000'
    default:
      return ''
  }
}

/**
 * A lab entry (YAML text) for a module. Only fields with an explicit schema
 * default are set; the others are listed as comments, because a module may
 * treat a missing key differently from the form's empty value (e.g. a boolean
 * that is on unless set to false).
 */
export function entryYaml(url, info, extra = {}) {
  const flow = (v) => YAML.dump(v, { flowLevel: 0, lineWidth: -1 }).trim()
  const lines = [`- url: ${url}`]
  for (const type of CONFIG_TYPES) {
    const fields = info.schema?.[type]
    if (!fields) continue
    lines.push(`  ${type}:`)
    for (const [key, f] of Object.entries(fields)) {
      let kind = f.type || 'string'
      if (f.options) kind += `: ${f.options.join(' | ')}`
      if (f.default !== undefined) lines.push(`    ${key}: ${flow(f.default)}`)
      else lines.push(`    # ${key}: ${flow(defaultValue(f))}  # ${kind}`)
    }
  }
  lines.push(`  showInCustom: ${flow(info.showIn.join(', '))}`)
  for (const [k, v] of Object.entries(extra)) lines.push(`  ${k}: ${flow(v)}`)
  return lines.join('\n')
}

const KNOWN_TYPES = ['boolean', 'checkboxes', 'radio-button', 'select', 'combobox', 'number', 'text-area', 'date', 'color', 'code-area', 'string']

/**
 * Problems with one config value against its schema field; empty if fine.
 * Each problem is { level: 'error' | 'warning', message }.
 */
export function checkValue(field, value) {
  return checkValueMessages(field, value).map((message) =>
    typeof message === 'string' ? { level: 'error', message } : message
  )
}

function checkValueMessages(field, value) {
  const type = field.type || 'string'
  const problems = []
  if (value === undefined || value === null || value === '') return problems
  if (!KNOWN_TYPES.includes(type)) return problems
  const options = field.options || []
  switch (type) {
    case 'boolean':
      if (typeof value !== 'boolean') problems.push(`must be true or false, got ${JSON.stringify(value)}`)
      break
    case 'number':
      if (typeof value !== 'number') problems.push(`must be a number, got ${JSON.stringify(value)}`)
      break
    case 'checkboxes':
      if (typeof value !== 'object' || Array.isArray(value)) {
        problems.push(`must be a map of option: true/false (${options.join(', ')}), got ${JSON.stringify(value)}`)
      } else {
        for (const key of Object.keys(value)) {
          if (!options.includes(key)) problems.push(`unknown option "${key}" (options: ${options.join(', ')})`)
        }
      }
      break
    case 'radio-button':
    case 'select':
      if (options.length && !options.includes(value)) problems.push(`"${value}" is not one of: ${options.join(', ')}`)
      break
    case 'date':
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) problems.push(`must be a date "YYYY-MM-DD", got ${JSON.stringify(value)}`)
      break
    case 'color':
      if (typeof value !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(value)) problems.push(`must be a hex color like "#1e88e5", got ${JSON.stringify(value)}`)
      break
    default:
      // Some modules parse a map here themselves (module-survey), others call
      // JSON.parse on the text and break (module-hardware-control).
      if (typeof value === 'object') {
        problems.push({
          level: 'warning',
          message: `the form expects text here, got ${Array.isArray(value) ? 'a list' : 'a map'}. Works only if the module accepts it (see its catalog notes); otherwise write it as a JSON string`,
        })
      }
  }
  return problems
}
