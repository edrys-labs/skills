# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, GitHub Copilot, Cursor, Gemini CLI, …) working on this repository.

## What this repository is

A collection of [Agent Skills](https://agentskills.io) for [edrys-Lite](https://github.com/edrys-labs/edrys-Lite), the browser-based platform for remote labs and virtual classrooms. Skills are portable, agent-agnostic instruction packages. There is no build, lint, or test tooling: the content is Markdown/YAML, plus a few helper scripts inside some skills, consumed directly by AI agents via the `npx skills` CLI or a manual copy into an agent's skills directory.

Each skill is a self-contained "mini system prompt" that an agent loads on demand when its `description` matches the user's request. Because the `description` field is the *only* signal agents use to decide whether to activate a skill, it is the most important content in the repo.

This file is for working *on* the repository. `npx skills add` only installs the folders under `skills/`, so nothing here reaches the users of the skills.

## Repository layout

```
skills/<skill-name>/
  SKILL.md            # required: YAML frontmatter (name, description, license) + instructions
  examples/           # optional: ready-made reference files linked from SKILL.md
  reference/          # optional: topic files linked from SKILL.md
  scripts/            # optional: helper scripts the skill tells the agent to run
tests/
  activation.md        # prompts that must (or must not) load each skill; not installed
tools/                 # maintainer scripts, not installed with the skills
  build-catalog.mjs    # refreshes the GENERATED part of skills/edrys-lab/reference/module-catalog/
  catalog-modules.json # modules in the catalog: file name, published URL, repo
README.md              # human-facing catalog — one table row + one section per skill
AGENTS.md              # this file; CLAUDE.md only imports it
LICENSE                # repo-level MIT license (distinct from each skill's own license field)
```

The list of published skills lives in `README.md`; it is not repeated here so it cannot go stale. Adding a skill means adding a `skills/<name>/SKILL.md` directory — there is no registry or index file to update besides `README.md`. A skill's reference material can be nested as deep as its structure needs.

## Working on a skill

- **`description` is the activation trigger, not documentation.** It must state concretely *when* to use the skill — include example user phrasings, including German ones ("Edrys-Labor erstellen", "Modul für Edrys schreiben"). Vague descriptions ("helps with X") cause agents to miss or misfire the skill.
- After changing a `description`, run the prompts in [`tests/activation.md`](tests/activation.md); add a row for
  every new trigger or misfire you find.
- For descriptions longer than a single sentence, use a YAML block scalar (`description: >`) rather than one giant single-line string.
- Keep `description` at **1024 characters or less** (after YAML folding) and `name` at 64 or less, lowercase and hyphens. No `<` or `>` in either: write "meta tags", not `<meta>`. claude.ai rejects a skill ZIP
  that breaks any of these rules.
- Every `SKILL.md` must open with the three required frontmatter fields: `name`, `description`, `license`. `name` must match the folder name. A missing or thin `description` is a bug.
- `license` in frontmatter is per skill (`CC0-1.0` for all skills) and independent of the repository's own `LICENSE` file (MIT, for the repo's own code/structure).
- **Naming:** skills start with `edrys-`.
- **Portable content only.** Skills are public. Never write a path into one person's machine (`/home/...`, `C:\Users\...`) into a skill; refer to sources by their GitHub URL, and put everything the agent needs inside the skill folder.
- Long skills put copy-paste-ready reference material in `examples/` or `reference/` and link to it from `SKILL.md` rather than inlining everything.
- Skills encode hard-won operational gotchas as explicit rules (e.g. "YAML and `fetch` modules run on a `data:` URL, so `Edrys.setItem` does not work there"). When editing, preserve these callouts — they exist because of specific past failures, not generic advice.
- **Scripts** inside a skill are called with paths relative to the skill folder (`node scripts/validate-lab.mjs lab.yaml`), never with a path into one person's home directory. Keep them dependency-free where possible; name any required external tool in `SKILL.md`.
- **Cross-reference, don't duplicate.** When two skills touch the same topic (`edrys-lab` uses modules, `edrys-module` builds them), one explains it and the other points to it by skill name.
- **Module catalog:** each file in `skills/edrys-lab/reference/module-catalog/` has a part between `GENERATED` markers, which `node tools/build-catalog.mjs` rewrites from the published module (run `npm install --prefix skills/edrys-lab/scripts` once). Write by hand only outside the markers. To add a module, add it to `tools/catalog-modules.json` and run the tool.
- **Examples must work.** Every example lab or module is loaded in a real edrys-Lite before it is committed.

## Ground truth

The skills are checked against the source, not against memory or older docs:

| Topic | Source |
|-------|--------|
| Module API (`Edrys.*`) | [`src/api/edrys.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/api/edrys.ts) |
| Module meta tags, YAML modules | `scrapeModule` in [`src/ts/Utils.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/ts/Utils.ts) |
| `module-config` field types | [`src/components/Settings/ModuleConfigForm.vue`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/components/Settings/ModuleConfigForm.vue) |
| Classroom config import / deploy | [`src/views/Deploy.vue`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/views/Deploy.vue), [`src/ts/Utils.ts`](https://github.com/edrys-labs/edrys-Lite/blob/main/src/ts/Utils.ts) |
| User documentation | [edrys-labs/documentation](https://github.com/edrys-labs/documentation) |

If the documentation and the source disagree, the source wins. Behaviour that changed between edrys-Lite releases is written with the version it depends on (e.g. "since edrys-Lite 3.1.0 …").

## Updating `README.md`

`README.md` is a manually maintained catalog, not generated. When adding, renaming, or removing a skill, update in lockstep:
1. The summary table near the top (`| Skill | Description |`).
2. That skill's own `##` section with a longer description and an "Activates when:" line.
3. The `npx skills add edrys-labs/skills --skill <name>` example commands.
4. Cross-references to the skill's name in other skills.

The repo/owner slug used throughout install examples is `edrys-labs/skills` — keep it consistent.

## Domain context worth knowing

- **edrys-Lite** is serverless: a classroom lives in the browsers of its members and is synced peer to peer (WebRTC, Yjs). There is no backend that stores labs. It is hosted at https://edrys-labs.github.io.
- **Classroom / lab:** a configuration (YAML or JSON) with metadata, members and a list of modules. Labs are shared as files; `https://edrys-labs.github.io/?/deploy/<url>` creates a new classroom from a hosted config. Lab repos carry the GitHub topic `edrys-lab`.
- **Rooms:** every classroom has a Lobby and optional extra rooms. A **station** is a browser window (often on a computer with hardware attached) that opens a room of its own and shares devices, terminals or cameras with the people who enter it.
- **Modules** are web pages loaded in iframes, each configured per role (`config`, `studentConfig`, `teacherConfig`, `stationConfig`) and placed in rooms via `showInCustom`. They talk to edrys-Lite through `edrys.js`. Module repos carry the GitHub topic `edrys-module`; most live under https://github.com/edrys-labs.
- **Module tests:** [edrys-labs/edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests) runs modules in a real edrys-Lite with real peers (Playwright).
