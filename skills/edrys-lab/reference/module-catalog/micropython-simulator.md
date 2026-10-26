# MicroPython Simulator

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-micropython-simulator/index.html`
- **Source:** https://github.com/edrys-labs/module-micropython-simulator
- **Default rooms (`show-in`):** `*`
- **Description:** A MicroPython simulator module for Edrys: runs Python programs on a simulated Calliope mini 3 or BBC micro:bit v2 and shows the serial output. It must be connected with an additional editor module, such as https://github.com/edrys-labs/module-monaco-editor. Code must be sent with the subject `execute`. For more information and configuration options, see https://github.com/edrys-labs/module-micropython-simulator
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `board` | select: calliope-mini-3 / microbit-v2 |  | Simulated board (default: calliope-mini-3); programs import calliopemini or microbit |
| `execute` | text |  | Message subject the simulator runs code from (default: execute) |
| `sensors` | text |  | Sensor controls below the board, e.g. temperature:0:40, lightLevel, gesture, or all (default: none) |
| `synchronize` | boolean |  | Run code sent by any peer in the room on every peer (default: false, each peer runs only its own code) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-micropython-simulator/index.html
  config:
    # board: ''  # select: calliope-mini-3 | microbit-v2
    # execute: ''  # text
    # sensors: ''  # text
    # synchronize: false  # boolean
  showInCustom: '*'
```

<!-- GENERATED:END -->

## Notes

**For:** MicroPython labs **without hardware**: a simulated **Calliope mini 3** or **BBC micro:bit v2** in every
browser, with LEDs, buttons, pins, sound, sensor sliders and a serial terminal (`print`, `input()`, a `>>>`
prompt). Runs completely in the browser (WebAssembly); no code is sent to a server. No station needed. Takes code
from an editor ([monaco-editor](monaco-editor.md) with `language: python`).

**Only `config` is read.**

| Key | Note |
|-----|------|
| `board` | `calliope-mini-3` (default) or `microbit-v2`. Programs import `calliopemini` resp. `microbit`. |
| `execute` | Subject the simulator takes code on, default `execute`. Must equal the editor's `runCommand`. |
| `sensors` | Sensor controls below the board: comma-separated, each with an optional `:min:max`, e.g. `temperature:0:40, lightLevel, gesture`, or `all`. Default: none. |
| `synchronize` | **Off unless set.** Off: each peer runs its own code. On: anyone's program runs on every peer, is kept for late joiners, and Stop stops it for everyone. |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-monaco-editor/
  config:
    synchronize: false
    language: python
    runCommand: execute
    value: |
      from calliopemini import *

      while True:
          if temperature() > 30:
              display.show(Image.SAD)
          else:
              display.show(Image.HAPPY)
          sleep(1000)
  showInCustom: lobby
  width: half
  height: tall
- url: https://edrys-labs.github.io/module-micropython-simulator/index.html
  config:
    board: calliope-mini-3
    execute: execute
    sensors: temperature:0:40
    synchronize: false
  showInCustom: lobby
  width: half
  height: tall
```

**Pitfalls:**

- The import must match the board: `from calliopemini import *` vs. `from microbit import *`. Calliope mini 1
  and 2 have no MicroPython simulator.
- Sound only starts after the first click on the board (browser autoplay rule).
- Sensor values and button presses are always local to each peer, also with `synchronize`.
