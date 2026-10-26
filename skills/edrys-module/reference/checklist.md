# Module checklist

Go through it before calling a module done, and when reviewing one. `node scripts/check-module.mjs <file>` checks
the items marked ⚙ automatically. Details are in the linked files.

## Declaration ([declaration.md](declaration.md))

- [ ] ⚙ `<title>` (HTML) or `name` (YAML) is set.
- [ ] ⚙ `description` says what the module does and links the repository.
- [ ] ⚙ `show-in` matches who must load it: `station` for hardware, `*, teacher-only` for teacher tools, lowercase.
- [ ] ⚙ edrys.js is loaded from `https://edrys-labs.github.io/module/edrys.js`, not a copy.
- [ ] ⚙ `module-config` parses; every field has a known `type` and a `hint`; YAML modules give it as a string.
- [ ] ⚙ Every `presets` key is a declared field of the same section.
- [ ] Every config field the code reads is declared, in the section the code reads it from, and nothing else is.
- [ ] Fields whose module default isn't the form's start value declare `default` (a boolean that is on by
      default: `default: true`).
- [ ] ⚙ YAML/`fetch` modules: ASCII only (`&hellip;`, `\u2026`), no `localStorage`/`Edrys.setItem`, only
      absolute asset URLs.

## Lifecycle ([api.md](api.md#lifecycle))

- [ ] All Edrys-dependent init is in `Edrys.onReady`; nothing reads `Edrys.module`, state or `liveUser` at top
      level or in `window.onload`.
- [ ] The current state is applied in `onReady`, not only in `onUpdate` (late joiners).
- [ ] `onUpdate` does only cheap work; no re-creating editors, re-registering listeners or full re-renders.
- [ ] No polling of `Edrys.ready` with timers.
- [ ] A reload or room change starts clean: no assumptions about earlier runs.

## Config ([api.md](api.md#configs))

- [ ] Configs are read defensively: they may be an object, a string, `""` or `undefined`.
- [ ] Defaults live in one `DEFAULTS` object; `''` and `null` mean "default".
- [ ] The role config overrides `config` (`Edrys.module[Edrys.role + 'Config']`).
- [ ] A missing or broken required config shows a message naming the field, not a blank tile.
- [ ] No secrets in any config (every role receives all of them).

## Messages ([state-messaging-streams.md](state-messaging-streams.md#messages))

- [ ] ⚙ Every `sendMessage` has a body (`undefined` is dropped silently).
- [ ] Subjects are named constants, prefixed; subjects other modules use are configurable and documented.
- [ ] Promiscuous listeners check `subject` before anything else.
- [ ] Receivers that act on commands check the sender's role where it matters.
- [ ] The module copes with its own messages coming back to it.
- [ ] Nothing a late joiner needs travels only as a message.
- [ ] Two entries of the module in one room don't cross-talk, or the README says they can't share a room.

## State ([state-messaging-streams.md](state-messaging-streams.md#shared-state))

- [ ] Keys are prefixed with the module name (and a configurable id if needed).
- [ ] Defaults are written only when the key is missing, ideally by one role; joining never overwrites content.
- [ ] The module rebinds when its shared type is replaced (or only one peer creates it).
- [ ] Shared types are never replaced while others observe them.
- [ ] Several writes are grouped in `updateState`.
- [ ] Nested types come from `window.Y`; bundled Yjs bindings are aliased to it.
- [ ] No high-frequency or unbounded data in state; cursors and presence use awareness.
- [ ] ⚙ Nothing writes to `Edrys.liveClass` / `liveRoom` / `liveUser`.

## Streams ([state-messaging-streams.md](state-messaging-streams.md#streams))

- [ ] Sender and receiver use the same module URL, `method` and an explicit `streamName`.
- [ ] Streams and camera tracks are stopped on device switch and when the module goes away.

## Roles and stations ([roles-and-stations.md](roles-and-stations.md))

- [ ] The UI differs per role where it should; controls a role can't use are hidden (and really hidden:
      `[hidden] { display: none !important; }`, see [design-baseline.md](design-baseline.md)).
- [ ] Role checks are not treated as security; permissions are checked by the receiver from `from`.
- [ ] The station side needs no attention: no dialogs, status visible, errors sent to the room.
- [ ] After a station reload or replug the status is reset and reconnecting works (`getPorts()`).
- [ ] Server URLs at the station are `stationConfig` fields with a default and a clear "not reachable" message.
- [ ] The README names the browsers that support the APIs used.

## Security

- [ ] Content from peers or configs never reaches `innerHTML` / `x-html` / Markdown `html: true` unsanitised.
      Lab-author config is semi-trusted; anything a student can write is untrusted.
- [ ] No `eval` / `new Function` on received data, except in a module whose job is running code, and then only
      where the README says so (e.g. the station).
- [ ] Own `message` listeners check `e.source` (the child frame's `contentWindow`), not only `e.origin`.
- [ ] ⚙ CDN scripts are pinned to exact versions (`lib@1.2.3`), never `@latest` or unversioned.

## Design ([design-baseline.md](design-baseline.md))

- [ ] water.css and open-iconic; works in light and dark mode.
- [ ] Fills the tile at 250 × 200 px and 1030 × 840 px; no horizontal page scroll.
- [ ] Loading, empty, not-configured and error states are shown in words.
- [ ] Labels on inputs, `aria-label` on icon buttons, visible focus.

## Repository ([publishing.md](publishing.md))

- [ ] README: published URL, what it does, roles and `show-in`, every config field with an example, message
      subjects and state keys, supported browsers, screenshot, `## License`.
- [ ] LICENSE file; GitHub topic `edrys-module`.
- [ ] Built modules: the build output that GitHub Pages serves is current (committed, or built by a workflow).
- [ ] No junk committed (`node_modules/`, `__pycache__/`, logs, editor files).
- [ ] Tested in a real edrys-Lite with at least two peers ([testing.md](testing.md)).
