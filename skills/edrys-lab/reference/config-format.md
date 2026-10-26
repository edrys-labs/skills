# Classroom configuration format

A lab is a classroom configuration: one YAML (preferred) or JSON file that edrys-Lite imports via
`Settings → Share` or a deploy link. This file describes every key, what edrys-Lite does with it on
import, and which keys to leave out.

Checked against edrys-Lite 3.1.0 (`normalizeClassroom` in `src/ts/Utils.ts`, `src/views/Deploy.vue`,
`src/components/Settings/Share.vue`).

## Minimal lab

```yaml
name: Linux Terminal Basics
meta:
  logo: https://raw.githubusercontent.com/<owner>/<repo>/main/media/logo.jpg
  description: >-
    Learn the essential Bash commands on a real Linux machine.
  defaultNumberOfRooms: 0
modules:
  - url: https://edrys-labs.github.io/module-markdown-it/index.html
    config:
      content: |
        # Welcome

        Enter a station to get a terminal.
    showInCustom: lobby
    width: full
    height: tall
```

Nothing is strictly required: on import edrys-Lite fills in `meta`, `members` and `modules` with
defaults and drops anything that is not an object. A file without `name` shows an empty title, and a
file without `modules` is an empty classroom, so always write both.

## Top-level keys

| Key | Write it? | Notes |
|-----|-----------|-------|
| `name` | **yes** | Classroom title shown in the app bar and on the index page. |
| `meta` | **yes** | See below. |
| `modules` | **yes** | List of modules, in display order. See below. |
| `members` | optional | Write `{ teacher: [], student: [] }` or leave it out. Never copy peer IDs from someone's export: they identify people in one browser and mean nothing elsewhere. |
| `dateCreated` | optional | Milliseconds since 1970. Purely informational. |
| `communicationConfig` | rarely | An encoded string produced by `Settings → Communication` (custom signaling/WebRTC servers). Copy it from an export; never write it by hand. Leave it out to use the defaults. |
| `keepUrlConfig` | rarely | `true` keeps the communication settings in the classroom URL after loading (`Settings → Communication`). Only meaningful together with `communicationConfig`. |
| `id` | **no** | Replaced with a fresh ID on deploy. |
| `createdBy` | **no** | Replaced with the importer's key on deploy; the Share export already drops it. |
| `setupSigner`, `setupSignature` | **no** | Signature of one specific classroom; dropped by the export, re-created on save. |

## `meta`

| Key | Default | Notes |
|-----|---------|-------|
| `logo` | `""` | Absolute image URL, shown on the classroom card. Host it in the lab repo (`media/`) and link the raw URL. |
| `description` | `""` | Plain text shown on the classroom card. Use a folded scalar (`>-`) for long text. |
| `defaultNumberOfRooms` | `0` | Creates the rooms `Room 1` … `Room N` in addition to the Lobby (max. 50). Use it for group work; leave at `0` when everybody works in the Lobby and at stations. |
| `selfAssign` | `false` | **Leave out.** Not implemented; nothing reads it (the checkbox is hidden in the settings). |
| `id` | – | **Leave out.** Found in some old labs; nothing reads it. |

## `modules[]`

Each entry places one module in the classroom.

| Key | Required | Notes |
|-----|----------|-------|
| `url` | **yes** | URL of the module's `index.html` (or `.yml`/`.yaml` for a YAML module). Use the published GitHub Pages URL, e.g. `https://edrys-labs.github.io/module-markdown-it/index.html`. |
| `config` | no | Configuration for everyone. |
| `studentConfig` | no | Configuration for students. |
| `teacherConfig` | no | Configuration for teachers. |
| `stationConfig` | no | Configuration for the station. |
| `showInCustom` | no | Rooms the module appears in; comma-separated string. Default: the module's own `show-in` meta tag, else `*`. See [show-in-and-layout.md](show-in-and-layout.md). |
| `width` | no | `full`, `half`, `third` or a number of pixels. See [show-in-and-layout.md](show-in-and-layout.md). |
| `height` | no | `huge`, `tall`, `medium`, `short` or a number of pixels. |
| `id` | no | Filled in with a UUID on import if missing. Don't invent one. |
| `showIn` | **no** | Legacy form of `showInCustom` (list or string). Still accepted on import, but write `showInCustom`. |

Modules are laid out in list order. Put the task description first, then the tools.

### Role configs

The four config keys are what make one lab work for every role. Which keys a module reads, and how it
combines them (most modules use the role config if set and fall back to `config`), differs per module:
look it up in the module catalog before writing a config.

Rules:

- **Write configs as YAML maps**, not as strings. A string config is passed to the module as a string
  and only turned into an object if it is valid JSON; anything else silently stays a string and the
  module ignores it.
- An unused role config can be left out or set to `""`. Both mean "not set".
- **Role configs are not private.** The whole classroom configuration is synced to every member, and
  every module receives all four configs whatever the viewer's role. A solution in `teacherConfig` is
  hidden in the interface but readable by any student with the browser's developer tools. Never put
  real secrets (passwords, API keys, exam solutions that must stay hidden) into a lab.
- Keys whose name starts with `secret` are removed **only** when another person forks the classroom
  from the index page. In a running class they reach students like any other key; this is not a way
  to hide data.

### Multi-line content

Markdown and code go into literal block scalars (`|` or `|-`), which keep every line break:

```yaml
config:
  content: |
    ## Task 1

    - open the editor
    - press **Run**
```

Do not use folded scalars (`>`) for Markdown or code: they join consecutive lines, which breaks lists,
tables and code blocks. Old labs that use `>` work around it with doubled blank lines; don't copy that.

## Leaving out what the importer replaces

When starting from an existing lab or an export, delete `id`, `createdBy`, `setupSigner`,
`setupSignature`, `meta.id`, `meta.selfAssign` and the peer IDs in `members`. The result is shorter,
and it can be shared freely: whoever imports it becomes the owner of the new classroom.

## Hosting and deploying

- edrys-Lite fetches the file with `fetch()`, so it must be served as raw text with CORS allowed:
  `https://raw.githubusercontent.com/<owner>/<repo>/main/laboratory/lab.yaml` works; a
  `github.com/.../blob/...` page does not (it returns HTML, which fails with "not a classroom").
- Deploy link: `https://edrys-labs.github.io/?/deploy/<raw URL of the file>`. Opening it creates a new
  classroom owned by the visitor.
- The same raw URL can be pasted into `Settings → Share` to restore an existing classroom from it.
