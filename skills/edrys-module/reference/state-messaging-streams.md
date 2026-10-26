# Messages, shared state and streams

Signatures are in [api.md](api.md). This file is about choosing between them and using them so a module works
with many peers, late joiners, reloads and room changes.

## Which one

| Data | Use | Why |
|------|-----|-----|
| Something that happened: "run this code", "button pressed", a terminal's output, a sensor reading every 100 ms | **message** | fire and forget; nothing grows; only peers present now need it |
| Something that *is*: the shared document, the current setting, who answered what, the timer's end time | **state** (Yjs) | a late joiner, a reloaded iframe and a peer back from another room see it |
| Short-lived per-person info: cursors, selections, "typing…", "viewing" | **awareness** | removed automatically when the peer leaves or the frame reloads |
| Video, audio, a screen | **stream** | WebRTC media, not data |
| This browser only: a remembered tab, a draft | `Edrys.setItem` (HTML modules only) | not shared |

Rule of thumb: if someone who opens the room one minute later must see it, it is state. If it is high-frequency or
unbounded (logs, output), it is messages, and the receiver keeps what it needs.

## Messages

```js
const SUBJECT = 'sensor-panel.reading'   // a named constant; prefix with the module name

Edrys.onReady(() => {
  Edrys.onMessage(({ from, subject, body }) => {
    if (subject !== SUBJECT) return
    show(body)
  })
  if (Edrys.role === 'station') setInterval(() => Edrys.sendMessage(SUBJECT, read()), 1000)
})
```

- Same-URL messages need no `promiscuous`. Use `promiscuous = true` only to hear *other* modules, and then check
  `subject` first: you also receive every other module's traffic, including edrys-Lite's own stream handshake
  (`__edrys_stream_*`).
- Subjects other modules send to yours are a public contract (`execute` from an editor to a runner). Make them a
  config field with a default, and document them in the README.
- Don't trust a message because of its subject. Check the sender when it matters:
  `Edrys.liveClass.users[from]?.role === 'teacher'`. `from` is signed by edrys-Lite.
- The sender receives its own message. If the handler shouldn't act on it: `if (from === Edrys.username) return`.
- Answer one peer with `Edrys.sendMessage(subject, body, from)`.
- A request/response with a peer that may not be there yet (a student waiting for the station) needs a retry or
  a "ready" announcement from the other side; a message sent while nobody listens is lost.

## Shared state

The room's state is one `Y.Map` for *all* modules in the room. Prefix every key with the module name
(`checklist.items`), plus a config `channel`/`id` if a lab may contain the module twice in one room.

### Reading and writing

```js
Edrys.onReady(() => {
  const items = Edrys.getState('checklist.items', 'Map')   // creates the Y.Map if missing
  items.observe(render)          // remote and local changes
  render()                       // the current state, for late joiners

  button.onclick = () => Edrys.updateState(() => {
    items.set(id, { done: true, by: Edrys.liveUser?.displayName })
    items.set('updatedAt', Date.now())
  })
})
```

- Read the current state in `onReady`, then observe. Don't rely on `onUpdate` for your own data: it fires for
  everything in the class and not at all for a late joiner until something changes.
- Group writes in `Edrys.updateState(() => …)`: one transaction, one sync, one event.
- Nested shared types come from `window.Y` (`new Y.Map()`, `new Y.Array()`), the Yjs inside edrys.js. Types
  from a second copy of Yjs (an npm bundle) can't be inserted ("Unexpected content type"). A bundled editor
  binding (`y-monaco`, `y-quill`, `y-codemirror`) must use the same Yjs: alias `yjs` to a file containing
  `module.exports = window.Y` ([publishing.md](publishing.md#built-modules)).
- Values in a `Y.Map` are JSON-like (plain objects, arrays, numbers, strings, booleans, `null`,
  `Uint8Array`) or Yjs types. A plain object value is replaced as a whole on `set`; use a nested `Y.Map` for
  fields several peers edit at once.
- `getState(key, 'Value', v)` stores a plain value and writes only if its JSON differs; `getState(key, 'Value')`
  reads it, `undefined` if missing. Observe changes with `Edrys.getState().observe(e => e.keysChanged.has(key) && …)`.

### Initialise once, not on every join

Every peer that opens the room runs your `onReady`. Write defaults only if the key is missing, and preferably
only from one role:

```js
const room = Edrys.getState()
if (!room.has('countdown.end') && Edrys.role === 'teacher') Edrys.getState('countdown.end', 'Value', 0)
```

A late joiner that writes its defaults (`text.insert(0, template)` on every load) duplicates or overwrites the
content everybody else already has.

### Two peers creating the same key

`getState(key, 'Text' | 'Map' | …)` creates a new type and sets it when the key is missing *locally*. When several
peers do that before they have each other's updates (everyone's iframe reloads at once when the teacher changes
the module's settings), each creates its own; Yjs keeps one, and the others' types are detached. A peer bound
to a detached type sends and receives nothing until it reloads.

Rebind when the key changes:

```js
let items
function bind() {
  const current = Edrys.getState('checklist.items', 'Map')
  if (current === items) return
  items?.unobserve(render)
  items = current
  items.observe(render)
  render()
}
Edrys.onReady(() => {
  bind()
  Edrys.getState().observe((e) => e.keysChanged.has('checklist.items') && bind())
})
```

Or let one peer create it (the teacher, the station) and have the others wait for the key to appear
(`room.has(key)`) before binding.

### Don't

- Replace a shared type others observe (`getState().set(key, new Y.Text())` when it exists): it wipes everyone's
  content and detaches their bindings. Clear its content instead (`text.delete(0, text.length)`).
- Store high-frequency data (cursor positions, terminal output, sensor streams) in state: every change is kept
  in the document history and synced to everyone in the class. Use messages or awareness.
- Let state grow without bound (an append-only log). Trim it, or keep it in messages plus local memory.
- Store secrets: every peer in the class receives the whole document, all rooms included.

### Remember

- State is per room. A module in `Room 1` doesn't see `Room 2`'s state through `getState` (all rooms are in
  `Edrys.liveClass.rooms`, read-only).
- State lives in memory only. When the last peer leaves, it is gone. A module that must keep results (answers,
  logs) stores them somewhere: a download, the station's browser (`localStorage`), or its own server.
- Visitors who aren't members of the class can't write state.

## Awareness

```js
Edrys.onReady(() => {
  const awareness = Edrys.getState('checklist', 'Awareness')
  awareness.setLocalStateField('user', { name: Edrys.liveUser?.displayName, role: Edrys.role })
  awareness.on('change', () => showViewers([...awareness.getStates().values()].map((s) => s.user)))
})
```

- Call it in `onReady`; before it throws.
- One awareness per room and key; use the same key as the document it belongs to so editor bindings
  (`new MonacoBinding(text, model, editors, awareness)`) show the right cursors.
- `getStates()` contains only this room's and key's states, including this peer's own.
- A peer's states are removed when it leaves or its frame reloads. Don't put anything there that must last.

## Streams

The station (or whoever has the camera) sends; everyone else in the room receives. Sender and receiver must be
**the same module URL** (the handshake uses non-promiscuous messages) and must use **the same `streamName`** and
`method`. Set `streamName` explicitly on both sides: without it, WebRTC senders default to `"<username>-stream"`
while receivers default to `"Camera 1"`, and nothing connects.

```js
const NAME = (Edrys.module.stationConfig || {}).streamName || 'Camera 1'

Edrys.onReady(async () => {
  if (Edrys.role === 'station') {
    const media = await navigator.mediaDevices.getUserMedia({ video: true })
    video.srcObject = media
    const sender = await Edrys.sendStream(media, { streamName: NAME })
    // later: sender.updateStream(newMedia) on a camera switch; sender.stop() and stop the tracks when done
  } else {
    const receiver = await Edrys.onStream((stream, settings, meta) => {
      video.srcObject = stream
    }, { streamName: NAME })
  }
})
```

- WebRTC (default) uses the class's STUN/TURN servers and PeerJS's public signalling server unless
  `peerServerConfig` names another. `method: 'websocket'` needs a relay server at `websocketUrl`, run by you.
- The receiver retries every 3 s until media arrives, and the sender re-announces on request, so start order
  doesn't matter. A station reload reconnects viewers on its own.
- Several cameras at one station: one module entry per camera, each with its own `streamName` in
  `stationConfig`.
- `onStream`'s `settings` is this entry's `stationConfig`, so a viewer can apply the station's settings
  (rotation, mirroring) without extra messages.
- Stop what you start: `sender.stop()`, `receiver.stop()`, and `track.stop()` on every camera track when
  switching devices or on `pagehide`.
- The iframe may use the camera and microphone (edrys-Lite's `allow` attribute); the station's browser asks the
  person at the station for permission once.
