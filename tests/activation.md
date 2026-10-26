# Activation tests

Checks that each skill's `description` makes agents load the right skill, and only then. Run them after every
change to a `description`.

## How to run

1. Install both skills in an agent (e.g. `npx skills add edrys-labs/skills -a claude-code`), plus any other
   skills you normally use: a test only means something when other skills compete for the prompt.
2. For each prompt, start a **fresh session** and send the prompt as the first message.
3. Note which skill the agent loads before it answers (in Claude Code: the `Skill` call). Stop there; the
   answer itself is not tested here.
4. A row passes when the loaded skill matches **Expected**. `none` means neither edrys skill loads.

Every failure is a description problem: add the missing trigger, or sharpen the line that hands over to the
other skill.

## edrys-lab

| # | Prompt | Expected |
|---|--------|----------|
| L1 | Build a remote lab where students program an ESP32 at a station and watch it through a webcam. | edrys-lab |
| L2 | Erstelle eine Edrys-Klasse mit drei Gruppenräumen, in jedem ein Whiteboard. | edrys-lab |
| L3 | Here is my classroom.yml. Students press Execute and nothing happens. | edrys-lab |
| L4 | Add a deploy button to the README of my lab repository. | edrys-lab |
| L5 | How do I set up the computer next to the Arduino so students in Edrys can upload code to it? | edrys-lab |
| L6 | Make a simulated micro:bit lab for 25 students, no hardware. | edrys-lab |
| L7 | Can I hide the solutions from students in my Edrys lab? | edrys-lab |
| L8 | Füge meinem Edrys-Labor am Ende einen Fragebogen hinzu. | edrys-lab |

## edrys-module

| # | Prompt | Expected |
|---|--------|----------|
| M1 | Write an Edrys module that plots the serial data a sensor at the station sends. | edrys-module |
| M2 | The settings form of my module is empty in edrys-Lite. | edrys-module |
| M3 | Schreibe ein Edrys-Modul für eine Abstimmung, die die Lehrkraft startet. | edrys-module |
| M4 | `Edrys.onMessage` never fires for the messages the code editor sends. | edrys-module |
| M5 | Turn my module's index.html into a single YAML module. | edrys-module |
| M6 | Write tests for my module with edrys-module-tests. | edrys-module |
| M7 | Late joiners don't see what the others already typed in my module. | edrys-module |
| M8 | Review my Edrys module before I publish it on GitHub Pages. | edrys-module |

## Between the two

The prompt touches both skills; only one fits.

| # | Prompt | Expected |
|---|--------|----------|
| B1 | Add a camera to my Edrys lab. | edrys-lab (the streaming module exists) |
| B2 | Which Edrys module should I use to show the task description? | edrys-lab |
| B3 | Two code editors in my classroom file show the same text. | edrys-lab |
| B4 | No Edrys module controls my oscilloscope at the station. Write one. | edrys-module |
| B5 | Change the source of the Edrys markdown-it module so it supports Mermaid diagrams. | edrys-module |

## Neither

Close to the domain, but not about edrys-Lite.

| # | Prompt | Expected |
|---|--------|----------|
| N1 | Write a LiaScript course on Arduino basics. | none |
| N2 | Create a Moodle course with a quiz on Linux commands. | none |
| N3 | Build a Docker image with avr-gcc and avrdude for our CI. | none |
| N4 | Set up a WebRTC video call between two browsers. | none |
| N5 | Write a Web Serial page that reads an Arduino's output. | none |
