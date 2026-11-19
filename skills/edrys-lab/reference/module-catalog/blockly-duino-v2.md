# blocklyduino

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-blockly-duino-v2/index.html`
- **Source:** https://github.com/edrys-labs/module-blockly-duino-v2
- **Default rooms (`show-in`):** `*`
- **Description:** Program https://www.arduino.cc boards with blocks, together (with synchronize, everyone in a room edits one program) or each on their own, and the run button sends the generated code to the station. Configuration options: https://github.com/edrys-labs/module-blockly-duino-v2
- **Schema read:** 2026-11-19

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `code` | code-area |  | Blockly XML the program starts with (save it from the editor menu, or see the README). Empty: start with an empty program. |
| `synchronize` | boolean |  | Share one program across all peers in the room, edited together; otherwise each peer builds their own copy, kept in their browser |
| `board` | select: arduino_uno / arduino_nano / arduino_mini / arduino_pro8 / arduino_pro16 / lilypad / arduino_mega / arduino_leonardo / arduino_micro / arduino_yun |  | Board the room starts with; sets the pins the blocks offer. Teachers and stations can change it in class. |
| `runCommand` | string |  | Subject the run button sends the Arduino code with, e.g. to a terminal module (default: execute) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-blockly-duino-v2/index.html
  config:
    # code: ''  # code-area
    # synchronize: false  # boolean
    # board: ''  # select: arduino_uno | arduino_nano | arduino_mini | arduino_pro8 | arduino_pro16 | lilypad | arduino_mega | arduino_leonardo | arduino_micro | arduino_yun
    # runCommand: ''  # string
  showInCustom: '*'
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** block-based Arduino programming for beginners (BlocklyDuino v2), with the generated C++ shown next to
the blocks. With `synchronize: true`, everyone in a room edits **one shared program**; without it (the
default), each person builds their own program, kept in their browser. The run button (▶)
sends the generated code as a message, like an editor's Execute: to [pyxtermjs](pyxtermjs.md) on a station
(real board) or to [avr8js](avr8js.md) (simulation).

**Only `config` is read.**

| Key | Note |
|-----|------|
| `synchronize` | `true`: one program per room, edited together. Off (default, also what the settings form saves when unticked): each person's own program, saved in their browser per class and room. The board stays the room's in both modes. |
| `code` | Start program as Blockly XML. Get it from the module (**Menu > Save to BlocklyDuino file**) or the [examples](https://github.com/edrys-labs/module-blockly-duino-v2/tree/main/examples). Empty: start with nothing. |
| `board` | Board the room starts with (default `arduino_uno`); only sets which pins the blocks offer. |
| `runCommand` | Subject of the run message, default `execute`. Must equal the runner's subject. |

**Example** (with a pyxtermjs runner at the station, see [pyxtermjs.md](pyxtermjs.md)):

```yaml
- url: https://edrys-labs.github.io/module-blockly-duino-v2/index.html
  config:
    board: arduino_uno
    runCommand: execute
    synchronize: true
    code: |
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="board_base_inout_buildin_led" x="18" y="17">
          <field name="STAT">HIGH</field>
        </block>
      </xml>
  showInCustom: station
  width: full
  height: huge
```

**Pitfalls:**

- `board` here does not choose what the code is compiled for: that is the runner's setting (pyxtermjs
  `board`). Keep both in agreement.
- Leaving out `synchronize` gives every student their own program: set `synchronize: true` when a group
  works on one program at a station. Before November 2026 the program was always shared.
- Edits are sent 2 seconds after the last change; when two people edit within those 2 seconds, the later change
  wins. Fine for pair work, not for a whole class editing at once.
- Changing `code` in the settings, or **Reset** in the menu, sets every room back to the configured program.
  Without `synchronize`, a changed `code` replaces every saved own program, and Reset only resets your own.
- Students don't see the board button, but that is only hidden, not a permission.
