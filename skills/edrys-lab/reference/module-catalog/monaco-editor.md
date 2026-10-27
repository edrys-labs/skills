# Monaco Editor

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-monaco-editor/`
- **Source:** https://github.com/edrys-labs/module-monaco-editor
- **Default rooms (`show-in`):** `*`
- **Description:** Collaborative code editor module for Edrys classrooms, built on Monaco Editor with real-time CRDT sync. For more information visit: https://github.com/edrys-labs/module-monaco-editor
- **Schema read:** 2026-10-27

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `editorId` | string |  | Unique ID to namespace shared state — set different values when using multiple editors in the same room |
| `value` | code-area |  | Initial code shown in the editor |
| `runCommand` | string |  | Message subject sent when Execute is clicked (default: execute) |
| `language` | combobox: cpp / c / python / javascript / typescript / java / csharp / go / rust / bash / sql / html / css / json / yaml / markdown / plaintext |  | Editor language (default: cpp); any Monaco language id works |
| `theme` | radio-button: auto / vs-light / vs-dark |  | Editor colours; auto follows the light/dark setting of each device |
| `synchronize` | boolean |  | Share one document across all peers in the room; otherwise each peer edits its own copy |
| `readOnly` | boolean |  | Make the editor read-only for everyone |
| `showLanguageSelector` | boolean |  | Let teachers and stations change the language for everyone |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-monaco-editor/
  config:
    # editorId: ''  # string
    # value: ''  # code-area
    # runCommand: ''  # string
    # language: ''  # combobox: cpp | c | python | javascript | typescript | java | csharp | go | rust | bash | sql | html | css | json | yaml | markdown | plaintext
    # theme: auto  # radio-button: auto | vs-light | vs-dark
    # synchronize: false  # boolean
    # readOnly: false  # boolean
    # showLanguageSelector: false  # boolean
  showInCustom: '*'
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** the code editor of a lab. Students write code; **Execute** sends it as a message that a runner in the
same room picks up: [pyxtermjs](pyxtermjs.md) (runs it on the station computer), [avr8js](avr8js.md) (Arduino
simulator in the browser) or [micropython-simulator](micropython-simulator.md).

**Role configs override `config` key by key.** E.g. `studentConfig: { readOnly: true }` lets only teachers and
the station edit.

**Keys that matter:**

| Key | Note |
|-----|------|
| `synchronize` | **Off unless set.** `true` = one shared document per room, edited together live. Without it every peer edits a private copy. Set it explicitly either way. |
| `value` | Initial code, and the target of the Reset button (teachers, station). With `synchronize` it only seeds the room once; changing it later does not replace code already in the room (press Reset). |
| `runCommand` | Subject of the Execute message, default `execute`. Must equal the runner's subject (`stationConfig.execute` of pyxtermjs, `config.execute` of avr8js). |
| `language` | Default `cpp`. Any Monaco language id (`python`, `javascript`, …). |
| `editorId` | **Required when two editors share a room**; otherwise both show the same document. |
| `file` | Not in the form. Map of file name → initial code for multi-file mode (one tab per file, language from the extension); replaces `value`. Runners get all files. |

**Example** (shared Arduino sketch at a station, sent to pyxtermjs):

```yaml
- url: https://edrys-labs.github.io/module-monaco-editor/
  config:
    synchronize: true
    language: cpp
    runCommand: execute
    value: |
      void setup() {
        pinMode(LED_BUILTIN, OUTPUT);
      }

      void loop() {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(1000);
        digitalWrite(LED_BUILTIN, LOW);
        delay(1000);
      }
  showInCustom: station
  width: full
  height: medium
```

Multi-file variant: replace `value` with

```yaml
    file:
      Sketch.ino: |
        #include "blink.h"
        void setup() { setupBlink(); }
        void loop() { blink(); }
      blink.h: |
        void setupBlink() { pinMode(LED_BUILTIN, OUTPUT); }
        void blink() { digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN)); delay(500); }
```

**Pitfalls:**

- Messages only reach modules **in the same room**: the editor and its runner need the same `showInCustom`
  (usually `station`).
- Two runners on the same subject in one room both run the code. Give each pair its own subject.
- Students cannot Reset; only teachers and the station can. With `synchronize`, a teacher's Reset resets everyone.
