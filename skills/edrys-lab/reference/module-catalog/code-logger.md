# Code Logger

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-code-logger/`
- **Source:** https://github.com/edrys-labs/module-code-logger
- **Default rooms (`show-in`):** `*, teacher-only`
- **Description:** Logs the code that is run in a room (e.g. with an editor's Execute button), for teachers. https://github.com/edrys-labs/module-code-logger
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `runCommand` | string |  | Message subjects to log, comma-separated, e.g. the runCommand of your editors (default: execute) |
| `language` | select: cpp / c / python / javascript / none |  | Language for the code highlighting (default: cpp) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-code-logger/
  config:
    # runCommand: ''  # string
    # language: ''  # select: cpp | c | python | javascript | none
  showInCustom: '*, teacher-only'
```

<!-- GENERATED:END -->

## Notes

**For:** teachers who want to see what students run. While monitoring, every run message (an editor's Execute,
Blockly's ▶) in the teacher's current room is listed with sender and time, kept in the teacher's browser, and
can be downloaded as JSON.

**Only `config` is read.**

| Key | Note |
|-----|------|
| `runCommand` | Subjects to log, comma-separated, default `execute`. Match the editors' `runCommand`. |
| `language` | Highlighting: `cpp` (default), `c`, `python`, `javascript`, `none`. |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-code-logger/
  config:
    runCommand: execute
    language: cpp
  showInCustom: '*, teacher-only'
  width: full
  height: medium
```

**Pitfalls:**

- Keep `teacher-only` in `showInCustom` (the module's default): whoever sees the module sees the full log.
- Only runs **in the room the teacher is in** are logged, and only while **Start Monitoring** is active. To log a
  station, enter the station's room. Alternatively `*, station-only` lets each station log its own room unattended.
- The log lives only in that browser (IndexedDB); download it to keep it.
- Students' code is recorded with their names: tell them.
