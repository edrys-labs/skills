# Design baseline

The look the edrys-labs modules share, so a lab made of several modules looks like one tool. Follow it unless
the user's design says otherwise. Good references:
[module-reference](https://github.com/edrys-labs/module-reference),
[module-serial](https://github.com/edrys-labs/module-serial),
[module-pyxtermjs](https://github.com/edrys-labs/module-pyxtermjs),
[module-markdown-it](https://github.com/edrys-labs/module-markdown-it).

## Foundation

```html
<link rel="stylesheet" href="https://edrys-labs.github.io/module/vendor/water.min.css" />
<link rel="stylesheet" href="https://edrys-labs.github.io/module/vendor/open-iconic/css/open-iconic.min.css" />
<script defer src="https://edrys-labs.github.io/module/vendor/alpine.min.js"></script>  <!-- optional -->
```

- **water.css** styles plain HTML and follows the OS light/dark preference. Module CSS must work in both.
- **Icons:** open-iconic, `<span class="oi" data-glyph="media-play" aria-hidden="true"></span>`. No second icon
  set, no emoji as icons.
- **Interactivity:** plain JS, or Alpine.js for small modules with a bit of reactive UI. Built modules (an editor,
  a terminal) use whatever their widget needs. Don't drive the same element from Alpine and from manual DOM code.
- No CSS framework (Tailwind, Bootstrap, Bulma) on top of water.css. A widget's own CSS (xterm, Monaco, KaTeX) is
  fine.
- Module CSS in one file (`style.css`) or one `<style>` block, not in `style=""` attributes.
- Start it with `[hidden] { display: none !important; }`. Without it, any `display: flex` rule on an element
  beats the `hidden` attribute, and controls meant for one role show up for everyone.

## Colour

- Text and surfaces inherit from water.css. No hard-coded white cards, light greys or gradients that only work
  in light mode. Muted text: `opacity: 0.7`, not a fixed grey.
- Status colours, white text on them:

  | State | Colour |
  |-------|--------|
  | on, ok, connected | `#1f7a45` |
  | off, error, disconnected | `#b8384a` |
  | waiting, idle, unknown | `#6b6b6b` |

- Own colours: define them once as custom properties on `:root`, override them under
  `@media (prefers-color-scheme: dark)`.
- Dark widget surfaces (terminals, editors) may keep their own theme; give the wrapper the widget's background
  so there is no seam.

## Layout

- The module fills its iframe. Tiles can be 250 × 200 px or 1030 × 840 px and are resizable: no fixed pixel
  widths, no horizontal scrolling at 320 px, `max-width: 100%` on media. Editor- and terminal-style modules
  scroll inside the content area, not the whole page.
- `body { margin: 0; padding: 0.5rem 0.75rem; }` or similar; water.css's default centred column wastes space in
  a tile.
- **Header row**, when the module has status or controls:

  ```html
  <header class="header">
    <h1 class="title">Sensor Panel</h1>
    <div class="status"><span class="label">Station</span> <span id="badge" class="badge wait">waiting…</span></div>
    <div class="controls"><button id="connect"><span class="oi" data-glyph="link-intact" aria-hidden="true"></span> Connect</button></div>
  </header>
  ```

  ```css
  .header { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; margin-bottom: 0.5rem; }
  .title { font-size: 1.4em; line-height: 1; margin: 0; }
  .status { display: flex; align-items: center; gap: 0.5rem; }
  .status .label { opacity: 0.7; font-size: small; }
  .badge { padding: 0.1rem 0.6rem; border-radius: 999px; color: #fff; font-size: small; background: #6b6b6b; }
  .badge.on { background: #1f7a45; }
  .badge.off { background: #b8384a; }
  .controls { margin-left: auto; display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: small; }
  .controls button, .controls input, .controls select { margin: 0; }
  ```

- Editor and terminal modules may put their controls in a bar under the widget instead, in the widget's theme.
- Content modules (text, slides) skip the header and render content with ~1rem padding.
- Spacing steps 0.25 / 0.5 / 0.75 / 1 rem. Radius 6px for panels, 999px for pills.

## Typography

- The water.css system font. Don't set `font-family` on `html`/`body`.
- Monospace for code, ports, URLs, IDs.
- No ALL-CAPS buttons, no letter-spacing tricks.

## States

Every module shows, in words:

- **loading** until `onReady`, as in module-markdown-it: `<p class="loading">Loading&hellip;</p>`, faded in
  after 0.5 s so fast loads don't flicker, replaced (or its class removed) once there is content:

  ```css
  .loading { opacity: 0; animation: show-loading 0s 0.5s forwards; }
  @keyframes show-loading { to { opacity: 0.6; } }
  ```

- **empty** ("No answers yet", "Waiting for the station to connect a device…");
- **not configured**, saying what to set where ("No content: set `content` in the module settings");
- **error**, saying what failed and what to do ("Terminal server not reachable at http://localhost:5000. Is it
  running?").

Never a blank tile. Status is never colour alone: the badge has text.

## Controls

- water.css buttons; the primary action first; icon + label where it helps.
- Hide controls a role can never use; disable only what is temporarily unavailable (and say why, e.g. "connecting…").
- Every input has a `<label>`; icon-only buttons have `aria-label` and `title`.
- Keep focus outlines visible.
