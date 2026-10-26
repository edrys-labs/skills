#!/usr/bin/env node
// Maintainer tool (not installed with the skills): checks every skills/*/SKILL.md
// against the frontmatter rules claude.ai enforces on upload.
//
//   npm install --prefix skills/edrys-lab/scripts
//   node tools/check-skills.mjs
//
// Exits 1 if any skill breaks a rule. Runs in CI before a release is built.

import { readdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const yaml = createRequire(path.join(root, 'skills/edrys-lab/scripts/package.json'))('js-yaml')

let errors = 0
const error = (skill, msg) => {
  errors++
  console.log(`${skill}: ${msg}`)
}

const dirs = (await readdir(path.join(root, 'skills'), { withFileTypes: true })).filter((d) => d.isDirectory())
for (const { name: dir } of dirs) {
  const before = errors
  let text
  try {
    text = await readFile(path.join(root, 'skills', dir, 'SKILL.md'), 'utf8')
  } catch {
    error(dir, 'no SKILL.md')
    continue
  }
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) {
    error(dir, 'SKILL.md does not start with a --- frontmatter block')
    continue
  }
  const fm = yaml.load(match[1]) ?? {}
  const { name, description, license } = fm

  if (name !== dir) error(dir, `name "${name}" does not match the folder`)
  if (typeof name === 'string' && !/^[a-z0-9-]{1,64}$/.test(name)) error(dir, 'name: 1-64 lowercase letters, digits, hyphens')
  if (typeof name === 'string' && !name.startsWith('edrys-')) error(dir, 'name must start with edrys-')
  if (typeof description !== 'string' || !description.trim()) error(dir, 'no description')
  else {
    if (description.length > 1024) error(dir, `description is ${description.length} characters (max 1024)`)
    if (/[<>]/.test(description)) error(dir, 'description contains < or > (claude.ai reads it as an XML tag)')
  }
  if (!license) error(dir, 'no license')
  if (errors === before) console.log(`${dir}: ok (description ${description.length} characters)`)
}

process.exit(errors ? 1 : 0)
