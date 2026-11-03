# Design baseline

The look the edrys-labs modules share, so a lab made of several modules looks like one tool, in the classroom's
light or dark theme. Follow it unless the user's design says otherwise. Good references:
[module-reference](https://github.com/edrys-labs/module-reference) (plain files, CodeMirror),
[module-serial](https://github.com/edrys-labs/module-serial) (station, toolbar, terminal),
[module-survey](https://github.com/edrys-labs/module-survey) (a chart library that bakes colours),
[module-markdown-it](https://github.com/edrys-labs/module-markdown-it) (content, YAML version too).

The theme parts (`edrys-module.css`, `Edrys.theme`, `Edrys.onTheme`) need edrys-Lite 3.2.0 or later. In an older
edrys-Lite the module gets no theme and follows the OS setting, so write theme code that works without them
(below).

## Foundation

```html
<script src="https://edrys-labs.github.io/module/edrys.js"></script>
<link rel="stylesheet" href="https://edrys-labs.github.io/module/vendor/water.min.css" />
<link rel="stylesheet" href="https://edrys-labs.github.io/module/vendor/open-iconic/css/open-iconic.min.css" />
<!-- after water.css and after a widget's own CSS, before the module's own -->
<link rel="stylesheet" href="https://edrys-labs.github.io/module/edrys-module.css" />
<script defer src="https://edrys-labs.github.io/module/vendor/alpine.min.js"></script>  <!-- optional -->
```

- **water.css** styles plain HTML. **edrys-module.css** sets water's colours from the classroom theme, the fonts
  (Noto Sans, JetBrains Mono for code), the `--edrys-*` colour variables and the layout parts below. Link it
  after water.css: its colours win anyway, but its fonts, buttons and fields only when it comes later.
- **Icons:** open-iconic, `<span class="oi" data-glyph="media-play" aria-hidden="true"></span>`. No second icon
  set, no emoji as icons.
- **Interactivity:** plain JS, or Alpine.js for small modules with a bit of reactive UI. Built modules (an editor,
  a terminal) use whatever their widget needs. Don't drive the same element from Alpine and from manual DOM code.
- No CSS framework (Tailwind, Bootstrap, Bulma) on top. A widget's own CSS (xterm, Monaco, KaTeX) is fine.
- Module CSS in one file (`style.css`) or one `<style>` block, not in `style=""` attributes.
- Start it with `[hidden] { display: none !important; }`. Without it, any `display: flex` rule on an element
  beats the `hidden` attribute, and controls meant for one role show up for everyone.
- A module whose widget brings a full UI of its own (a whiteboard, a block editor) may skip edrys-module.css when
  its global `button`/`input` rules restyle the widget: copy the few colours it needs, keyed on `data-theme`.

## Theme

edrys.js puts the classroom's theme on `<html data-theme="light">` or `"dark"` and on `Edrys.theme`, and calls
`Edrys.onTheme` handlers when the user switches it. edrys-module.css follows by itself; without `data-theme` (an
older edrys-Lite, the page opened on its own) it follows the OS setting.

- **Colours come from the `--edrys-*` variables**, never hex in the module:

  | Use | Variables |
  |-----|-----------|
  | page, text, headings, muted text | `--edrys-bg`, `--edrys-text`, `--edrys-heading`, `--edrys-muted` |
  | lines under a toolbar / above a footer, footer background | `--edrys-line`, `--edrys-footer` |
  | buttons, primary action, fields | `--edrys-button`, `--edrys-on-button`, `--edrys-primary`, `--edrys-on-primary`, `--edrys-field`, `--edrys-field-line` |
  | status pills, status dots | `--edrys-ok-pill` / `--edrys-on-ok-pill` (also `warn`, `error`), `--edrys-ok`, `--edrys-warn`, `--edrys-error` |
  | code, editors | `--edrys-code-bg`, `--edrys-code-text`, `--edrys-line-number`, `--edrys-keyword`, `--edrys-number`, `--edrys-selection` |
  | terminals (dark in both themes) | `--edrys-terminal`, `--edrys-on-terminal` |
  | behind video and camera pictures | `--edrys-media` |
  | focus ring, link | `--edrys-focus`, `--edrys-link` |

  The full list is at the top of
  [edrys-module.css](https://github.com/edrys-labs/edrys-Lite/blob/main/static/module/edrys-module.css). An own
  colour that both themes need: define it on `:root`, override it under `[data-theme='dark']`.
- **CSS that reads the variables switches by itself.** Only code that bakes colours in JavaScript (a chart, an
  editor or terminal theme, a canvas) needs to listen:

  ```js
  function currentTheme() {
    return document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }
  function color(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }
  function applyTheme() { /* rebuild the widget's theme from color('--edrys-bg') etc. */ }

  applyTheme()
  // ?. : an older edrys.js has no onTheme, and a throw here stops onReady from running
  Edrys.onTheme?.(applyTheme)
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) applyTheme()
  })
  ```

- **Widgets with their own theme API:** Monaco `defineTheme` from the variables (define it again on every change,
  the values differ) + `setTheme`; xterm `term.options.theme = {...}` (v5+) or `term.setOption('theme', …)`
  (v4) with `--edrys-terminal`; CodeMirror 5 a `theme: 'edrys'` + `.cm-s-edrys` CSS on the variables (switches by
  itself); Blockly component styles; Mermaid `initialize({ theme: 'base', themeVariables })` before each render;
  Chart.js colours + `chart.update()`. A widget that ships a light and a dark stylesheet (highlight.js, Prism):
  link both and switch their `media` between `'all'` and `'not all'`. Not `disabled`: a stylesheet disabled
  before it loaded stays empty when enabled again.
- **Terminals stay dark** in both themes (`.edrys-terminal`, `--edrys-terminal`), with the same background on
  the wrapper and the widget so there is no seam.
- **Embedded pages** (an iframe inside the module, a simulator, a sandboxed user page): give the inner iframe
  `background: #fff`, or `color-scheme: light` for a page that is transparent on purpose. Inside a dark parent,
  a page without its own background renders transparent, black text on dark.
- edrys-module.css styles every `input`, `select` and `button`, also those inside a library widget (a dropdown, a
  date picker). Reset them on the widget's own class where they look wrong.

## Layout

- **No title in the module.** The frame around it shows the module's name.
- The module fills its iframe. Tiles can be 250 × 200 px or 1030 × 840 px and are resizable; on a phone they are
  stacked at full width. No fixed pixel widths, no horizontal scrolling at 320 px, `max-width: 100%` on media.
  Editor- and terminal-style modules scroll inside the content area, not the whole page.
- `body { margin: 0; padding: 0; max-width: none; }`, a toolbar at the top and the content in `main` with
  `padding: 16px 18px`. For a widget that fills the tile: `body { display: flex; flex-direction: column;
  height: 100vh }` and `flex: 1; min-height: 0` on the widget.
- **Toolbar** (`.edrys-toolbar`, at least 40px, a line below), when the module has status or controls: the status
  pill left, `.edrys-spacer`, secondary actions and settings right.

  ```html
  <header class="edrys-toolbar">
    <span id="status" class="edrys-pill" role="status">Loading&hellip;</span>
    <span class="edrys-spacer"></span>
    <label for="baud">Baud rate</label>
    <select id="baud">…</select>
    <button id="connect">Connect</button>
  </header>
  <main>…</main>
  <footer class="edrys-footer"><button class="primary" id="run">Run</button></footer>
  ```

- **Pill** (`.edrys-pill`, plus `.ok`, `.warn` or `.error`; none = neutral): `ok` = on, connected, running; `warn`
  = connecting, compiling, waiting for something that will come; `error` = failed, disconnected when it should be
  connected; neutral = idle, off, unknown. Map your own states to these classes in one place
  (`const PILL = { on: 'ok', off: '', wait: 'warn' }`).
- **Footer** (`.edrys-footer`, a line above, slightly darker): the main actions (Run, Send, Execute), primary
  button first. A text input with its Send button goes there too.
- Content modules (text, slides) skip toolbar and footer and render content with `main`'s padding.
- Spacing steps 4 / 8 / 12 / 16 px. Radius 8px for panels and terminals, 7px for buttons and fields, 999px for
  pills.

## Typography

- The fonts come from edrys-module.css (`--edrys-font`, `--edrys-mono`). Don't set `font-family` on
  `html`/`body`; use the variables for a widget that takes a font name.
- Monospace for code, ports, URLs, IDs.
- A widget that measures its font once (xterm, Monaco): create it, then set the font again after
  `document.fonts.load("13px 'JetBrains Mono Variable'")` (xterm: refit; Monaco: `monaco.editor.remeasureFonts()`).
- No ALL-CAPS buttons, no letter-spacing tricks. `h2` for the rare heading inside the content.

## States

Every module shows, in words:

- **loading** until `onReady`, as in module-markdown-it: `<p class="loading">Loading&hellip;</p>`, faded in
  after 0.5 s so fast loads don't flicker, replaced (or its class removed) once there is content:

  ```css
  .loading { color: var(--edrys-muted); opacity: 0; animation: show-loading 0s 0.5s forwards; }
  @keyframes show-loading { to { opacity: 1; } }
  ```

- **empty** ("No answers yet", "Waiting for the station to connect a device…");
- **not configured**, saying what to set where ("No content: set `content` in the module settings");
- **error**, saying what failed and what to do ("Terminal server not reachable at http://localhost:5000. Is it
  running?").

Never a blank tile. Status is never colour alone: the pill has text. Muted text uses `color: var(--edrys-muted)`,
not opacity.

## Controls

- `button.primary` for the one main action, plain buttons for the rest; icon + label where it helps.
  `aria-pressed="true"` marks the chosen button of a group (a scale, a mode).
- Hide controls a role can never use; disable only what is temporarily unavailable (and say why, e.g. "connecting…").
- Every input has a `<label>`; icon-only buttons have `aria-label` and `title`.
- Keep focus outlines visible (edrys-module.css draws a 2px ring in `--edrys-focus`).

## README

Say that the module follows the classroom's light or dark theme, and take the screenshot in the Light theme.
