# Live WebSerial

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-serial/`
- **Source:** https://github.com/edrys-labs/module-serial
- **Default rooms (`show-in`):** `station`
- **Description:** A WebSerial module for live serial comms with stations
- **Schema read:** 2026-10-27

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `baud` | number |  | Default baud rate of the device (default: 9600) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-serial/
  stationConfig:
    # baud: 0  # number
  showInCustom: station
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** sharing a device's serial console (an Arduino's serial monitor, a MicroPython REPL) from the station
with everyone in the station room, without a terminal server: the station's browser opens the port itself via
Web Serial. Students see the output and can type to the device.

**Config:** only `stationConfig.baud` (default 9600). Any rate works, also ones not in the dropdown. A `config.baud`
from older labs is still read as a fallback, but write `stationConfig`.

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-serial/
  stationConfig:
    baud: 115200
  showInCustom: station
  width: full
  height: medium
```

The person at the station clicks **Connect** and picks the port in the browser's dialog; this cannot be
automated.

**When to use which:** serial alone for a console only. For compiling and uploading code use
[pyxtermjs](pyxtermjs.md) (whose workflows end with a serial monitor) instead; both cannot hold the same port at
the same time.

**Pitfalls:**

- The **station** needs a browser with Web Serial: Chrome, Edge or Firefox 151+ (not Safari). Students can use any browser.
- Only one serial module per station room (they share message subjects and state).
- Unplugging the device or clicking Disconnect reloads the module on the station; click Connect again.
- Other modules can talk to the device through the messages `w` (write) and `r` (read), see the module's README.
