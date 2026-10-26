# Testing a module

A module only shows its bugs with several peers: two browsers, a late joiner, a station, a reload. Test it in
three steps.

## 1. Check the declaration

```bash
npm install --prefix scripts           # once
node scripts/check-module.mjs path/to/module/index.html     # or the folder, a .yml, or the published URL
```

It reads the module the way edrys-Lite does and reports what makes it fail silently (no `<title>`, a
`module-config` the form can't read, a message without a body, `localStorage` in a YAML module, …). Fix the
errors; read the warnings.

## 2. Try it by hand

Serve the module folder with CORS (edrys-Lite fetches the module before loading it; `python -m http.server`
sends no CORS header, so the module shows as an error):

```bash
node scripts/serve.mjs path/to/module 8080
```

Then, at https://edrys-labs.github.io:

1. **Create a class**, open *Settings → Modules*, add `http://localhost:8080/` (or
   `http://localhost:8080/module.yml`), set its configs and *Show in*, save.
2. **A second peer:** open the class link in a private window or another browser. That is a student. Use a
   third window to test a late joiner.
3. **A station** (if the module uses one): open the station link (*Settings → Stations*, or
   `…/?/station/<class-id>/<owner>`) in another tab of the teacher's browser; enter its room as the student.
4. Add [module-reference](https://edrys-labs.github.io/module-reference/) to the same room: it lists every
   message (promiscuous) and the live room state, so you see what your module sends and stores.
5. Set `Edrys.debug = true` in the module frame's console (pick the iframe in the devtools' context menu) to log
   edrys.js traffic.

Chrome, Edge and Firefox allow `http://localhost` modules inside the HTTPS app. Other hosts need HTTPS: use
GitHub Pages, or run edrys-Lite locally (`git clone https://github.com/edrys-labs/edrys-Lite && cd edrys-Lite &&
npm install && npm run watch`, then http://localhost:6999).

After a change, reload the page in each peer's window (the server sends `no-store`, so the new file is used).

### What to try

- Every role (teacher, student, station) sees the right controls and texts, before anything happens too.
- An action on one peer shows up on the others.
- A peer that joins **later** sees the current state.
- **Reload** one peer, and switch rooms back and forth: the module starts clean and catches up.
- Each config field is applied; an **empty** or broken config shows a helpful message.
- Errors the user can hit (cancelled port dialog, server down, device unplugged) are shown, and the module
  recovers.
- Two entries of the module in one room, if a lab could do that.
- Light and dark mode; a small tile (250 × 200) and a large one.

## 3. Automate it: edrys-module-tests

[edrys-labs/edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests) runs modules in a real
edrys-Lite with real peers (teacher, station, students in separate browser contexts), using Playwright. It
serves modules from your checkout under a cross-origin test host, fakes hardware (Web Serial, cameras, terminal
servers, …) and swaps in the edrys.js of the edrys-Lite under test.

```bash
git clone https://github.com/edrys-labs/edrys-Lite && (cd edrys-Lite && npm install && npm run watch)   # keep running
git clone https://github.com/edrys-labs/edrys-module-tests && cd edrys-module-tests
npm install && npx playwright install chromium
EDRYS_MODULES=/path/to/folder/containing/your/module npx playwright test modules/<your-module>
```

Its README is the contract: setup, `lib/` helpers, and `modules/module-serial/serial.spec.ts` as the complete
example. A spec looks like this:

```ts
import { expect, test } from '@playwright/test'
import { closeSessions, closeSideMenu, createClass, joinClass, setModules } from '../../lib/edrys'
import { moduleFrame, moduleUrl, revealModuleTop, serveModules } from '../../lib/modules'

const MODULE = 'module-wave'   // folder name under EDRYS_MODULES

test('a wave reaches the teacher', async ({ browser }) => {
  const { teacher, classUrl } = await createClass(browser, serveModules)
  await closeSideMenu(teacher)
  await setModules(teacher, [{ url: moduleUrl(MODULE), config: { greeting: 'Hi' } }])
  const student = await joinClass(browser, classUrl, serveModules)
  await closeSideMenu(student)

  const s = await moduleFrame(student, MODULE)
  await expect(s.locator('#greeting')).toHaveText('Hi', { timeout: 20_000 })   // rendered after onReady
  await revealModuleTop(s)
  await s.locator('#wave').click()

  const t = await moduleFrame(teacher, MODULE)
  await expect(t.locator('#waves li')).toHaveCount(1, { timeout: 20_000 })
  await closeSessions(teacher, student)
})
```

Lessons from writing these tests:

- Run against a **local** edrys-Lite (the default, `http://localhost:6999`). The test host is plain HTTP, so the
  published HTTPS app blocks it as mixed content and the module stays blank.
- Call `closeSideMenu(session)` for every peer that stays in the Lobby, and `revealModuleTop(frame)` before
  clicking the module's top row. Otherwise the side menu's overlay or the app bar takes the click, and the test
  fails as if the module ignored it. `enterRoom` already closes the menu.
- Wait for something the module renders after `onReady` before interacting. Use `expect(…)`/`expect.poll` with
  a timeout for anything that crosses peers; never fixed sleeps.
- YAML and `fetch` modules run on a `data:` URL: find their frame with `moduleFrame(s, name, timeout, inline)`,
  where `inline` is a string from the module's source.
- State that isn't on screen (a canvas, an editor model) can be exposed on `window` for the tests, with a
  comment saying so.
- Check for flakiness: `npx playwright test modules/<name> --repeat-each=3`.
- Real hardware isn't covered: say what you could not test (the real board, port, camera).
