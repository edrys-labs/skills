# The `edrys.js` API

Checked against [`src/api/edrys.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/api/edrys.ts) and the
host side ([`Module.vue`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/components/Module.vue),
[`Modules.vue`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/components/Modules.vue),
[`Peer.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/ts/Peer.ts)) of edrys-Lite 3.1.0.

Load it from the published URL, never a copy in your repo (a copy misses API fixes):

```html
<script src="https://edrys-labs.github.io/module/edrys.js"></script>
```

It defines a global `Edrys`. The module is an iframe; edrys.js talks to the edrys-Lite page via `postMessage`
and accepts messages only from `window.parent`, pinning the origin of the first one.

## Lifecycle

| Call | When it runs |
|------|--------------|
| `Edrys.onReady(fn)` | **once**, about 1 s after the first sync from edrys-Lite. Called immediately if already ready. `fn(Edrys)`. |
| `Edrys.onUpdate(fn)` | after `ready`, on **every** change of any room's state or of the user list, in the whole class. `fn(Edrys)`. |
| `Edrys.ready` | `true` once ready. Don't poll it; use `onReady`. |

- Everything that reads `Edrys.module`, `liveUser`, state or awareness goes into `onReady`. Before it,
  `Edrys.module` is `undefined`, `getState` throws, and `sendMessage` throws.
- edrys.js dispatches an initial update at ~500 ms, *before* `ready` (~1 s), so `onUpdate` handlers skip it. If
  the module also registers `onReady`, no `onUpdate` follows at ready: a late joiner gets its first `onUpdate`
  only when something changes. Apply the current state in `onReady`, then react to changes.
- `onUpdate` fires for changes in *every* room and for every join or leave. Keep it cheap; for your own data,
  observe your Yjs type instead ([state-messaging-streams.md](state-messaging-streams.md)).
- The iframe is recreated when the user changes rooms, and on a module reload. All init runs again from
  scratch; it must not depend on anything that survived in memory.
- If the module never becomes ready, edrys.js asks edrys-Lite to resend everything every 5 s (from 2 s after
  `load`).

## Properties

All set before `onReady` runs. Treat them as read-only.

| Property | Value |
|----------|-------|
| `Edrys.role` | `"student"`, `"teacher"` or `"station"` |
| `Edrys.username` | this peer's ID: a long key for people, `"Station <name>"` for a station. The key in `liveClass.users` and the address for `sendMessage`. |
| `Edrys.class_id` | the classroom ID (as in its link) |
| `Edrys.module` | this module entry of the lab: `url`, `name`, `showInCustom`, `width`, `height`, `config`, `studentConfig`, `teacherConfig`, `stationConfig`, … |
| `Edrys.liveUser` | `liveClass.users[Edrys.username]`: `{ name, displayName, role, room, dateJoined, handRaised, connections }`. Can be `undefined` for a moment; use `?.`. |
| `Edrys.liveRoom` | the shared state of the current room as a plain object (no name; the name is `liveUser.room`) |
| `Edrys.liveClass` | `{ users, rooms }`: every present peer by username (all rooms), and every room's state as plain JSON |
| `Edrys.debug` | set `true` to log edrys.js internals to the console |

`Edrys.liveClass`, `liveRoom` and `liveUser` are **read-only snapshots**, rebuilt on every update. Writing to
them changes at most this peer's copy until the next update; nobody else sees it. Change shared data with
`getState`.

### Configs

`Edrys.module.config`, `.studentConfig`, `.teacherConfig` and `.stationConfig` are JSON-parsed when they hold
a JSON string; otherwise they stay as given: an object (from a YAML lab), a plain string, `""` or `undefined`.

```js
const DEFAULTS = { greeting: 'Hello', synchronize: false }

function settings() {
  const pick = (c) => (c && typeof c === 'object' ? c : {})
  const merged = { ...DEFAULTS }
  for (const c of [Edrys.module.config, Edrys.module[Edrys.role + 'Config']]) {
    for (const [k, v] of Object.entries(pick(c))) if (v !== '' && v !== null) merged[k] = v
  }
  return merged
}
```

- The role config overrides `config`. The idiom is `Edrys.module[Edrys.role + 'Config']`.
- Skip `''`: the settings form saves empty fields as `''` (see [declaration.md](declaration.md)).
- **Every role's iframe receives every config**, including `teacherConfig`. Nothing in a config is secret.

## Messages

```js
Edrys.sendMessage(subject, body, user?)
const stop = Edrys.onMessage(({ from, subject, body, module, date }) => { … }, promiscuous = false)
```

- `subject`: a string (anything else is `JSON.stringify`ed).
- `body`: any value msgpack can encode (objects, arrays, numbers, strings, `Uint8Array`, …); no
  `JSON.stringify` needed. **`body` must not be `undefined`**: a message without a body is dropped without a
  warning. Functions, DOM nodes and class instances can't be encoded; that message is dropped with a console
  error.
- `user`: a username; the message then goes to that one peer only, in whatever room it is. It arrives only if
  a module there listens for it (same URL, or promiscuous).
- Without `user`, the message reaches everyone **currently in the same room**, including the sender's own
  modules (the sender receives its own message).
- Messages are not stored. Someone who joins later never sees them. Anything a late joiner needs goes into state.
- `onMessage` without `promiscuous` delivers only messages sent by a module with the **same URL** as this one.
  With `true` it delivers every message in the room, from every module; then always filter by `subject`.
- Two entries of the same module URL in one room hear each other's messages (and share state keys). If that
  matters, add a config field such as `channel` / `editorId` and put it into subjects and keys.
- Every message is signed for its sender, room and addressee. `from` is trustworthy: a receiver can rely on
  `Edrys.liveClass.users[from]?.role`. Peers who are not members of the class can't send.
- `onMessage` returns a function that removes the handler.

## Shared state

```js
Edrys.getState()                       // the room's Y.Map
Edrys.getState(key, 'Map' | 'Array' | 'Text' | 'XmlFragment' | 'XmlText' | 'XmlElement')
Edrys.getState(key, 'Value')           // read a plain value
Edrys.getState(key, 'Value', value)    // write a plain value (only if its JSON differs)
Edrys.getState(key, 'Awareness')       // awareness for this room and key
Edrys.updateState(() => { … }, origin?) // one Yjs transaction
Edrys.clearState(key)                  // delete the key, for everyone in the room
```

The state is one [Yjs](https://docs.yjs.dev/api/shared-types) `Y.Map` per room, shared by all modules in that
room, synced to everyone in the class. It is kept only in the memory of the browsers that are online: when
the last one leaves, it is gone, and nothing is saved to disk. `window.Y` is the Yjs edrys.js
uses; create nested types with it (`new Y.Map()`), never with a second copy of Yjs. Patterns and pitfalls:
[state-messaging-streams.md](state-messaging-streams.md).

## Streams

```js
const sender = await Edrys.sendStream(mediaStream, { streamName: 'Camera 1' })  // { stop(), updateStream(s) }
const receiver = await Edrys.onStream((stream, settings, meta) => { … }, { streamName: 'Camera 1' })  // { stop() }
```

Options: `method` (`'webrtc'` default, or `'websocket'`), `streamName`, `websocketUrl` (for `'websocket'`),
`peerServerConfig` (`{ host, port, path, secure }`, a custom PeerJS server). `settings` is the
`stationConfig` of the module entry, `meta` is `{ streamName, room }`. Details and pitfalls:
[state-messaging-streams.md](state-messaging-streams.md#streams).

## Local storage

```js
Edrys.setItem(key, value)   // localStorage, key prefixed with class ID and room
Edrys.getItem(key)
```

For per-browser data (a remembered tab, a draft). Not shared with anyone. **It throws in YAML and `fetch`
modules**: they run on a `data:` URL, which has no `localStorage`. Wrap direct `localStorage` use in
`try`/`catch` there too.

## Debugging

```js
Edrys.debug = true            // edrys.js logs messages, state and lifecycle
const log = Edrys.importDebug()
log('connected', port)        // printed when debugging is on
```

Add [module-reference](https://github.com/edrys-labs/module-reference)
(`https://edrys-labs.github.io/module-reference/`) to the same room while developing: it shows what Edrys hands
a module, every message in the room (promiscuous) and the live room state.
