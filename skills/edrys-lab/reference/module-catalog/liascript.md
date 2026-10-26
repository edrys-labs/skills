# LiaScript

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-liascript/index.html`
- **Source:** https://github.com/edrys-labs/module-liascript
- **Default rooms (`show-in`):** `*`
- **Description:** Interactive LiaScript courses (quizzes, surveys, code, animations) from a course URL or Markdown, optionally synced within a room. For more information see https://github.com/edrys-labs/module-liascript
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `course` | text |  | URL of a LiaScript course, i.e. its raw Markdown (e.g. https://raw.githubusercontent.com/.../README.md); used instead of content |
| `content` | code-area |  | LiaScript Markdown of the course, used when course is empty |
| `classroom` | boolean |  | Classroom mode: share quiz and survey results and a chat between the users of a room (the Lobby too); each user joins with connect in the LiaScript classroom dialog |
| `player` | text |  | LiaScript player to use, e.g. a pinned or self-hosted build (default https://liascript.github.io/course/) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-liascript/index.html
  config:
    # course: ''  # text
    # content: ''  # code-area
    # classroom: false  # boolean
    # player: ''  # text
  showInCustom: '*'
```

<!-- GENERATED:END -->

## Notes

**For:** interactive course content inside a lab: a [LiaScript](https://liascript.github.io) course with quizzes,
surveys, animations, executable code and text-to-speech, instead of plain Markdown. With `classroom`, the users
of a room share quiz results and a chat. For writing the course itself, use the `liascript-syntax` skill from
[LiaScript/skills](https://github.com/LiaScript/skills) if it is installed.

**Only `config` is read.**

| Key | Note |
|-----|------|
| `course` | URL of the course's raw Markdown (e.g. a `raw.githubusercontent.com/.../README.md`). Wins over `content`. |
| `content` | The course as LiaScript Markdown, inline. Used when `course` is empty. |
| `classroom` | Share quiz/survey results and a chat between the users of each room. Each user joins with **connect** in LiaScript's classroom dialog. |
| `player` | LiaScript player URL; default `https://liascript.github.io/course/`. Set it to pin a version or self-host. |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-liascript/
  config:
    course: https://raw.githubusercontent.com/<owner>/<repo>/main/README.md
    classroom: true
  showInCustom: lobby
  width: full
  height: huge
```

**Pitfalls:**

- `course` must be a raw URL that allows cross-origin requests (`raw.githubusercontent.com` does; a
  `github.com/.../blob/...` page does not).
- In classroom mode each room is its own LiaScript classroom: users who change rooms join a different one.
- For simple task descriptions [markdown-it](markdown-it.md) is lighter and supports per-role content; use
  LiaScript when the content needs quizzes or interactivity.
