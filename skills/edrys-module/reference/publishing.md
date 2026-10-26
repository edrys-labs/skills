# Publishing a module

A module is published when it has a stable HTTPS URL that edrys-Lite can fetch (CORS) and load in an iframe.
Lab authors then add that URL to their labs; the edrys-lab skill's catalog lists the maintained ones.

## Where to host

| Module | Host | URL |
|--------|------|-----|
| HTML (plain files) | GitHub Pages, branch `main`, folder `/` | `https://<owner>.github.io/<repo>/` |
| HTML (built) | GitHub Pages from a workflow, or a committed `docs/` folder | `https://<owner>.github.io/<repo>/` |
| YAML | anything that serves text with CORS: GitHub Pages, `raw.githubusercontent.com`, a gist | `https://<owner>.github.io/<repo>/module.yml` |

- GitHub Pages and `raw.githubusercontent.com` send `Access-Control-Allow-Origin: *`.
- An HTML module needs a real web host: `raw.githubusercontent.com` serves it as `text/plain`, so the iframe
  shows the source. (YAML and `fetch` modules are fetched as text, so a raw URL works for them.)
- Any other host must send CORS headers and serve over HTTPS.
- The URL is the module's identity: messages between entries are matched by URL. Changing it (moving the repo,
  `/` vs `/index.html`) breaks labs that use the old one; keep it stable.

Check the published URL before announcing it: `node scripts/check-module.mjs https://<owner>.github.io/<repo>/`.

## Repository

```
module-<name>/
  index.html        # or module.yml; for built modules: src/ plus the build output
  style.css, script.js
  README.md
  LICENSE           # MIT, as the edrys-labs modules
  screenshot.png
  .gitignore        # node_modules/, build caches
```

- Name it `module-<name>`, and add the GitHub topic **`edrys-module`** so it is found with the others
  ([topic page](https://github.com/topics/edrys-module)).
- Releases: lab authors can't pin a version of a Pages URL. Keep changes backwards compatible: new config
  fields with defaults, old subjects and state keys still understood. Breaking changes get a new URL (a new
  repo or a `v2/` folder).

### README

```markdown
# <Module name>

One paragraph: what it does, for which role.

![Screenshot](screenshot.png)

## Usage

    https://<owner>.github.io/module-<name>/

Shown in: `station` (default). Station browser: Chrome, Edge or Firefox 151+ (Web Serial).

## Configuration

| Config | Field | Type | Default | Meaning |
|--------|-------|------|---------|---------|
| `stationConfig` | `baud` | combobox | `9600` | Baud rate of the device |

Example lab entry:

    - url: https://<owner>.github.io/module-<name>/
      stationConfig:
        baud: 115200
      showInCustom: station

## Messages and state

| Kind | Name | Direction | Body |
|------|------|-----------|------|
| message | `serial-bridge.input` | room → station | a line of text |
| state | `serial-bridge.status` | written by the station | `"on"`, `"off"`, `"wait"` |

## Development

How to run it locally and test it.

## License

[MIT](LICENSE) © <owner>
```

Document every config field (with an example lab entry), every message subject other modules may use, and
every state key. Say plainly what isn't secret (configs, state) and which browsers the station needs.

## Built modules

Bundlers are fine (Parcel and Vite are used by the edrys-labs modules). Things to get right:

- **Relative asset URLs.** The module lives under `/<repo>/`, not at the domain root: Parcel
  `--public-url ./`, Vite `base: './'`.
- **edrys.js from its URL**, in a plain `<script>` tag before the bundle, not as an npm import.
- **One Yjs.** edrys.js brings Yjs and sets `window.Y`; bundled Yjs bindings must use it. Alias `yjs` to a
  file that exports the global:

  ```js
  // src/yjs-global.js
  module.exports = window.Y
  ```

  ```json
  // package.json (Parcel)
  "alias": { "yjs": "./src/yjs-global.js" }
  ```

  This is how module-monaco-editor and module-quill do it. With another bundler, alias `yjs` the same way and
  check in the browser that `Y.Text` from the binding is `window.Y.Text`.
- **Deploy.** Either commit the build output (`docs/`, Pages from `main` `/docs`) and rebuild before every push,
  or build in CI:

  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy to GitHub Pages
  on:
    push:
      branches: [main]
    workflow_dispatch:
  permissions: { contents: read, pages: write, id-token: write }
  concurrency: { group: pages, cancel-in-progress: true }
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 24, cache: npm }
        - run: npm ci
        - run: npm run build
        - uses: actions/upload-pages-artifact@v3
          with: { path: dist }
    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
      steps:
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

  Set *Settings → Pages → Source* to *GitHub Actions*.
- Pin dependency versions (lockfile committed); pin CDN URLs to exact versions (`lib@1.2.3`).

## Station software

If the module needs a program on the station computer (a terminal server, a hardware bridge), ship it in the
same repository with a Dockerfile and publish the image (e.g. to Docker Hub via a workflow). The README gives the
exact `docker run` line, with the device and port mapping (`-p 127.0.0.1:5000:5000`, `--device /dev/ttyACM0`),
and the origins it accepts. The edrys-lab skill's station guide shows how lab authors use such servers.
