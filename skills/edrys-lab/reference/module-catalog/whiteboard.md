# Live Whiteboard

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-whiteboard/index.html`
- **Source:** https://github.com/edrys-labs/module-whiteboard
- **Default rooms (`show-in`):** `*`
- **Description:** Collaborative whiteboard for Edrys classrooms, one board per room, built on Excalidraw. For more information visit: https://github.com/edrys-labs/module-whiteboard
- **Schema read:** 2026-10-27

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `synchronize` | boolean |  | Share one board across all peers in the room, drawn on together in real time; otherwise each peer draws on their own board |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-whiteboard/index.html
  config:
    # synchronize: false  # boolean
  showInCustom: '*'
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** drawing together: sketches, circuit drafts, brainstorming ([Excalidraw](https://excalidraw.com)).
With `synchronize` the room shares one board, kept in the room's state for late joiners.

**Only `config` is read**, so the whole room either shares the board or nobody does.

| Key | Note |
|-----|------|
| `synchronize` | **Off unless set.** Off: each person draws alone, and the board is lost on reload. |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-whiteboard/index.html
  config:
    synchronize: true
  showInCustom: Room *
  width: full
  height: huge
```

**Pitfalls:**

- Two whiteboard modules in the same room show the same board; there is no id to separate them. Place them in
  different rooms instead.
- Pasted images are stored in the room's state and synced to every peer: keep them few and small.
