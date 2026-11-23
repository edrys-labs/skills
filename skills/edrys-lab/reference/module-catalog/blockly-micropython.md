# Blockly MicroPython

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-blockly-micropython/index.html`
- **Source:** https://github.com/edrys-labs/module-blockly-micropython
- **Default rooms (`show-in`):** `*`
- **Description:** Program MicroPython boards (Calliope mini, micro:bit, or any board) with blocks, as text, or both side by side: a change in the blocks rewrites the Python, a change in the Python rebuilds the blocks. With synchronize, everyone in a room edits one program together; the run button sends the Python to the room, e.g. to module-micropython-simulator or a terminal at the station. Configuration options: https://github.com/edrys-labs/module-blockly-micropython
- **Schema read:** 2026-11-23

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `board` | select: calliope / microbit / generic |  | Board the blocks are for: Calliope mini (default), BBC micro:bit, or generic (any MicroPython board: Python blocks, time and machine.Pin) |
| `code` | code-area |  | MicroPython program the room (or each person, without synchronize) starts with. Empty: start with an empty program. |
| `synchronize` | boolean |  | Share one program across all peers in the room, edited together; otherwise each peer builds their own copy, kept in their browser |
| `mode` | select: split / block / text |  | View the editor opens with: blocks and Python side by side (default), blocks only, or Python only. Everyone can switch. |
| `runCommand` | string |  | Subject the run button sends the Python code with (default: execute) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-blockly-micropython/index.html
  config:
    # board: ''  # select: calliope | microbit | generic
    # code: ''  # code-area
    # synchronize: false  # boolean
    # mode: ''  # select: split | block | text
    # runCommand: ''  # string
  showInCustom: '*'
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** block-based MicroPython for beginners, on the **Calliope mini** (default), the **BBC micro:bit** or any
MicroPython board, with blocks and Python side by side: a change in the blocks rewrites the Python, a change in
the Python rebuilds the blocks, so students move from blocks to text at their own pace. With `synchronize: true`,
everyone in a room edits **one shared program**; without it (the default), each person builds their own program,
kept in their browser. The run button sends the Python as a message, like an editor's Execute: to
[micropython-simulator](micropython-simulator.md) (simulation, no station) or to [pyxtermjs](pyxtermjs.md) with
`workflow: micropython` on a station (real board on USB).

**Only `config` is read.**

| Key | Note |
|-----|------|
| `board` | Which toolbox the blocks offer and which import they add: `calliope` (default, `from calliopemini import *`), `microbit` (`from microbit import *`) or `generic` (no board import; `time` and `machine.Pin` blocks). |
| `code` | Start program as **plain MicroPython** (not Blockly XML, unlike blockly-duino-v2). Empty: start with nothing. |
| `synchronize` | `true`: one program per room, edited together. Off (default, also what the settings form saves when unticked): each person's own program, saved in their browser per class and room. |
| `mode` | View it opens with: `split` (default), `block` or `text`. Everyone can switch in class. |
| `runCommand` | Subject of the run message, default `execute`. Must equal the runner's subject. |

**Example** (with the simulator in the same room, each student on their own):

```yaml
- url: https://edrys-labs.github.io/module-blockly-micropython/index.html
  config:
    board: calliope
    synchronize: false
    runCommand: execute
    code: |
      from calliopemini import *

      while True:
          if button_a.is_pressed():
              display.show(Image.HEART)
          else:
              display.scroll(temperature())
          sleep(1000)
  showInCustom: lobby
  width: half
  height: huge
- url: https://edrys-labs.github.io/module-micropython-simulator/index.html
  config:
    board: calliope-mini-3
    execute: execute
    sensors: temperature:0:40
    synchronize: false
  showInCustom: lobby
  width: half
  height: huge
```

**Pitfalls:**

- The board names differ from the simulator's: `calliope` here goes with `calliope-mini-3` there, `microbit` with
  `microbit-v2`. A mismatch sends code with the other board's import.
- Leaving out `synchronize` gives every student their own program: set `synchronize: true` when a group works on
  one program.
- With `synchronize`, a change is sent half a second after the last edit and a change from someone else replaces
  an edit of yours not yet sent: take turns rather than typing at the same time.
- Changing `code` in the settings (also emptying it) starts every room over with the new program, and replaces
  every saved own program.
- Reset goes back to `code`: for the whole room with `synchronize` (the button is hidden from students, which is
  no permission), for yourself without it.
- Python that has no block (or does not parse yet) shows as a generic block; Run still sends the text as it is.
