# Quill Editor

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-quill/index.html`
- **Source:** https://github.com/edrys-labs/module-quill
- **Default rooms (`show-in`):** `*`
- **Description:** A collaborative rich text editor, which can upload multimedia content too. For more information visit: https://github.com/edrys-labs/module-quill
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `editorId` | text |  | Give each Quill module in a room its own id to keep their documents apart. Leave empty for the shared default document. |
| `synchronize` | boolean |  | Share one document across all peers in the room, with live cursors; otherwise each person edits their own copy, kept in their browser |
| `placeholder` | text |  | Shown while the document is empty |
| `toolbar` | radio-button: full / basic |  | basic: text styles, headings, lists, links, images and formulas |
| `maxImageKB` | number |  | Largest image (in KB) that can be added; bigger ones are scaled down first. Images are stored in the shared document, so keep this small. Default: 500. |
| `blockRemoteImages` | boolean |  | Only show images uploaded into the document, not images linked from other websites (which can see who views them). |

**`studentConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `readOnly` | boolean |  | Students can read the shared document but not edit it (use with synchronize) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-quill/index.html
  config:
    # editorId: ''  # text
    # synchronize: false  # boolean
    # placeholder: ''  # text
    # toolbar: full  # radio-button: full | basic
    # maxImageKB: 0  # number
    # blockRemoteImages: false  # boolean
  studentConfig:
    # readOnly: false  # boolean
  showInCustom: '*'
```

<!-- GENERATED:END -->

## Notes

**For:** a rich-text document: shared notes, a lab report written together, a handout the teacher writes
during class ([Quill](https://quilljs.com)), with formulas and images.

**Role configs override `config` key by key.** `studentConfig.readOnly` exists only for students.

| Key | Note |
|-----|------|
| `synchronize` | **Off unless set.** On: one document per room, live cursors. Off: each person writes their own copy, kept in their browser. |
| `editorId` | **Required when two Quill modules share a room**; otherwise they show the same document. |
| `toolbar` | `full` (default) or `basic`. |
| `placeholder` | Text shown while the document is empty. |
| `maxImageKB` | Largest image, default 500. Images live in the shared document; keep it small. |
| `blockRemoteImages` | Only show uploaded images, not ones linked from other sites (which can see the viewers). |
| `studentConfig.readOnly` | Students read but can't edit; use with `synchronize` for a teacher's handout. |

**Example** (a handout the teacher writes live, read-only for students):

```yaml
- url: https://edrys-labs.github.io/module-quill/index.html
  config:
    synchronize: true
    editorId: handout
    toolbar: basic
  studentConfig:
    readOnly: true
  showInCustom: lobby
  width: full
  height: tall
```

**Pitfalls:**

- Anyone who can edit can clear the whole document for everyone; there is no shared undo. Use `readOnly` for
  students when the document matters.
- Only YouTube and Vimeo videos can be embedded.
