# Skills

A collection of [Agent Skills](https://agentskills.io) for [edrys-Lite](https://edrys-labs.github.io), the browser-based platform for remote labs and virtual classrooms. Compatible with GitHub Copilot, Claude Code, Cursor, Gemini CLI, and [50+ other agents](https://agentskills.io/clients).

---

## Available Skills

| Skill | Description |
|-------|-------------|
| [edrys-lab](skills/edrys-lab/) | Create edrys-Lite labs (classroom configurations) — pick and configure modules, lay out rooms and stations, and publish a lab repository with a deploy button |
| [edrys-module](skills/edrys-module/) | Develop edrys-Lite modules — the `edrys.js` API, meta tags and config forms, messaging, shared state and streams, testing and publishing |

---

## edrys-lab

Creates a ready-to-import classroom configuration (YAML) for edrys-Lite: chooses modules from the edrys-labs catalog, configures them per role (`config`, `studentConfig`, `teacherConfig`, `stationConfig`), places them in the Lobby, rooms and stations, and validates the result. On request it also creates a full lab repository with a README, a deploy button, media and the setup the station computer needs (e.g. a Docker-based terminal server).

**Activates when:** a user wants to create, edit, or debug an edrys-Lite lab, classroom or remote lab ("build a remote Arduino lab", "make a deploy button for my lab", "Edrys-Labor erstellen"), or edits a classroom `.yaml`/`.json` meant for edrys-Lite.

---

## edrys-module

Guides the development of an edrys-Lite module, as an HTML page or a single YAML file: the `edrys.js` API, `<meta>` declarations and the `module-config` form schema, roles and stations, when to use messages, shared Yjs state or streams, a consistent look, end-to-end tests with [edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests), and publishing via GitHub Pages.

**Activates when:** a user wants to write, extend, or debug an edrys-Lite module ("write an Edrys module", "share a sensor from the station", "Modul für Edrys schreiben"), or works with `edrys.js`, `Edrys.onMessage`, `Edrys.getState` or `module-config`.

---

## Installation

### Via `npx skills` (recommended)

[`npx skills`](https://github.com/vercel-labs/skills) is the open CLI for the Agent Skills ecosystem. It auto-detects installed agents and places skills in the correct directories.

```bash
# Preview skills in this repo before installing
npx skills add edrys-labs/skills --list

# Install all skills (interactive — detects your agents)
npx skills add edrys-labs/skills

# Install a specific skill
npx skills add edrys-labs/skills --skill edrys-lab
npx skills add edrys-labs/skills --skill edrys-module

# Install to all agents without prompts
npx skills add edrys-labs/skills --all

# Install as personal skills (available across all projects)
npx skills add edrys-labs/skills --global

# Install for a specific agent
npx skills add edrys-labs/skills -a claude-code
npx skills add edrys-labs/skills -a github-copilot
npx skills add edrys-labs/skills -a cursor
```

#### Other useful commands

```bash
npx skills list                  # List all installed skills
npx skills update                # Update installed skills
npx skills remove edrys-lab      # Remove a skill
```

---

### Manual Installation

Copy the skill directory into the skills folder for your agent:

**Project scope** (skills available only in the current project):

| Agent                                     | Directory           |
|-------------------------------------------|---------------------|
| GitHub Copilot, Cursor, Gemini CLI, Codex | `.agents/skills/`   |
| Claude Code                               | `.claude/skills/`   |
| Roo Code                                  | `.roo/skills/`      |
| Windsurf                                  | `.windsurf/skills/` |

```bash
# Example: install for Claude Code (project scope)
cp -r skills/edrys-lab .claude/skills/
cp -r skills/edrys-module .claude/skills/
```

**Personal scope** (skills available across all projects):

| Agent          | Directory            |
|----------------|----------------------|
| GitHub Copilot | `~/.copilot/skills/` |
| Claude Code    | `~/.claude/skills/`  |
| Any agent      | `~/.agents/skills/`  |

---

## Related

- [edrys-Lite](https://github.com/edrys-labs/edrys-Lite) · [hosted app](https://edrys-labs.github.io)
- [edrys-Lite documentation](https://github.com/edrys-labs/documentation)
- [Lab repositories (`edrys-lab` topic)](https://github.com/topics/edrys-lab)
- [Module repositories (`edrys-module` topic)](https://github.com/topics/edrys-module)
- [edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests)
- [Agent Skills specification](https://agentskills.io/specification)
- [npx skills CLI](https://github.com/vercel-labs/skills)
