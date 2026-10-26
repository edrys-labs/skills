# Declaring a module

What edrys-Lite reads from a module before it loads it: `scrapeModule` in
[`src/ts/Utils.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/ts/Utils.ts), and the settings form in
[`ModuleConfigForm.vue`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/components/Settings/ModuleConfigForm.vue)
(edrys-Lite 3.1.0). Check a module with `node scripts/check-module.mjs <file>`.

There are three kinds of modules:

| Kind | Entry | Runs on | Use for |
|------|-------|---------|---------|
| HTML page | `index.html` at a web host | its own URL | the default; anything with assets, builds, workers, `localStorage` |
| HTML with `<meta name="fetch" content="true">` | `index.html` | a `data:` URL | rarely; a page edrys-Lite should inline |
| YAML | one `.yml` / `.yaml` file | a `data:` URL | small modules that are one script, hostable anywhere that serves text (a raw GitHub file, a gist) |

edrys-Lite fetches the URL first (`fetch(url)`), so the host must allow CORS. GitHub Pages and
`raw.githubusercontent.com` send `Access-Control-Allow-Origin: *`; a local dev server must too
([testing.md](testing.md)).

## HTML module

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sensor Panel</title>
    <meta name="description" content="Shows the station's sensor values. <a href='https://github.com/you/module-sensor-panel' target='_blank'>GitHub</a>" />
    <meta name="show-in" content="station" />
    <meta name="icon" content="mdi-thermometer" />
    <meta name="module-config" content="{
      'stationConfig': {
        'interval': { 'type': 'number', 'default': 1000, 'hint': 'Milliseconds between readings' }
      }
    }" />
    <script src="https://edrys-labs.github.io/module/edrys.js"></script>
  </head>
  …
```

| Tag | Read as | Notes |
|-----|---------|-------|
| `<title>` | module name | **Required.** Without it scraping throws and the module shows as `<Error: exception scraping module>`. |
| `description` | text in the module list | HTML allowed; link the repository. |
| `show-in` | the default of the lab's *Show in* (`showInCustom`) | comma list, see below. Default `*`. Only a default: the lab author can change it. |
| `module-config` | the settings form schema | see below |
| `icon` | an [mdi](https://pictogrammers.com/library/mdi/) icon name | default `mdi-package` |
| `fetch` | inline the page | anything but `false` turns it on |

### `show-in`

Entries: `*` (every room), `lobby`, `station` (every station room), a room name (`Room 1`, `Room *`), and the
role filters `teacher-only` / `station-only`, which must be combined with a room entry (`*, teacher-only`,
`station, station-only`). Lower case; `Teacher-only` is read as a room name. Rooms are explained for lab
authors in the edrys-lab skill.

Pick it from who must load the module: a hardware bridge is `station`; a teacher dashboard `*, teacher-only`;
a task description `*`. Prefer a role filter over hiding the whole UI by `Edrys.role`: the filter keeps the
module out of other browsers entirely, and a lab author can still change it.

## YAML module

```yaml
name: Countdown
description: A countdown the teacher starts for the whole room.
show-in:
  - '*'
icon: mdi-timer-outline

load:
  scripts:
    - https://edrys-labs.github.io/module/edrys.js
    - https://edrys-labs.github.io/module/vendor/alpine.min.js
  links:
    - https://edrys-labs.github.io/module/vendor/water.min.css

module-config: |
  teacherConfig:
    minutes: { type: number, default: 5, hint: Length of the countdown }

style: |
  body { margin: 0; padding: 1rem; }

body: |
  <p id="time" class="loading">Loading&hellip;</p>

main: |
  Edrys.onReady(() => { … })
```

edrys-Lite builds one page from it: `load.links`, then `load.scripts`, then `style`, then `main` as an inline
`<script>` in `<head>`, then `body`.

- **`show-in` must be a list** (`show-in: ['*']`). A string (`show-in: '*'`) makes loading fail with "Could
  not load the YAML-declaration".

- **`module-config` must be a string** (a `|` block holding the schema as YAML or JSON). Written as a YAML map,
  the settings form fails to read it and shows no form.

- `main` runs **before `body` exists**. Touch the DOM only inside `Edrys.onReady` (≥ 1 s later) or after
  `DOMContentLoaded`.
- Use absolute `https://` URLs in `load`. Those become normal `<script src>` tags and load in order before
  `main`. A relative URL is fetched and injected later, asynchronously: `main` runs before it, and order is not
  kept.
- `load.links` has no `media` attribute; add theme-dependent stylesheets from `main`.
- A `|` block keeps line breaks; `>` joins them and breaks code.

## Inlined HTML (`fetch`)

With `<meta name="fetch" content="true">` edrys-Lite fetches the page, rewrites relative `<script src>` and
`<link href>` in `<head>` into fetch-and-inject loaders (asynchronous, unordered, like YAML), and loads the result
as a `data:` URL. Relative URLs anywhere else (images, `import`, `fetch()`) break. Only use it if you know why;
a normal HTML module has none of these limits.

## What a `data:` URL changes (YAML and `fetch`)

The page has an opaque origin (`"null"`):

- **Only ASCII.** edrys-Lite encodes the page with `escape()`, which turns `…` into `%u2026`, and the page
  shows that literally (`Loading%u2026`). Write HTML entities in markup (`Loading&hellip;`, `&#10003;`),
  `\u2026` in JS strings and `\2026` in CSS `content`.
- `localStorage`, `sessionStorage`, IndexedDB and cookies throw; so does `Edrys.setItem`.
- Relative URLs don't resolve. Use absolute URLs for every asset.
- Service workers and ES module imports by relative path don't work.

Messages, state, awareness and streams work the same as in an HTML module.

## `module-config`: the settings form

The schema has up to four sections, one per config: `config` (every role), `studentConfig`, `teacherConfig`,
`stationConfig`. Each maps a field name to `{ type, hint, default?, options?, presets? }`. In an HTML meta tag it
is pseudo-JSON with single quotes; edrys-Lite tries `JSON.parse`, then YAML, which accepts single quotes and
trailing commas. Escape `"` inside the attribute as `&quot;`, newlines in a value as `\n`.

| `type` | Widget | Saved value | Form starts at (no `default`) |
|--------|--------|-------------|-------------------------------|
| `boolean` | checkbox | `true` / `false` | `false` |
| `checkboxes` | one checkbox per `options` entry | `{ option: true/false, … }` | all `false` |
| `radio-button` | radio group of `options` | the option | the first option |
| `select` | dropdown of `options`; can carry `presets` | the option, or `null` when cleared | empty |
| `combobox` | text field with `options` as suggestions | any text | empty |
| `number` | number field | number | `0` |
| `text-area` | 5-line text area | string | `""` |
| `code-area` | code editor (Markdown highlighting) | string | `""` |
| `date` | date picker | `"YYYY-MM-DD"` | today |
| `color` | colour picker | `"#rrggbb"` | `"#000000"` |
| anything else (`string`, missing) | one-line text field | string | `""` |

`select` and `combobox` need edrys-Lite 3.1.0; older versions show them as text fields.

### Rules for a schema that matches the code

- **Declare `default` for every field whose module default is not the form's start value.** The form starts at
  `default` when set, and it saves *every* field when the author presses Save. A boolean that the module treats
  as on unless `false`, without `default: true`, is switched off by the first save.
- Treat `''` (and `null` from a cleared `select`) as "use the default".
- Give every field a `hint`: it is the only help text the author sees.
- Declare every field the code reads, in the section the code reads it from. Don't declare fields the code
  ignores. A field read from `stationConfig` but declared under `config` is never set by the form.
- A lab author writing YAML can put any value into any section; validate types in code.

### `presets` on a `select`

Choosing an option fills sibling fields of the same section:

```js
'workflow': {
  'type': 'select',
  'options': ['arduino-avr', 'micropython'],
  'hint': 'Fills in board, port and script',
  'presets': {
    'arduino-avr': {
      'board': { 'value': 'arduino:avr:uno', 'options': ['arduino:avr:uno', 'arduino:avr:mega'] },
      'port': '/dev/ttyACM0'
    },
    'micropython': { 'port': '/dev/ttyUSB0' }
  }
}
```

- A preset entry is a plain value, or `{ value, options }`; `options` narrows a `combobox` sibling's suggestions
  (free text stays allowed). The suggestions are not saved.
- Preset keys must be declared fields of the same section; others are ignored.
- The last action wins: choosing a preset overwrites siblings, even hand-edited ones.
- Presets only exist in the form. The module receives the plain values; a lab file that sets `workflow` but not
  `board` gets no board. If the module needs the preset's values without the form, apply them in code too.
