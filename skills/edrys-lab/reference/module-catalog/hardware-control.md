# Hardware Control

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-hardware-control/index.html`
- **Source:** https://github.com/edrys-labs/module-hardware-control
- **Default rooms (`show-in`):** `station`
- **Description:** Hardware control module for Digilent Analog Discovery 2. Allows remote control of buttons, potentiometers, and other hardware components.
- **Schema read:** 2026-10-26

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `serverUrl` | string |  | Local server URL (e.g., http://localhost:5005) |
| `components` | text-area |  | JSON array of components: [{type: button, name: Button1, pin: 4}, {type: potentiometer, name: Pot1, channel: 0}] |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-hardware-control/index.html
  stationConfig:
    # serverUrl: ''  # string
    # components: ''  # text-area
  showInCustom: station
```

<!-- GENERATED:END -->

## Notes

**For:** pressing buttons and turning potentiometers on a real board remotely. A
[Digilent Analog Discovery 2](https://digilent.com/reference/test-and-measurement/analog-discovery-2/start)
(AD2) at the station is wired to the board's inputs; students click buttons and move sliders in the module, and
the AD2 drives the pins (digital I/O for buttons, 0–3.3 V analog output for potentiometers). Typically combined
with [streaming](streaming.md) to watch the board react.

**Only `stationConfig` is read.**

| Key | Note |
|-----|------|
| `serverUrl` | The AD2 server on the station computer, e.g. `http://localhost:5005`. |
| `components` | **A JSON string** (not a YAML list) with the controls: `{"type": "button", "name": …, "pin": <AD2 DIO pin>}` or `{"type": "potentiometer", "name": …, "channel": <0 = W1, 1 = W2>}`. |

**Station setup:**

```bash
docker run -it -p 5005:5005 --device=/dev/bus/usb:/dev/bus/usb edryslabs/module-hardware-control-server:latest
```

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-hardware-control/index.html
  stationConfig:
    serverUrl: http://localhost:5005
    components: |
      [
        {"type": "button", "name": "Button 1", "pin": 4},
        {"type": "potentiometer", "name": "Voltage", "channel": 0}
      ]
  showInCustom: station
  width: half
  height: medium
```

**Pitfalls:**

- `components` must be JSON text, so write it as a `|` block with JSON inside. A YAML list makes the module
  fail to parse it and show no controls.
- `pin` is the AD2's DIO number, not the board's pin; the wiring decides which board pin it reaches.
- The analog output is 0–3.3 V: check the board's input range.
