# Lab Survey

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-survey/index.html`
- **Source:** https://github.com/edrys-labs/module-survey
- **Default rooms (`show-in`):** `station`
- **Description:** A SurveyJS survey for station rooms: everyone in the room can answer, the station stores the answers and charts them. https://github.com/edrys-labs/module-survey
- **Schema read:** 2026-10-27

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `survey` | code-area |  | Your survey as SurveyJS JSON (see surveyjs.io/create-free-survey) |
| `allowRetake` | boolean |  | Let a user take the survey again after submitting (Off: one answer per user) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one. Keep `width` and `height`, sized for
this lab: without them the module is 250 × 200px (see [show-in-and-layout.md](../show-in-and-layout.md)).

```yaml
- url: https://edrys-labs.github.io/module-survey/index.html
  stationConfig:
    # survey: ''  # code-area
    # allowRetake: false  # boolean
  showInCustom: station
  width: full
  height: tall
```

<!-- GENERATED:END -->

## Notes

**For:** feedback forms and questionnaires ([SurveyJS](https://surveyjs.io)) in a station room. Everyone in the
room can answer; the answers go to the **station**, which stores them and shows results and charts.

**Only `stationConfig` is read.**

| Key | Note |
|-----|------|
| `survey` | **Required.** The survey as SurveyJS JSON (a JSON string), or written directly as a YAML map; the module accepts both. Build it with the [SurveyJS creator](https://surveyjs.io/create-free-survey). |
| `allowRetake` | Off: one answer per user. On: users may answer again (e.g. a shared station PC). |

**Example:**

```yaml
- url: https://edrys-labs.github.io/module-survey/index.html
  stationConfig:
    allowRetake: false
    survey:
      title: Lab feedback
      pages:
        - name: page1
          elements:
            - { type: rating, name: experience, title: How did the lab go?, rateMax: 5 }
            - { type: radiogroup, name: pace, title: Pace, choices: [slow, ok, fast] }
            - { type: comment, name: remarks, title: Anything else? }
  showInCustom: station
  width: full
  height: tall
```

The validator warns that the form expects text for `survey`; for this module a YAML map is fine.

**Pitfalls:**

- Answers are stored **only in the station's browser**: no station in the room, no stored answers. Clearing that
  browser's data deletes them, and there is no export yet.
- Editing the survey starts a new result set (and everyone can answer again).
