# AVR8js Simulator

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-avr8js/index.html`
- **Source:** https://github.com/edrys-labs/module-avr8js
- **Default rooms (`show-in`):** `*`
- **Description:** This is an Arduino simulator module for Edrys based on https://github.com/wokwi/avr8js. It must be connected with an additional editor module, such as https://github.com/edrys-labs/module-monaco-editor or https://github.com/edrys-labs/module-blockly-duino-v2. Uploads must be sent with the subject `execute`. For more information and configuration options, see https://github.com/edrys-labs/module-avr8js
- **Schema read:** 2026-10-26

### Config schema

**`config`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `execute` | text |  | Message subject the simulator runs code from (default: execute) |
| `modules` | code-area |  | The circuit as Wokwi parts in HTML, e.g. <wokwi-led pin=13></wokwi-led> |
| `synchronize` | boolean |  | Run code sent by any peer in the room on every peer (default: false, each peer runs only its own code) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-avr8js/index.html
  config:
    # execute: ''  # text
    # modules: ''  # code-area
    # synchronize: false  # boolean
  showInCustom: '*'
```

<!-- GENERATED:END -->

## Notes

**For:** Arduino labs **without hardware**: an ATmega328P (Arduino Uno) simulated in every browser, with Wokwi
parts (LEDs, buttons, potentiometers, LCD, OLED, servo, NeoPixels, sensors, …), a serial monitor and sensor
sliders. No station needed: put it in the Lobby or the group rooms next to an editor.

**Only `config` is read.** Role configs are ignored.

| Key | Note |
|-----|------|
| `modules` | HTML with the Wokwi parts and their pins, e.g. `<wokwi-led color='red' pin='13'></wokwi-led>`. See the module's README for every part. |
| `execute` | Subject the simulator takes code on, default `execute`. Must equal the editor's `runCommand`. |
| `synchronize` | **Off unless set.** Off: each peer runs only the code it sent itself (individual work). On: an upload from anyone runs on every peer in the room, is stored for late joiners, and Stop stops it for everyone. |

**Example** (button and LED, each student simulating their own code):

```yaml
- url: https://edrys-labs.github.io/module-monaco-editor/
  config:
    synchronize: false
    language: cpp
    runCommand: execute
    value: |
      void setup() {
        pinMode(2, INPUT_PULLUP);
        pinMode(13, OUTPUT);
      }

      void loop() {
        digitalWrite(13, digitalRead(2) == LOW);
      }
  showInCustom: lobby
  width: half
  height: tall
- url: https://edrys-labs.github.io/module-avr8js/index.html
  config:
    execute: execute
    synchronize: false
    modules: |
      <wokwi-pushbutton color='green' pin='2'></wokwi-pushbutton>
      <wokwi-led color='red' pin='13' label='13'></wokwi-led>
  showInCustom: lobby
  width: half
  height: tall
```

For one shared program the whole room watches, set `synchronize: true` on **both** the editor and the simulator.

**Pitfalls:**

- Code is compiled by Wokwi's public server (`hexi.wokwi.com`): the lab needs internet access and the source
  leaves the browser.
- Only the Uno (ATmega328P) is simulated; libraries are limited to what the compile server provides.
- Interactions (button presses, knobs) are always local, even with `synchronize`: each peer runs its own
  simulation.
- Use single quotes inside `modules`, or a `|` block, so the HTML needs no escaping.
