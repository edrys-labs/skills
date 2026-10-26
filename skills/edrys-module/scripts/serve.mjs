#!/usr/bin/env node
// Serves a module folder for development, the way edrys-Lite needs it: with
// CORS (edrys-Lite fetches the module before it loads it) and without caching
// (a reload shows the latest file).
//
//   node scripts/serve.mjs <folder> [port]      (default port 8080)
//
// Then add http://localhost:<port>/ (or /module.yml for a YAML module) to a
// class at https://edrys-labs.github.io. No dependencies.

import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

const [folder, portArg] = process.argv.slice(2)
if (!folder) {
  console.error('usage: node scripts/serve.mjs <folder> [port]')
  process.exit(2)
}
const root = path.resolve(folder)
const port = Number(portArg) || 8080

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.writeHead(204).end()
    return
  }

  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  let file = path.join(root, path.normalize(urlPath))
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403).end('forbidden')
    return
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
    await stat(file)
  } catch {
    res.writeHead(404).end('not found')
    console.log(`404 ${urlPath}`)
    return
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}/`)
  console.log('Add that URL (or the .yml file in it) as a module in a class at https://edrys-labs.github.io')
})
