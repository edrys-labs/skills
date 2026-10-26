# Lab repository

A lab repository publishes a lab on GitHub so others can open it with one click. Create one only when the user
asks for it; otherwise the classroom file alone is the result.

Checked against edrys-Lite 3.1.0 (the `/deploy/:url` route in `src/index.ts`, `src/views/Deploy.vue`).

## Layout

```
lab-<topic>/
  README.md               # what the lab is, deploy button, station setup
  LICENSE                 # CC0-1.0 unless the user wants another license
  laboratory/
    <topic>.yaml          # the classroom configuration; several variants side by side are fine
  media/
    logo.jpg              # shown on the classroom card (meta.logo)
    screenshot.png        # optional, for the README
  docker-compose.yml      # optional: station servers, see below
  Dockerfile              # optional: only for a terminal server with extra tools
```

- Name the repository `lab-<topic>` (`lab-arduino-basics`, `lab-web-serial`): that is how the edrys-labs labs
  are named.
- Add the GitHub topic **`edrys-lab`** so the lab is listed at https://github.com/topics/edrys-lab:
  `gh repo edit <owner>/<repo> --add-topic edrys-lab`.
- Only YAML. Old labs ship the same lab as `.json` too; that is not needed.
- `meta.logo` points to the logo's raw URL:
  `https://raw.githubusercontent.com/<owner>/<repo>/main/media/logo.jpg`. The image is fetched by every
  member's browser: keep it small (a few hundred KB at most).

## Deploy link

```
https://edrys-labs.github.io/?/deploy/https://raw.githubusercontent.com/<owner>/<repo>/main/laboratory/<topic>.yaml
```

- Opening it creates a **new classroom owned by whoever clicks it**, filled from the file. It never changes an
  existing classroom, so the link can be shared publicly.
- The part after `/deploy/` is taken exactly as written and passed to `fetch()`: write the raw URL as is,
  **not percent-encoded**, and without a `#` in it.
- Use the `raw.githubusercontent.com` URL. A `github.com/.../blob/...` link returns an HTML page, and the
  deploy fails with "not a classroom". GitHub Pages URLs also work (they allow CORS).
- The link always deploys the file's current state on that branch. To keep a fixed version, link a tag
  instead of `main`.
- The deploy link only works once the repository is public and pushed.

The same raw URL can be pasted into `Settings → Share` of an existing classroom to load the lab there.

## README template

Fill in the placeholders; drop the station section for a simulation-only lab.

````markdown
# Lab: <Title>

<One or two sentences: what students do in this lab and what they learn.>

![Screenshot](media/screenshot.png)

[<img src="https://img.shields.io/badge/%F0%9F%9A%80%20-%20Deploy%20Lab%20-%20light?style=plastic" height="25" />](https://edrys-labs.github.io/?/deploy/https://raw.githubusercontent.com/<owner>/<repo>/main/laboratory/<topic>.yaml)

The button creates a new classroom in your browser, with you as its owner. To load the lab into an existing
classroom instead, paste this URL in `Settings → Share`:

https://raw.githubusercontent.com/<owner>/<repo>/main/laboratory/<topic>.yaml

## Modules

| Module | Room | Job |
|--------|------|-----|
| [Markdown-IT](https://github.com/edrys-labs/module-markdown-it) | Lobby | task description |
| [Code Editor](https://github.com/edrys-labs/module-monaco-editor) | Station | students write the code |
| [PyxTerm.js Terminal](https://github.com/edrys-labs/module-pyxtermjs) | Station | compiles and uploads it |
| [Video Stream](https://github.com/edrys-labs/module-streaming) | Station | shows the board |

## Station

**Hardware:** <board> on USB, a webcam pointing at it, a computer with Docker.

1. Plug in the board, then start the terminal server:

   ```bash
   docker run -it -p 127.0.0.1:5000:5000 --device=/dev/ttyACM0:/dev/ttyACM0 edryslabs/module-pyxtermjs:latest
   ```

2. In the classroom, add the station computer's User ID (⋮ menu, opened on that computer) as a teacher in
   `Settings → Members`.
3. Open the link from `Settings → Stations` on the station computer and allow the camera.

## Using the lab

1. Share the classroom link with your students.
2. Students enter the station room, edit the code and press **Execute**.

## License

<CC0-1.0 / your license>
````

Rules for the README:

- Describe the current flow only: deploy button or `Settings → Share`. Old READMEs tell teachers to click
  "write protection"; that feature was removed from edrys-Lite.
- Give the exact `docker run` line for the lab's workflow, with the `edryslabs/...` image and the port the lab's
  `stationConfig` uses (see [stations.md](stations.md)). Never `crosslab/edrys_pyxtermjs`.
- Keep the module table in sync with the lab file.

## Station servers in the repository

When the station needs more than one server, or flags that are easy to get wrong, ship a
`docker-compose.yml`, so the person at the station only runs `docker compose up`:

```yaml
services:
  terminal:
    image: edryslabs/module-pyxtermjs:latest
    ports:
      - 127.0.0.1:5000:5000
    devices:
      - /dev/ttyACM0:/dev/ttyACM0
    restart: unless-stopped
```

A `Dockerfile` belongs in the lab repo only when the terminal needs tools the published images lack (a ROS
installation, the STM32 core, extra Arduino libraries). Build on `edryslabs/module-pyxtermjs:latest` and keep
its entry point; publish the image or tell the station to `docker compose build` it.
