# Python Terminal-Server

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-pyxtermjs/index.html`
- **Source:** https://github.com/edrys-labs/module-pyxtermjs
- **Default rooms (`show-in`):** `station`
- **Description:** This is a terminal-server based on https://github.com/cs01/pyxtermjs. A server should be started locally and shared in station mode. For more information and configuration options, see https://github.com/edrys-labs/module-pyxtermjs
- **Schema read:** 2026-10-27

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `server` | string |  | Default terminal-server URl (http://localhost:5000/pty) |
| `execute` | string |  | Message subject to execute code (default: execute) |
| `workflow` | select: arduino-avr / arduino-esp32 / arduino-nano-esp32 / arduino-stm32 / avr-gcc / micropython / native (presets) |  | Terminal workflow (toolchain). Fills in the script below. Leave empty to write your own script. |
| `board` | combobox: arduino:avr:uno / arduino:avr:mega / arduino:avr:nano / esp32:esp32:esp32 / arduino:esp32:nano_nora / NUCLEO_F401RE / avr128db48 |  | Board identifier for the selected workflow (arduino-cli FQBN or avrdude/avr-gcc MCU). Free text is allowed. |
| `port` | string |  | Serial port of the device (e.g.: /dev/ttyACM0, /dev/ttyUSB0) |
| `baud` | number |  | Baud rate used for serial monitoring (default: 9600) |
| `filename` | string |  | Name of the file the code is written to (e.g.: Blink.ino, main.py, main.c) |
| `script` | code-area |  | Script to be executed. Overrides the workflow. $CODE is replaced by the base64 code, $BOARD / $PORT / $BAUD / $FILE by the fields above. $FILES writes the other files of a multi-file project (otherwise they are written first). (e.g.: echo $CODE \| base64 --decode) |
| `enable` | checkboxes: student / teacher |  | Allow students and/or teachers to type into the terminal and to run code from editor modules (the station itself always may) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-pyxtermjs/index.html
  stationConfig:
    # server: ''  # string
    # execute: ''  # string
    # workflow: ''  # select: arduino-avr | arduino-esp32 | arduino-nano-esp32 | arduino-stm32 | avr-gcc | micropython | native
    # board: ''  # combobox: arduino:avr:uno | arduino:avr:mega | arduino:avr:nano | esp32:esp32:esp32 | arduino:esp32:nano_nora | NUCLEO_F401RE | avr128db48
    # port: ''  # string
    # baud: 0  # number
    # filename: ''  # string
    # script: ''  # code-area
    # enable: {student: false, teacher: false}  # checkboxes: student | teacher
  showInCustom: station
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** a real terminal on the station computer, shared with everyone in the station room. It also runs code
sent by an editor ([monaco-editor](monaco-editor.md), [blockly-duino-v2](blockly-duino-v2.md)) through a script:
compile and upload an Arduino sketch, flash MicroPython, run Python, … The station's browser connects to a
terminal server on the station computer; see [stations.md](../stations.md) for running it.

**Only `stationConfig` is read** (by every role, so the subjects match). `config`, `studentConfig` and
`teacherConfig` are ignored.

**Keys that matter:**

| Key | Note |
|-----|------|
| `server` | Default `http://localhost:5000/pty`: the terminal server on the station computer. |
| `execute` | Subject the station takes code on, default `execute`. Must equal the editor's `runCommand`. Also namespaces the terminal's own messages, so two terminals in one room need two subjects. |
| `workflow` | A built-in toolchain that fills in `script`, `board`, `port`, `baud`, `filename`: `arduino-avr`, `arduino-esp32`, `arduino-nano-esp32`, `arduino-stm32`, `avr-gcc`, `micropython`, `native` (runs Python). Prefer it over a hand-written `script`. |
| `board`, `port`, `baud`, `filename` | Override the workflow's values; available in the script as `$BOARD`, `$PORT`, `$BAUD`, `$FILE`. |
| `script` | Typed into the shell for every received program; overrides the workflow. `$CODE` is the program, base64-encoded (`echo $CODE \| base64 --decode > $FILE`). Default without workflow: print the code. |
| `enable` | `{ student: true/false, teacher: true/false }`: who may type into the terminal **and run code from the editor**. **Nobody unless set.** Code from modules on the station itself always runs. |

**Example** (Arduino Uno: compile, upload and open the serial monitor on every Execute):

```yaml
- url: https://edrys-labs.github.io/module-pyxtermjs/index.html
  stationConfig:
    server: http://localhost:5000/pty
    execute: execute
    workflow: arduino-avr
    board: arduino:avr:uno
    port: /dev/ttyACM0
    enable:
      teacher: true
      student: true
  showInCustom: station
  width: half
  height: tall
```

A plain Linux terminal for students to type into: leave out `workflow` and `script`, keep `enable`.

**Pitfalls:**

- Without `enable`, students only see output: they can't type, and their Execute does nothing.
- The editor and the terminal must be shown in the same room (messages are room-scoped).
- The server only accepts pages from `https://edrys-labs.github.io` (and `localhost:3002`). For a self-hosted
  edrys-Lite, start it with `--origins <your origin>`.
- The terminal runs as the station's user on the station's computer: use the Docker image, not a bare
  `python3 -m pyxtermjs`, for a class.
- Old labs reference the Docker image `crosslab/edrys_pyxtermjs`, which has not been updated since 2024. Use
  `edryslabs/module-pyxtermjs:latest` (`:esp32` for Espressif ESP32 boards).
- A hand-written `script` in old labs often does the same as `workflow: arduino-avr`; prefer the workflow, it
  also handles multi-file projects (`$FILES`).
