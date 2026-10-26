---
name: edrys-module
description: >
  Use when writing, extending, reviewing or debugging an edrys-Lite module, a web page (HTML or one YAML
  file) loaded in an iframe of a classroom at https://edrys-labs.github.io: the edrys.js API (onReady,
  sendMessage, onMessage, getState, Awareness, sendStream), <meta> declarations (show-in, module-config
  settings form), per-role configs, station modules that talk to hardware (Web Serial, camera, a local
  server), shared Yjs state, a consistent look, tests with edrys-module-tests, publishing on GitHub Pages.
  Example requests: "write an Edrys module that shows a sensor from the station", "why doesn't my module
  receive messages", "my module's settings form is empty". German - Modul für Edrys schreiben,
  Edrys-Modul entwickeln, Station-Modul für Hardware. For building a lab from existing modules, use the
  edrys-lab skill.
license: CC0-1.0
---

# edrys-Lite modules

A module is a web page that edrys-Lite loads in an iframe, once per peer, and configures per lab entry. It
talks to the classroom through `edrys.js`: messages to the room, shared Yjs state per room, streams. There is
no server; every peer runs the module's code. Checked against edrys-Lite 3.1.0.

| Topic | File |
|-------|------|
| `Edrys.*`: lifecycle, properties, configs, messages, state, streams | [reference/api.md](reference/api.md) |
| `<meta>` tags, YAML modules, `fetch`, the `module-config` form schema | [reference/declaration.md](reference/declaration.md) |
| Choosing messages vs state vs awareness vs streams; patterns and pitfalls | [reference/state-messaging-streams.md](reference/state-messaging-streams.md) |
| Roles, station modules, hardware and local servers | [reference/roles-and-stations.md](reference/roles-and-stations.md) |
| The shared look (water.css, header row, states) | [reference/design-baseline.md](reference/design-baseline.md) |
| Review checklist | [reference/checklist.md](reference/checklist.md) |
| Dev loop, manual tests, edrys-module-tests | [reference/testing.md](reference/testing.md) |
| Hosting, README, built modules, station software | [reference/publishing.md](reference/publishing.md) |
| Tested example modules | [examples/](examples/) |

## Workflow

1. **Gather.** Ask only what the request leaves open:
   - who uses it: everyone, teachers only, or a station next to hardware (decides `show-in` and the roles);
   - what is shared: a document or result late joiners must see (state), events or output (messages), video
     (stream), nothing;
   - what the lab author configures (the `module-config` fields, per role);
   - hardware or a program at the station, and which browser it runs in;
   - plain files (default), a YAML module (small, one script), or a build (big libraries).
2. **Check it is needed.** If an existing module does the job (the edrys-lab skill's catalog), configure that
   instead. Embedding an existing web tool in the iframe module may be enough.
3. **Start from the closest example** (below), not a blank file. Keep its skeleton: `<title>`, meta tags,
   edrys.js from `https://edrys-labs.github.io/module/edrys.js`, water.css, `[hidden]` rule, loading state,
   init in `Edrys.onReady`.
4. **Design the contract first**: config fields with defaults and hints, message subjects (prefixed, as
   constants), state keys (prefixed), who writes what. Use [state-messaging-streams.md](reference/state-messaging-streams.md)
   to choose.
5. **Write it.** Read the current state in `onReady`, then observe; initialise state only if missing; check the
   sender's role where a command must come from a teacher or the station; render peer content with
   `textContent`.
6. **Check.** `node scripts/check-module.mjs <file>` (run `npm install --prefix scripts` once; Node 18+). Then go
   through [checklist.md](reference/checklist.md).
7. **Test with several peers** ([testing.md](reference/testing.md)): `node scripts/serve.mjs <folder>` and add
   `http://localhost:8080/` to a class at https://edrys-labs.github.io; a second window as a student; a late
   joiner; a reload; the station. Automate with edrys-module-tests when the module is to be maintained.
8. **Deliver**: the files, a README ([publishing.md](reference/publishing.md)), the URL it will have, and an
   example lab entry for the edrys-lab skill.

Paths are relative to this skill's folder.

| Example | Shows |
|---------|-------|
| [examples/minimal/](examples/minimal/index.html) | the skeleton: meta tags, config per role with defaults, a message to the room |
| [examples/countdown/](examples/countdown/module.yml) | a YAML module; a teacher-only control; a `Value` in state that late joiners see |
| [examples/shared-checklist/](examples/shared-checklist/index.html) | a `Y.Map` everyone edits, rebinding, awareness ("viewing"), a configurable channel |
| [examples/serial-bridge/](examples/serial-bridge/index.html) | a station module: Web Serial at the station, output and input as messages, status in state |

All four are tested in a real edrys-Lite with several peers.

## Mistakes that fail silently

None of these shows an error in edrys-Lite; the module just doesn't work.

| Mistake | Effect | Fix |
|---------|--------|-----|
| No `<title>` | the module shows as `<Error: exception scraping module>` | add `<title>` |
| Code reads `Edrys.module`/state outside `onReady` | `undefined`, or a throw that stops the script | do it in `Edrys.onReady` |
| State applied only in `onUpdate` | late joiners see nothing until something changes | apply in `onReady`, then observe |
| `sendMessage(subject)` without a body | message dropped | pass a body, e.g. `true` |
| Listening for another module's messages without `promiscuous` | nothing arrives (only same-URL messages do) | `onMessage(fn, true)` + subject check |
| Writing to `Edrys.liveClass` / `liveRoom` / `liveUser` | nothing happens | `getState` |
| Unprefixed state keys (`text`, `status`) | modules in the same room overwrite each other | `<module>.<key>` |
| Every peer writes defaults on load | late joiner wipes or duplicates the content | write only if the key is missing |
| Keeping the first `getState(key, 'Map')` forever | after a simultaneous create the peer is cut off | rebind on `keysChanged` |
| A second copy of Yjs in a bundle | "Unexpected content type", bindings don't sync | alias `yjs` to `window.Y` |
| `sendStream`/`onStream` without the same `streamName` | stream never connects | explicit `streamName` on both sides |
| Boolean field on by default without `default: true` in the schema | the first Save in the form turns it off | declare `default` |
| YAML module: `module-config` as a map, or `show-in` as a string | no settings form / module fails to load | `module-config: \|` string; `show-in: ['*']` |
| YAML or `fetch` module with `…`, `ü`, `✓` | shown as `%u2026` | `&hellip;`, `…` |
| YAML or `fetch` module with `localStorage` / `Edrys.setItem` / relative URLs | throws / 404 | HTML module, or absolute URLs and no storage |
| `display: flex` on an element with `hidden` | role-only controls visible to everyone | `[hidden] { display: none !important; }` |
| Served without CORS (`python -m http.server`) | module shows as an error | `scripts/serve.mjs`, GitHub Pages |
| HTML module linked as `raw.githubusercontent.com` | iframe shows the source | GitHub Pages |

## Can a module do this?

| Request | Answer |
|---------|--------|
| Use hardware at the station (serial, camera, MIDI) | Yes: a station module ([roles-and-stations.md](reference/roles-and-stations.md)). Web Serial in Chrome, Edge, Firefox 151+. |
| WebUSB, WebHID, Bluetooth | No: edrys-Lite's iframe doesn't allow them. Use Web Serial, or a local server at the station. |
| Talk to a program on the station computer | Yes: `ws://localhost` / `http://localhost` from the station's module; the server must accept the origin. |
| Keep data after everyone leaves | Not in edrys state (memory only). Store at the station (`localStorage`), offer a download, or use your own server. |
| Hide something from students | Only in the UI. Configs and state reach every browser. |
| Trust that a command came from a teacher | Yes: check `Edrys.liveClass.users[from]?.role` on a received message. |
| Talk to other modules | Yes: messages in the same room (`promiscuous`), with documented subjects. Broadcasts don't leave the room. |
| Send to one person | Yes: `sendMessage(subject, body, username)`, in whatever room they are, if a module there listens. |
| Video or audio | Yes: `sendStream` / `onStream`. |
| Run on its own outside edrys-Lite | Only if the module handles `Edrys` never becoming ready; edrys.js does nothing without the app. |

## Answering the user

- Give complete files, not fragments, and say which kind of module it is and where it must be hosted.
- State the contract: config fields, message subjects, state keys, `show-in`, supported browsers.
- Give the example lab entry, and point to the edrys-lab skill for building the lab around it.
- Say what you checked (`check-module.mjs`, which peers and flows you tested) and what you could not (real
  hardware, other browsers).
