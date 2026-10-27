---
name: edrys-lab
description: >
  Use when creating, editing, reviewing or debugging an edrys-Lite lab, that is
  a classroom configuration (YAML or JSON) for https://edrys-labs.github.io:
  choosing and configuring modules (Markdown, code editor, terminal, camera
  stream, serial, Arduino or MicroPython simulator, whiteboard, survey, …),
  per-role configs (config, studentConfig, teacherConfig, stationConfig),
  rooms, showInCustom and module sizes, setting up a station computer with
  hardware (Docker terminal server, Web Serial, webcam), or publishing a lab
  repository with a deploy button. Example requests: "build a remote Arduino
  lab", "make an Edrys classroom for a Linux course", "why does Execute do
  nothing in my lab", "add a deploy button to my lab". German - Edrys-Labor
  erstellen, Remote-Labor mit Arduino, Klassenraum-Konfiguration für Edrys,
  Station einrichten. For writing a new module, use the edrys-module skill.
license: CC0-1.0
---

# edrys-Lite labs

A lab is one classroom configuration file. edrys-Lite imports it via a deploy link or `Settings → Share`; there
is no server that stores it. Everything below is checked against edrys-Lite 3.1.0 and the published modules.

| Topic | File |
|-------|------|
| Every key of the file, what the importer replaces, hosting | [reference/config-format.md](reference/config-format.md) |
| Rooms, `showInCustom`, `width` / `height` | [reference/show-in-and-layout.md](reference/show-in-and-layout.md) |
| Station computer: Docker images, Web Serial, camera | [reference/stations.md](reference/stations.md) |
| Lab repository, deploy link, README template | [reference/lab-repo.md](reference/lab-repo.md) |
| One file per module: URL, config schema, notes, pitfalls | [reference/module-catalog/](reference/module-catalog/) |
| Tested example labs | [examples/](examples/) |

## Workflow

1. **Gather.** Ask only what the request leaves open:
   - the subject and what students do (read, write code, type commands, watch hardware, draw, answer);
   - hardware: which board, and is a computer next to it available as a station? If not, a simulator;
   - groups: everybody in the Lobby, group rooms (`meta.defaultNumberOfRooms`), or one station per group;
   - individual or shared work (decides `synchronize`);
   - output: the classroom file (default) or a full lab repository.
2. **Pick modules** from the catalog below. Read the module's catalog file before configuring it: which config
   sections it reads, and its defaults, differ per module. Use only modules listed there, or a module URL the user
   gives you (then check it with `scripts/module-info.mjs`).
3. **Lay out rooms.** Task description in the `lobby`, tools where they are used: `station` for hardware,
   `lobby` or `Room *` for simulations. Order modules as they should appear: description first, then tools.
   Sizes: `width: half` for two tools side by side, `full` for one.
4. **Write role content.** Shared text in `config`, additions per role in `studentConfig` / `teacherConfig` /
   `stationConfig` (setup instructions for whoever runs the station go into the Markdown module's
   `stationConfig`). Use `|` blocks for Markdown and code.
5. **Validate.** `node scripts/validate-lab.mjs lab.yaml` fetches every module and checks the configs against
   its schema. Fix all errors; read every warning. Script paths are relative to this skill's folder; give the
   lab file as an absolute path. Run `npm install --prefix scripts` once (Node 18+). If the `edrys` MCP server
   is connected, also check the lab in its live class ([below](#in-a-live-class-edrys-dev)).
6. **Deliver.** The YAML, plus for a station lab the exact `docker run` line (from
   [stations.md](reference/stations.md)) and the steps: add the station computer's User ID as a teacher, open
   the station link. For a repository, follow [lab-repo.md](reference/lab-repo.md); the deploy link is
   `https://edrys-labs.github.io/?/deploy/<raw URL of the file>`.

Start from the closest example instead of a blank file:

| Example | Shows |
|---------|-------|
| [examples/avr8js-simulation.yaml](examples/avr8js-simulation.yaml) | no station: editor + simulated Arduino in the Lobby, each student on their own |
| [examples/terminal.yaml](examples/terminal.yaml) | a shared Linux shell from a station |
| [examples/arduino.yaml](examples/arduino.yaml) | real Arduino: shared editor, camera, terminal that compiles and uploads |
| [examples/micropython-web-serial.yaml](examples/micropython-web-serial.yaml) | a board's REPL via Web Serial, no server at the station |

## Module catalog

| Module | For | Rooms |
|--------|-----|-------|
| [markdown-it](reference/module-catalog/markdown-it.md) | task descriptions, instructions, teacher notes | any |
| [liascript](reference/module-catalog/liascript.md) | interactive course content with quizzes | any |
| [iframe](reference/module-catalog/iframe.md) | embedding any web page or HTML | any |
| [monaco-editor](reference/module-catalog/monaco-editor.md) | code editor; Execute sends code to a runner | with its runner |
| [blockly-duino-v2](reference/module-catalog/blockly-duino-v2.md) | block-based Arduino programming | with its runner |
| [pyxtermjs](reference/module-catalog/pyxtermjs.md) | shell on the station computer; compiles and uploads code | `station` |
| [serial](reference/module-catalog/serial.md) | a device's serial console via Web Serial | `station` |
| [micropython-webrepl](reference/module-catalog/micropython-webrepl.md) | REPL of a Wi-Fi MicroPython board | `station` |
| [arduinoview](reference/module-catalog/arduinoview.md) | GUI sent by the Arduino sketch itself | `station` |
| [streaming](reference/module-catalog/streaming.md) | camera stream from the station | `station` |
| [hardware-control](reference/module-catalog/hardware-control.md) | remote buttons and potentiometers (Analog Discovery 2) | `station` |
| [station-light-control](reference/module-catalog/station-light-control.md) | camera light on while someone watches | `station, station-only` |
| [avr8js](reference/module-catalog/avr8js.md) | simulated Arduino Uno with parts | `lobby`, `Room *` |
| [micropython-simulator](reference/module-catalog/micropython-simulator.md) | simulated Calliope mini 3 / micro:bit v2 | `lobby`, `Room *` |
| [whiteboard](reference/module-catalog/whiteboard.md) | drawing together | any |
| [quill](reference/module-catalog/quill.md) | shared rich-text document | any |
| [survey](reference/module-catalog/survey.md) | feedback form, answers stored at the station | `station` |
| [code-logger](reference/module-catalog/code-logger.md) | teacher log of every run | `*, teacher-only` |

Runners (pyxtermjs, avr8js, micropython-simulator, micropython-webrepl) take code from an editor on a message
subject: the editor's `runCommand` must equal the runner's `execute`, and both must be in the same room.

For an unknown module URL: `node scripts/module-info.mjs <url> --entry` prints its schema and an entry to paste.

## In a live class: edrys-dev

If the `edrys` MCP server is connected (tools `get_state`, `goto`, `read_messages`, …), edrys-dev shows the lab
in a class in the user's browser. Otherwise skip this section.

- The lab file at `get_state.lab` is the class: edit it in place with your file tools, and the class tab
  (`get_state.url`) republishes it. Never ask the user to reload or import it.
- After each save, wait for the `lab` event; `ok: false` means the class could not take the file: fix it. Still
  run `validate-lab.mjs`: the class accepts configs that a module ignores.
- `get_state.class` shows the rooms, who is in which, and the modules; a module that did not load has `error`.
- See it as others do: `goto {room}` moves the class tab; `goto {as: "student"}` opens a student tab with its own
  identity, `goto {as: "station"}` a station tab (run by the owner, as in a real lab).
- "Execute does nothing": `read_messages` shows the messages the class tab saw in its room (`goto` that room
  first), so whether the editor sent its subject and the runner answered. `read_module_state {room}` shows what the modules share in a room.
- The user talks to you in the chat panel over the class: answer `chat` events with the `chat` tool.
- Don't deploy or publish unless asked. `get_state.local_urls` lists `localhost` module URLs, which work only on
  this machine: replace them with the published URLs before the lab is shared.

## Mistakes that fail silently

None of these shows an error in edrys-Lite; the lab just does not work.

| Mistake | Effect | Fix |
|---------|--------|-----|
| Editor and runner in different rooms, or `runCommand` ≠ `execute` | Execute does nothing | same `showInCustom`, same subject |
| pyxtermjs without `enable` | students can't type, their Execute is ignored | `enable: {student: true, teacher: true}` |
| Settings in the wrong section (e.g. streaming/pyxtermjs options in `config`) | ignored, defaults used | the section the catalog file names |
| `synchronize` left out | editors, simulators and whiteboards are private per person | set it explicitly |
| `teacher-only` / `station-only` without a room entry | module never appears | `*, teacher-only`, `station, station-only` |
| `Teacher-only` (capitalized) | treated as a room name; everybody sees the module | lowercase flags |
| `width` / `height` left out, or a typo | tiny 250 × 200 px module | set both on every module: `full`/`half`/`third`, `huge`/`tall`/`medium`/`short`, or a number |
| Markdown text in a `medium` or `short` module | a module never grows with its content: the rest scrolls inside its frame and is easily missed | `height: huge` for a task description, `tall` for a few lines |
| `content: >` for Markdown or code | lines joined, lists and code blocks broken | `content: \|` |
| A config written as a non-JSON string | module gets a string and ignores it | YAML map |
| Two editors in one room without `editorId` | both show the same document | distinct `editorId` |
| Station opened in a browser that is not the owner or a teacher | no station room appears | add its User ID as teacher |
| serial and pyxtermjs on the same port | whichever opens second fails | one of them per port |
| Deploy link to a `github.com/.../blob/...` page | "not a classroom" | `raw.githubusercontent.com` URL |

Clean files: never write `id`, `createdBy`, `setupSigner`, `setupSignature`, `meta.id`, `meta.selfAssign` or
peer IDs in `members`. When starting from an exported or older lab, delete them (see
[config-format.md](reference/config-format.md)).

## Can edrys-Lite do this?

| Request | Answer |
|---------|--------|
| Real hardware students control remotely | Yes: a station next to the hardware ([stations.md](reference/stations.md)). |
| Arduino or micro:bit without hardware | Yes: avr8js, micropython-simulator. No station needed. |
| Group work in separate rooms | Yes: `meta.defaultNumberOfRooms` and `showInCustom: Room *` (or per room). |
| Several identical hardware setups | Yes: one station per setup; all share one `stationConfig`. |
| Hide solutions from students | Only in the interface. `teacherConfig` reaches every browser; nothing in a lab is secret. |
| Restrict who may join | Yes, in the class: `Settings → Members` (student list). Not part of a shareable lab file. |
| Chat | Built into edrys-Lite; no module needed. |
| Quizzes | Yes: liascript (quizzes in course content) or survey (questionnaires). |
| Collect results or grades centrally | No server stores anything. survey keeps answers in the station's browser; code-logger keeps a log in the teacher's browser (downloadable). No automatic grading. |
| Student accounts, logins, booking time slots on a station | No. |
| A tool no module provides (a new device, a custom UI) | Write a module: use the **edrys-module** skill. Embedding an existing web tool with iframe may be enough. |

## Answering the user

- Give the complete file, not fragments, and say which modules it uses and where.
- For a station lab, say what the station computer needs: Docker command, browser (Chrome, Edge or Firefox 151+ for Web Serial),
  camera, and that its User ID must be a teacher.
- Say what you could not check: the validator checks the configs, not that hardware, ports or wiring match.
