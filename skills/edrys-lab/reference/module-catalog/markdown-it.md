# Markdown-IT

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-markdown-it/index.html`
- **Source:** https://github.com/edrys-labs/module-markdown-it
- **Default rooms (`show-in`):** `*`
- **Inlined** (data: URL): runs with an opaque origin
- **Description:** Write Markdown as task-descriptions for your students, this markdown interpreter additionally allows to integrate formulas, ASCII-art and videos. For more information, see https://github.com/edrys-labs/module-markdown-it
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `content` | code-area |  | Content to be shown for all roles |

**`studentConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `content` | code-area |  | Content to be shown for students |

**`teacherConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `content` | code-area |  | Content to be shown for teachers |

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `content` | code-area |  | Content to be shown just in stations |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-markdown-it/index.html
  config:
    # content: ''  # code-area
  studentConfig:
    # content: ''  # code-area
  teacherConfig:
    # content: ''  # code-area
  stationConfig:
    # content: ''  # code-area
  showInCustom: '*'
```

<!-- GENERATED:END -->

## Notes

**For:** task descriptions, instructions, teacher notes and setup guides. Nearly every lab has at least one.
Renders Markdown with KaTeX formulas (`$…$`, `$$…$$`), highlighted code, raw HTML (e.g. a YouTube `<iframe>`)
and Mermaid diagrams. No shared state, no messages: every peer renders its own copy.

**Role configs are appended, not overridden:** each role sees `config.content` followed by the `content` of its
own role config (`studentConfig`, `teacherConfig`, `stationConfig`). Empty ones are skipped. So put the shared text in
`config` and only role-specific additions in the role configs.

**Example** (a lobby description, plus notes for teachers and the person running the station):

```yaml
- url: https://edrys-labs.github.io/module-markdown-it/index.html
  config:
    content: |
      # Blink an LED

      1. Enter a station from the side menu.
      2. Edit the code and press **Execute**.
  teacherConfig:
    content: |
      > **Teachers:** open a station via `Settings → Stations` first.
  stationConfig:
    content: |
      ## Station setup

      ```bash
      docker run -it -p 127.0.0.1:5000:5000 --device=/dev/ttyACM0 edryslabs/module-pyxtermjs:latest
      ```
  showInCustom: '*'
  width: full
  height: huge
```

**Common setups:**

- Several instances with different `showInCustom`: one in the `lobby` (overview), one in `station` (the task
  at the station), one per group room (`Room 1`, `Room 2`, …).
- `stationConfig.content` is the right place for instructions to whoever runs the station computer (Docker
  command, wiring). Students in the station room don't see it.

**Pitfalls:**

- Use `content: |`, never `content: >`: folded blocks join lines and break lists, code blocks and diagrams.
- `teacherConfig` hides text in the interface only; students can read it with the browser's developer tools.
  Don't put solutions there that must stay secret.
- PlantUML, DOT and ditaa diagrams are rendered by the public plantuml.com server, which receives the diagram
  source from every viewer's browser. Prefer Mermaid.
- Markdown links open in a new tab; HTML links (`<a>`) only do so with `target="_blank"`.
