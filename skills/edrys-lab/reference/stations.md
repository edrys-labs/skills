# Stations

A station is a browser window left open on a computer next to the lab hardware. It shows up in the
classroom as its own room, `Station <name>`, and shares what its modules connect to (a terminal, a serial
port, a camera) with everyone who enters that room.

Checked against edrys-Lite 3.1.0 (`src/views/Classroom.vue`, `isAuthorizedUserSigner` in `src/ts/Peer.ts`,
`src/components/Settings/Stations.vue`) and the module repos linked below.

## Does the lab need a station?

| The lab … | Station | Station computer runs | Modules |
|-----------|---------|-----------------------|---------|
| only simulates (Arduino Uno, Calliope mini, micro:bit) | **no** | – | [avr8js](module-catalog/avr8js.md), [micropython-simulator](module-catalog/micropython-simulator.md) next to an editor in the Lobby or `Room *` |
| shows a device's serial console | yes | nothing (Web Serial: Chrome, Edge, Firefox 151+) | [serial](module-catalog/serial.md) |
| compiles and uploads code, or gives a shell | yes | terminal server (Docker) | [pyxtermjs](module-catalog/pyxtermjs.md) + an editor |
| uses a Wi-Fi MicroPython board | yes | WebREPL proxy (Docker) | [micropython-webrepl](module-catalog/micropython-webrepl.md) |
| shows the hardware | yes | nothing (camera in the browser) | [streaming](module-catalog/streaming.md) |
| presses buttons / turns potentiometers on the board | yes | AD2 server (Docker) | [hardware-control](module-catalog/hardware-control.md) |
| lights the board only while someone watches | yes | light server (Docker) | [station-light-control](module-catalog/station-light-control.md) |

A lab without hardware needs no station: prefer that whenever a simulator covers the task.

All station modules are placed with `showInCustom: station` (or `station, station-only` for modules only the
station needs), see [show-in-and-layout.md](show-in-and-layout.md). Editors that send code to the station
must be in the station room too: messages are room-scoped.

## Opening a station

1. Teacher: `Settings → Stations` shows the station link. It is the classroom link with `station` in place of
   `classroom`: `https://edrys-labs.github.io/?/station/<classroom-id>/<owner>`.
2. Open it in a browser on the station computer. Allow the camera (and, in Chrome, access to the local
   network) when asked.
3. Optionally rename the station in its side menu. The name becomes the room `Station <name>`.

Rules that are easy to miss:

- **Only the owner or a teacher can run a station.** Other members ignore a station opened by anyone else.
  The station computer's browser has its own User ID: open the classroom there once, copy the User ID from
  the ⋮ menu, and add it under `Settings → Members` as a teacher before opening the station link.
- The station name is a random 6-character ID, kept **per browser tab**. A reload keeps it (students stay in
  the room); a new tab or a restarted browser gets a new name and a new room. Rename it again after a
  restart if the lab's text or a `showInCustom` refers to it.
- Closing the tab removes the room after a few seconds and moves its students back to the Lobby.
- The station keeps working in a background tab. Turn off sleep and screen locking on the station computer.
- Several stations: open the same link on several computers. Each becomes its own room, and **all of them get
  the same `stationConfig`**. Keep the hardware the same on every station (same board, same port; Docker can
  map any port to the configured one, see below). For a module on one station only, name the station and use
  `showInCustom: Station <name>`.

## Terminal server (pyxtermjs)

The [pyxtermjs](module-catalog/pyxtermjs.md) module connects the station's browser to a terminal server on
`http://localhost:5000/pty`. Run the server in Docker: the shell then sees only the devices passed in, not the
station computer.

### Docker image per workflow

| `workflow` | Image | Board appears as | Extra `docker run` flags |
|------------|-------|------------------|--------------------------|
| `arduino-avr` (Uno, Mega, Nano, Leonardo, Nano Every) | `edryslabs/module-pyxtermjs:latest` | `/dev/ttyACM0` (clones with CH340: `/dev/ttyUSB0`) | – |
| `arduino-nano-esp32` | `edryslabs/module-pyxtermjs:latest` | `/dev/ttyACM0` | USB for DFU: `-v /dev/bus/usb:/dev/bus/usb --device-cgroup-rule='c 166:* rmw' --device-cgroup-rule='c 189:* rmw'` |
| `arduino-esp32` (Espressif devkits) | `edryslabs/module-pyxtermjs:esp32` | `/dev/ttyUSB0` | `-v /dev/bus/usb:/dev/bus/usb --device-cgroup-rule='c 188:* rmw' --device-cgroup-rule='c 189:* rmw'` |
| `micropython` (board on USB) | `edryslabs/module-pyxtermjs:latest` | `/dev/ttyACM0` or `/dev/ttyUSB0` | – |
| `native` (runs Python, no board) | `edryslabs/module-pyxtermjs:latest` | – | no `--device` |
| `arduino-stm32` | **own image**: the STM32 core is not in `:latest` | `/dev/ttyACM0` | see below |
| `avr-gcc` | **own image**: `:latest` has `avr-gcc`, but not the `avrdude` and `screen` the workflow calls | `/dev/ttyUSB0` | see below |

Arduino Uno, the common case:

```bash
docker run -it -p 127.0.0.1:5000:5000 \
  --device=/dev/ttyACM0:/dev/ttyACM0 \
  edryslabs/module-pyxtermjs:latest
```

- Plug the board in **before** starting the container; Docker refuses to start with a missing device. Find
  the port with `ls /dev/ttyACM* /dev/ttyUSB*`.
- `--device=<host port>:<container port>` maps the board to the port the lab is configured for, e.g.
  `--device=/dev/ttyUSB0:/dev/ttyACM0`, so every station can share one `stationConfig`.
- Keep `-p 127.0.0.1:5000:5000`: it makes the terminal reachable only from the station computer itself.
- For an unattended station, replace `-it` with `-d --restart unless-stopped`.
- Own image (STM32, avr-gcc, extra libraries): build on top of `edryslabs/module-pyxtermjs:latest`, starting
  from [docker/arduino](https://github.com/edrys-labs/module-pyxtermjs/tree/master/docker/arduino) (it has
  the STM32 lines commented out). For `avr-gcc`, add `apt-get install -y avrdude screen`.
- Old labs use `crosslab/edrys_pyxtermjs`; that image has not been updated since 2024. Use the `edryslabs`
  images.

### Windows station

Docker Desktop (WSL2 backend) plus [usbipd-win](https://github.com/dorssel/usbipd-win) to pass the board into
WSL. The module repo ships `docker/windows-starter/start-pyxtermjs.bat <BUSID>`, which binds, attaches and
starts the container; see the
[module README](https://github.com/edrys-labs/module-pyxtermjs#for-windows-users).

### Without Docker

From a clone of [module-pyxtermjs](https://github.com/edrys-labs/module-pyxtermjs), on a computer where the
toolchain (e.g. `arduino-cli` with the board core) is installed:

```bash
pip install -r requirements.txt
python3 -m pyxtermjs
```

The shell then runs as the station's user, with full access to its files. Fine for a quick test, not for a
class.

### Self-hosted edrys-Lite

The server only accepts pages from `https://edrys-labs.github.io`, `http://localhost:3002` and
`http://127.0.0.1:3002`. For edrys-Lite served from another origin, list it (this replaces the defaults):

```bash
docker run -it -p 127.0.0.1:5000:5000 -e PYXTERM_ORIGINS=https://my-host.example edryslabs/module-pyxtermjs
python3 -m pyxtermjs --origins https://my-host.example
```

## Serial console without a server (Web Serial)

The [serial](module-catalog/serial.md) module opens the port in the station's browser: no Docker, nothing to
install. The station must use Chrome, Edge or Firefox 151+ (not Safari), and the person at the station clicks **Connect** and picks the
port (again after every reload or replug). It cannot share a port with a terminal server; pick one of the two.

## Camera

The [streaming](module-catalog/streaming.md) module needs only a webcam and camera permission in the station
browser (Chrome recommended). One module entry per camera. If the network blocks WebRTC, switch to the
`websocket` method with an [edrys-labs websocket-server](https://github.com/edrys-labs/websocket-server).

## Other station servers

Each runs on the station computer; setup and config are in the module's catalog file.

| Server | Image | For |
|--------|-------|-----|
| WebREPL proxy | `edryslabs/micropython-webrepl-proxy` | [micropython-webrepl](module-catalog/micropython-webrepl.md): Wi-Fi MicroPython boards |
| AD2 server | `edryslabs/module-hardware-control-server` | [hardware-control](module-catalog/hardware-control.md): buttons and potentiometers via a Digilent Analog Discovery 2 |
| Light server | `edryslabs/station-lights-server` | [station-light-control](module-catalog/station-light-control.md): Elgato Key Light |

## Simulation-only labs

No station, no Docker: an editor and a simulator side by side, `width: half` each, in the Lobby (everybody) or
in `Room *` (groups, with `meta.defaultNumberOfRooms`). The editor's `runCommand` must equal the simulator's
`execute`, and `synchronize` decides whether each student runs their own code (`false`) or the room shares one
program (`true` on both). See [avr8js](module-catalog/avr8js.md) and
[micropython-simulator](module-catalog/micropython-simulator.md).

## Checking a station

Open the classroom in a second browser or a private window (a different User ID, so a student) and enter the
station room:

| Symptom | Cause |
|---------|-------|
| No station room appears | The station's browser is not the owner or a listed teacher. |
| Terminal: not connected | Server not running, wrong `server` URL, or the page's origin is not allowed (self-hosted edrys-Lite). |
| Execute does nothing for students | `enable.student` not set, or the editor is not in the station room, or `runCommand` ≠ `execute`. |
| Upload fails: port not found | Board not passed in with `--device`, or on another port than `port` says. |
| `LIBUSB_ERROR_OTHER` on upload | DFU board (Nano ESP32) without the USB flags from the table. |
| Camera black or missing | Camera permission denied, or the camera is used by another program. |
| Serial: no output | Nobody clicked Connect at the station, wrong `baud`, or the terminal server holds the port. |
