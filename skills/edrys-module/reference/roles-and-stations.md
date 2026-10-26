# Roles and stations

## Roles

| `Edrys.role` | Who | Typical module behaviour |
|--------------|-----|--------------------------|
| `teacher` | the class owner and the teachers in `members.teacher` | controls: start, reset, configure, see everyone's results |
| `student` | everybody else who joins | works with the module; sees the shared result |
| `station` | a browser window opened via the station link, by the owner or a teacher | runs next to hardware: owns the device, executes, streams, reports status |

The role is the same for every module on the page; it changes only if the user rejoins. `liveClass.users`
holds every peer's role (derived from the signed class setup, not claimed by the peer), so a module can show who
is who.

### Per-role behaviour

```js
Edrys.onReady(() => {
  const isTeacher = Edrys.role === 'teacher'
  controls.hidden = !isTeacher        // hide what a role can never use; don't just disable it
})
```

- Role checks only shape the UI. Every peer runs the same code and can send any message or write any state.
  When an action must come from a teacher or the station, the *receiver* checks the sender:

  ```js
  Edrys.onMessage(({ from, subject, body }) => {
    if (subject !== RESET) return
    if (Edrys.liveClass.users[from]?.role !== 'teacher') return
    reset()
  })
  ```

  `from` is signed, so this check holds. State writes carry no sender; don't base permissions on state alone.
- If only one role should load the module at all, declare it in `show-in` (`*, teacher-only`, `station,
  station-only`) instead of rendering nothing for the others ([declaration.md](declaration.md#show-in)).
- `teacherConfig` reaches students too. A "solution" in a config or in state is visible to anyone who opens the
  devtools. Say so in the README if a lab author might assume otherwise.

## Stations

A station is an edrys-Lite window on a computer next to the hardware. It opens with the station link
(`https://edrys-labs.github.io/?/station/<class-id>/<owner>`, see the edrys-lab skill), and its room `Station <name>` exists only while it is open. Students *enter* that
room to use it. The station's `Edrys.username` equals its room name, `"Station <name>"`.

A module that works with a station usually has two halves in one file:

| Station side (`role === 'station'`) | Everyone else in the station room |
|--------------------------------------|-----------------------------------|
| owns the device (Web Serial, camera, a local server) | sends requests as messages |
| executes requests, sends output and readings as messages | shows output, readings, the stream |
| writes the status to state (`connected`, `busy`) | shows the status from state, also as a late joiner |

```js
const STATUS = 'sensor.status'
Edrys.onReady(() => {
  if (Edrys.role === 'station') {
    Edrys.getState(STATUS, 'Value', 'off')   // after a reload the device is closed, whatever the state said
    // …connect, then Edrys.getState(STATUS, 'Value', 'on')
  }
  Edrys.getState().observe((e) => e.keysChanged.has(STATUS) && showStatus())
  showStatus()
})
```

### Rules for the station side

- **It runs unattended.** Nobody watches the station screen during class. No `alert`/`confirm`/`prompt`, no
  dialogs that block. Show status in the module, and send errors to the room so students see them.
- **One click by a person is fine, once.** Web Serial's `navigator.serial.requestPort()` and some camera setups
  need a user gesture at the station. After the first grant, `navigator.serial.getPorts()` returns the port
  without a gesture: use it to reconnect after a reload or replug.
- **Survive reloads and replugs.** Reset the status on load (the device is closed after a reload), listen for
  the port's `disconnect` event, and report it.
- **Several stations share one `stationConfig`.** Per-device differences (port, camera name) must be
  discoverable at the station, or chosen there and remembered with `Edrys.setItem`.
- **Only one tab owns a device.** A serial port opened by one module (or one browser tab) can't be opened by
  another. Report "port busy" clearly instead of failing silently.
- **Its messages are recognisable.** The station runs with the key of the teacher who opened it, but its
  messages carry `from: "Station <name>"`, and others can check `liveClass.users[from]?.role === 'station'`.

### Talking to the station

- Broadcast in the room (`sendMessage(subject, body)`) when all viewers should see the effect. The station is
  in the room too.
- Address the station only when the request is private:
  `Object.values(Edrys.liveClass.users).find(u => u.role === 'station' && u.room === Edrys.liveUser.room)?.name`.
- A request sent before the station's module is ready is lost. Either retry until the station answers, or let
  the station announce itself (a status in state) and enable the controls only when it is there.

### Talking to local programs

A station module can reach servers on the station computer (`ws://localhost:…`, `http://localhost:…`) from
the browser. The page is served over HTTPS, so:

- browsers allow `http://localhost` and `ws://localhost` from an HTTPS page, but not other plain-HTTP hosts;
- the server must accept the edrys-Lite origin (`https://edrys-labs.github.io`, and the module's own origin
  for direct `fetch` calls from the iframe): CORS headers for HTTP, an `Origin` check that allows it for
  WebSockets;
- make the server URL a `stationConfig` field with a sensible default, and show "server not reachable at …"
  with the URL when it is down.

### Browser APIs at the station

edrys-Lite's iframe allows `camera`, `microphone`, `display-capture`, `serial`, `midi`, `geolocation`,
accelerometer/gyroscope/magnetometer, `clipboard-read`/`clipboard-write`, `fullscreen`, `autoplay`. Anything
else (WebUSB, WebHID, Bluetooth) is blocked by the iframe and can't be used from a module.

| API | Browsers |
|-----|----------|
| Web Serial | Chrome, Edge (89+), Firefox (151+); not Safari |
| Web MIDI | Chrome, Edge, Firefox; not Safari |
| `getUserMedia` (camera, microphone) | all current browsers |

Name the supported browsers in the README for the role that uses the API, usually the station.
