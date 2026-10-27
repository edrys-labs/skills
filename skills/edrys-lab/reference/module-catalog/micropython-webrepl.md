# MicroPython WebREPL

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-micropython-webrepl/`
- **Source:** https://github.com/edrys-labs/module-micropython-webrepl
- **Default rooms (`show-in`):** `station`
- **Description:** A MicroPython board's REPL (WebREPL) in a station room: everyone in the room can type into it, send and get files, and run code from editor modules. For more information, visit: https://github.com/edrys-labs/module-micropython-webrepl
- **Schema read:** 2026-10-27

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `websocket` | string |  | Address of the board, usually through proxy.py (e.g. ws://localhost:8765/ws://192.168.4.1:8266). Changing it also changes the address shown in the station room. |
| `execute` | string | `"execute"` | Message subject on which code from editor modules is run (default: execute) |
| `self_charge_alvik` | boolean |  | Arduino Alvik: run self_charge.py on the board when the last user leaves the station room, and show a Self Charge button |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-micropython-webrepl/
  stationConfig:
    # websocket: ''  # string
    execute: execute
    # self_charge_alvik: false  # boolean
  showInCustom: station
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** sharing the REPL of a **Wi-Fi** MicroPython board (ESP32, Arduino Alvik, …) from a station: the board
needs no USB connection to the station. Everyone in the station room types into the same REPL; station and
teachers can send and fetch files; editor modules can run code on the board.

**Only `stationConfig` is read.**

| Key | Note |
|-----|------|
| `websocket` | Address of the board **through the proxy** on the station computer: `ws://localhost:8765/ws://<board-ip>:8266`. |
| `execute` | Subject on which code from editors runs on the board, default `execute`. |
| `self_charge_alvik` | Arduino Alvik only: when the last user leaves, run `self_charge.py` on the board (drive back to the charger). The script must be on the board. |

**Station setup:** WebREPL enabled on the board (`import webrepl_setup`), and the proxy running on the station
computer, because an https page may not open plain `ws://` connections except to `localhost`:

```bash
docker run -it --network host -e PROXY_ALLOWED_TARGETS=192.168.4.1 edryslabs/micropython-webrepl-proxy:latest
```

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-micropython-webrepl/
  stationConfig:
    websocket: ws://localhost:8765/ws://192.168.4.1:8266
    execute: execute
    self_charge_alvik: false
  showInCustom: station
  width: full
  height: tall
```

**Pitfalls:**

- Set `PROXY_ALLOWED_TARGETS` on the proxy: without it any web page open in the station browser can reach any
  WebSocket in the local network through it.
- After connecting, someone has to type the **WebREPL password** into the terminal. Tell students in the lab
  description (or do it at the station).
- For a board on USB instead of Wi-Fi, use [serial](serial.md) or pyxtermjs with `workflow: micropython`.
