# Station Light Control

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-station-light-control/index.html`
- **Source:** https://github.com/edrys-labs/module-station-light-control
- **Default rooms (`show-in`):** `station, station-only`
- **Description:** Switches an Elgato light in a station on while users are in it, through a small light server on the station's machine. https://github.com/edrys-labs/module-station-light-control
- **Schema read:** 2026-10-26

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `lightIp` | text |  | IP address of the Elgato light, e.g. 192.168.1.100 |
| `serverUrl` | text |  | Light server on this station, default http://localhost:3000 |
| `brightness` | number |  | Brightness when on, 0-100, default 50 |
| `temperature` | number |  | Colour temperature in Elgato units, 143-344, default 213 |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-station-light-control/index.html
  stationConfig:
    # lightIp: ''  # text
    # serverUrl: ''  # text
    # brightness: 0  # number
    # temperature: 0  # number
  showInCustom: station, station-only
```

<!-- GENERATED:END -->

## Notes

**For:** unattended stations with a camera: switches an Elgato Key Light on while users are in the station
room and off when the last one leaves (and when the station window closes), so the camera picture is lit only
when someone watches.

**Only `stationConfig` is read.** Meant for the station only (`station, station-only`).

| Key | Note |
|-----|------|
| `lightIp` | **Required.** IP address of the Elgato light. |
| `serverUrl` | The light server on the station computer, default `http://localhost:3000`. |
| `brightness` | 0–100, default 50. |
| `temperature` | Colour temperature, 143 (cold) – 344 (warm), default 213. |

**Station setup:**

```bash
docker run --init -p 127.0.0.1:3000:3000 edryslabs/station-lights-server
```

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-station-light-control/index.html
  stationConfig:
    lightIp: 192.168.1.100
    brightness: 70
  showInCustom: station, station-only
  width: third
  height: short
```

**Pitfalls:**

- The light must be in the same network as the station computer.
- Chrome may ask once at the station for permission to access devices on the local network; allow it.
