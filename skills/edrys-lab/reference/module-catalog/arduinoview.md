# Arduino-View

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-arduinoview/index.html`
- **Source:** https://github.com/edrys-labs/module-arduinoview
- **Default rooms (`show-in`):** `station`
- **Description:** Host websites on an Arduino and use them from every browser in the room. The station connects the Arduino via Web Serial (Chrome, Edge or Firefox 151+). For more information and configuration, see: https://github.com/edrys-labs/module-arduinoview
- **Schema read:** 2026-10-27

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `baudrate` | select: 110 / 300 / 1200 / 2400 / 4800 / 9600 / 19200 / 38400 / 57600 / 115200 |  | Baud rate of the Arduino sketch. Leave empty to let the station choose (default: 9600) |
| `autoconnect` | boolean |  | Connect to the Arduino when the station opens and when it is plugged in again (the station must have chosen the port once) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-arduinoview/index.html
  stationConfig:
    # baudrate: ''  # select: 110 | 300 | 1200 | 2400 | 4800 | 9600 | 19200 | 38400 | 57600 | 115200
    # autoconnect: false  # boolean
  showInCustom: station
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** experiments whose user interface comes from the Arduino itself. The sketch (using the
[ArduinoView library](https://github.com/kfessel/Arduinoview)) sends HTML, buttons, sliders, text fields and
live graphs over the serial port; everyone in the station room sees and uses that GUI, and their inputs go back
to the Arduino. Swap the board and sketch, and the same lab shows a different experiment. Example lab:
[lab-arduinoview](https://github.com/edrys-labs/lab-arduinoview).

**Only `stationConfig` is read.**

| Key | Note |
|-----|------|
| `baudrate` | Baud rate of the sketch, as a string from the list (`"9600"` … `"115200"`). Empty: the station's last choice (default 9600). |
| `autoconnect` | Reconnect when the station opens and when the Arduino is plugged in again. Needs the port to have been chosen once at the station. Set it for unattended stations. |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-arduinoview/index.html
  stationConfig:
    baudrate: '57600'
    autoconnect: true
  showInCustom: station
  width: full
  height: huge
```

**Pitfalls:**

- The **station** browser needs Web Serial: Chrome, Edge or Firefox 151+, not Safari. Students can use any browser.
- The first connection needs a click **at the station** (browsers only show the port dialog after a local
  click). A teacher's remote Connect works after that.
- The sketch must use the ArduinoView library and answer the GUI request; a plain sketch shows nothing.
- It holds the serial port itself: don't combine it with [serial](serial.md) or a pyxtermjs serial monitor on
  the same port.
- `baudrate` is a select of strings: write `'57600'`, not `57600`.
