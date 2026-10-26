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

**Example prompts:**

- *"Build a remote lab for an Arduino Uno: students write code in an editor, it is compiled and uploaded at the station, and they watch the board through a webcam."*
- *"Make an Arduino lab without hardware for 30 students, each working on their own simulated board."*
- *"Erstelle ein Edrys-Labor für einen Linux-Kurs mit einer gemeinsamen Shell und einer Aufgabenbeschreibung."*
- *"Students in my lab press Execute and nothing happens. Here is my classroom file."*
- *"Turn this lab into a GitHub repository with a deploy button."*

**Tested example labs** in [skills/edrys-lab/examples/](skills/edrys-lab/examples/):

| Example | Shows |
|---------|-------|
| [avr8js-simulation.yaml](skills/edrys-lab/examples/avr8js-simulation.yaml) | no station: editor and simulated Arduino, each student on their own |
| [terminal.yaml](skills/edrys-lab/examples/terminal.yaml) | a shared Linux shell from a station |
| [arduino.yaml](skills/edrys-lab/examples/arduino.yaml) | real Arduino: shared editor, camera, terminal that compiles and uploads |
| [micropython-web-serial.yaml](skills/edrys-lab/examples/micropython-web-serial.yaml) | a board's REPL via Web Serial, no server at the station |

---

## edrys-module

Guides the development of an edrys-Lite module, as an HTML page or a single YAML file: the `edrys.js` API, `<meta>` declarations and the `module-config` form schema, roles and stations, when to use messages, shared Yjs state or streams, a consistent look, end-to-end tests with [edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests), and publishing via GitHub Pages.

**Activates when:** a user wants to write, extend, or debug an edrys-Lite module ("write an Edrys module", "share a sensor from the station", "Modul für Edrys schreiben"), or works with `edrys.js`, `Edrys.onMessage`, `Edrys.getState` or `module-config`.

**Example prompts:**

- *"Write an Edrys module that shows the temperature a sensor at the station reports over serial."*
- *"Make a module where the teacher asks a question and students vote; the teacher sees the results live."*
- *"Schreibe ein Edrys-Modul, mit dem Studierende gemeinsam eine Checkliste abhaken."*
- *"My module doesn't receive the messages the editor sends. Why?"*
- *"Review my module before I publish it, and write tests for it with edrys-module-tests."*

**Tested example modules** in [skills/edrys-module/examples/](skills/edrys-module/examples/):

| Example | Shows |
|---------|-------|
| [minimal/](skills/edrys-module/examples/minimal/index.html) | the skeleton: meta tags, config per role, a message to the room |
| [countdown/](skills/edrys-module/examples/countdown/module.yml) | a YAML module; a teacher-only control; state that late joiners see |
| [shared-checklist/](skills/edrys-module/examples/shared-checklist/index.html) | shared Yjs state everyone edits, awareness ("viewing") |
| [serial-bridge/](skills/edrys-module/examples/serial-bridge/index.html) | a station module: Web Serial at the station, input and output as messages |

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

### Claude.ai (web and desktop app)

Skills can be uploaded to [claude.ai](https://claude.ai) as ZIP files, one per skill. Code execution must be enabled
(Settings → Capabilities).

1. Download the ZIPs of the [latest release](https://github.com/edrys-labs/skills/releases/latest):
   [edrys-lab.zip](https://github.com/edrys-labs/skills/releases/latest/download/edrys-lab.zip),
   [edrys-module.zip](https://github.com/edrys-labs/skills/releases/latest/download/edrys-module.zip).

2. Upload them under Customize → Skills, and switch them on.

To build the ZIPs from `main` yourself, with the skill folder at the top level of each:

```bash
git clone https://github.com/edrys-labs/skills && cd skills/skills
zip -r edrys-lab.zip edrys-lab -x '*/node_modules/*'
zip -r edrys-module.zip edrys-module -x '*/node_modules/*'
```

All guidance and examples work there. The helper scripts (validate a lab, check a module) run in Claude's sandbox
only if its network access reaches the npm registry and `edrys-labs.github.io`; otherwise Claude checks the files
by hand against the reference files. Steps that need your own computer (a local dev server, a station, browser
tests) become instructions for you.

### Which one to use

| Task | claude.ai | Local agent (Claude Code, Copilot, Cursor, …) |
|------|-----------|-----------------------------------------------|
| Write a lab, choose and configure modules | ✓ | ✓ |
| Validate a lab against the published modules | if the sandbox can reach them | ✓ |
| Write a module | ✓ (as files to download) | ✓ (in your repository) |
| Try a module in edrys-Lite from a local server | – | ✓ |
| End-to-end tests with [edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests) | – | ✓ |
| Set up a station (Docker, serial ports, camera) | instructions only | ✓ |

Teachers who build labs from existing modules can use either. For developing modules or setting up stations, use a
local agent: testing with several peers, the dev server and the hardware all need your own machine.

---

## Limitations

The skills give an AI agent knowledge and checks it would otherwise lack, but they don't guarantee a correct result.
Agents still make mistakes, more often on complex tasks: labs with several stations or rooms, new hardware, modules
with shared state or streams. Review what the agent produces and test it in edrys-Lite before you use it in a class:

- load the lab or module in a real classroom, with a second browser as a student and, if needed, the station;
- check that the hardware, ports and wiring match the configuration (the validators can't see them);
- read code the agent wrote before running it at a station that controls real devices.

---

## Related

- [edrys-Lite](https://github.com/edrys-labs/edrys-Lite) · [hosted app](https://edrys-labs.github.io)
- [edrys-Lite documentation](https://github.com/edrys-labs/documentation)
- [Lab repositories (`edrys-lab` topic)](https://github.com/topics/edrys-lab)
- [Module repositories (`edrys-module` topic)](https://github.com/topics/edrys-module)
- [edrys-module-tests](https://github.com/edrys-labs/edrys-module-tests)
- [Agent Skills specification](https://agentskills.io/specification)
- [npx skills CLI](https://github.com/vercel-labs/skills)