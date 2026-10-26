# Rooms, `showInCustom` and module size

Checked against edrys-Lite 3.1.0 (`scrapedModulesFilter` and `checkRoomMatch` in
`src/components/Modules.vue`, the design form in `src/components/Settings/Module.vue`).

## Rooms

| Room | Who is there |
|------|--------------|
| **Lobby** | Everybody on entering the classroom. |
| **Room 1 … Room N** | Created by `meta.defaultNumberOfRooms` (or by the teacher during class). For group work. |
| **Station \<name\>** | Opened by a station window (`…/?/station/<id>`). The station device stays there; students enter it to use what it shares (hardware, terminal, camera). |

## `showInCustom`

A comma-separated list. A module appears in a room when any entry matches it.

| Entry | Matches |
|-------|---------|
| `*` | every room (default) |
| `lobby` | the Lobby |
| `station` | every station room |
| `Room 1` | exactly that room: whole name, so `Room 1` does not match `Room 10` |
| `Room *` | `*` is a wildcard: every room whose name starts with `Room ` |
| `Station *` | same as `station` |

Two flags restrict who sees the module. They must be **combined with a room entry**: a flag on its own
matches no room, so the module never appears.

| Flag | Effect |
|------|--------|
| `teacher-only` | only teachers see it |
| `station-only` | only the station device itself sees it, not the students in the station room |

Matching is case-insensitive for room names, but the flags must be written exactly in lowercase
(`teacher-only`, `station-only`). `Teacher-only` is not recognized as a flag and is treated as a room
name instead, so the module is shown to everybody. If both flags are given, only `teacher-only` takes
effect.

The localized names from the edrys-Lite interface (`nur Lehrer`, `Raum 1`, …) are accepted too, but
always write the English form in a lab file.

### Patterns

| Goal | `showInCustom` |
|------|----------------|
| Task description in the Lobby | `lobby` |
| Instructions for every room | `*` |
| Notes only the teacher sees, everywhere | `*, teacher-only` |
| Tool for the students at a station (editor, terminal, camera view) | `station` |
| Hardware connection only the station computer needs (e.g. the serial port picker) | `station, station-only` |
| The same exercise in every group room | `Room *` |
| Different exercises per group | one module entry per room: `Room 1`, `Room 2`, … |

A room without any module shows a short note instead.

## Size

`width` and `height` set the module's initial size in the grid. Users can still resize modules by
dragging; that size only lasts until the page is reloaded and is never stored in the lab.

Use exactly the values the settings form saves:

| `width` | Form label | Size |
|---------|------------|------|
| `full` | Full | full width of the grid |
| `half` | Half | about half (510px) |
| `third` | Quarter (250px) | 250px (despite its name, a quarter) |
| number, e.g. `700` | Custom | that many pixels |

| `height` | Form label | Size |
|----------|------------|------|
| `huge` | Huge | 830px |
| `tall` | Tall | 720px |
| `medium` | Medium | 410px |
| `short` | Short | 200px |
| number, e.g. `500` | Custom | that many pixels |

Any other value falls back to the smallest size (250 × 200px), so a typo shows up as a tiny module.

Rules of thumb:

- Text, editors, terminals: `width: full`, `height: huge` or `tall`.
- Two tools side by side (editor + terminal, terminal + camera): `width: half` for both.
- Small status or control modules: `third` / `short`.
