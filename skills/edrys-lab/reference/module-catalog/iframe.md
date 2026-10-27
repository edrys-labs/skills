# IFrame

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-iframe/index.html`
- **Source:** https://github.com/edrys-labs/module-iframe
- **Default rooms (`show-in`):** `*`
- **Inlined** (data: URL): runs with an opaque origin
- **Description:** Helper for embedding any kind of external resource (use either src or srcdoc). For more information see https://github.com/edrys-labs/module-iframe
- **Schema read:** 2026-10-27

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `src` | text |  | URL of the page to embed, for every role (the site must allow being embedded) |
| `srcdoc` | code-area |  | HTML to show instead, used when src is empty |

**`studentConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `src` | text |  | Page for students only; replaces the general config |
| `srcdoc` | code-area |  | HTML for students only; replaces the general config |

**`teacherConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `src` | text |  | Page for teachers only; replaces the general config |
| `srcdoc` | code-area |  | HTML for teachers only; replaces the general config |

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `src` | text |  | Page for stations only; replaces the general config |
| `srcdoc` | code-area |  | HTML for stations only; replaces the general config |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-iframe/index.html
  config:
    # src: ''  # text
    # srcdoc: ''  # code-area
  studentConfig:
    # src: ''  # text
    # srcdoc: ''  # code-area
  teacherConfig:
    # src: ''  # text
    # srcdoc: ''  # code-area
  stationConfig:
    # src: ''  # text
    # srcdoc: ''  # code-area
  showInCustom: '*'
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** embedding any web page (a simulator, a video, documentation, an online tool) or a piece of HTML.
No shared state: every peer loads the page on its own.

**Role configs replace `config`:** a role config that sets `src` or `srcdoc` replaces the general one for that
role; empty role configs fall back to `config`. Use it to show students the exercise and teachers the solution.

| Key | Note |
|-----|------|
| `src` | URL of the page. |
| `srcdoc` | HTML to show instead, used when `src` is empty. |

**Example** (exercise for everyone, solution for teachers):

```yaml
- url: https://edrys-labs.github.io/module-iframe/index.html
  config:
    src: https://www.falstad.com/circuit/circuitjs.html
  teacherConfig:
    src: https://www.falstad.com/circuit/circuitjs.html?ctz=<solution-circuit>
  showInCustom: lobby
  width: full
  height: huge
```

**Pitfalls:**

- Many sites (Google, GitHub, most learning platforms) refuse to be embedded; the frame stays empty or says
  "refused to connect". Look for the site's embed URL (e.g. `https://www.youtube.com/embed/<id>`).
- The teacher's solution URL is visible to students in the classroom configuration (developer tools).
- Scripts in `srcdoc` can use the module's access to Edrys (send messages, change shared state): only paste HTML
  you trust.
