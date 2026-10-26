# Station Streaming

<!-- GENERATED:START by tools/build-catalog.mjs, do not edit by hand -->

- **URL:** `https://edrys-labs.github.io/module-streaming/index.html`
- **Source:** https://github.com/edrys-labs/module-streaming
- **Default rooms (`show-in`):** `station`
- **Description:** Allow a station to continuously stream video and/or audio to all connected teachers and students. For more information and configuration, see: https://github.com/edrys-labs/module-streaming
- **Schema read:** 2026-10-26

### Config schema

**`stationConfig`**

| Key | Type | Default | Hint |
|-----|------|---------|------|
| `streamName` | string |  | Unique name for this stream (default: Camera 1) |
| `streamQuality` | radio-button: medium / low / high | `"medium"` | Quality of the stream (affects bandwidth usage) |
| `video` | boolean | `true` | Stream the camera |
| `audio` | boolean | `false` | Stream the microphone |
| `mirrorX` | boolean |  | Mirror the video horizontally |
| `mirrorY` | boolean |  | Mirror the video vertically |
| `rotate` | number |  | Rotate the video by degrees (0, 90, 180, 270) |
| `streamMethod` | radio-button: webrtc / websocket |  | webrtc (default, peer to peer) or websocket (relay, needs websocketUrl) |
| `websocketUrl` | string |  | WebSocket server URL (needed for websocket method) |

### Entry skeleton

Keys with a schema default are set; the others are commented out. Leave a key out unless you need it:
the module may treat a missing key differently from an empty one.

```yaml
- url: https://edrys-labs.github.io/module-streaming/index.html
  stationConfig:
    # streamName: ''  # string
    streamQuality: medium
    video: true
    audio: false
    # mirrorX: false  # boolean
    # mirrorY: false  # boolean
    # rotate: 0  # number
    # streamMethod: webrtc  # radio-button: webrtc | websocket
    # websocketUrl: ''  # string
  showInCustom: station
```

<!-- GENERATED:END -->

## Notes

**For:** showing the hardware: the station streams its camera (and optionally microphone) to everyone in the
station room. Late joiners get the running stream. The station shows a preview and a camera picker.

**Only `stationConfig` is read.** Settings put in `config` are silently ignored. Empty values fall back to the
defaults: `streamName: Camera 1`, `streamQuality: medium`, `video: true`, `audio: false`, `streamMethod: webrtc`.

**Example** (camera above the board, mounted upside down):

```yaml
- url: https://edrys-labs.github.io/module-streaming/index.html
  stationConfig:
    streamName: Board camera
    streamQuality: medium
    video: true
    audio: false
    rotate: 180
  showInCustom: station
  width: half
  height: tall
```

**Several cameras:** add the module once per camera, each with its own `streamName`; the station picks a camera
per stream.

**Pitfalls:**

- The station browser needs camera permission and HTTPS (edrys-labs.github.io is HTTPS). Chrome is recommended
  for the station.
- `webrtc` (default) connects every viewer peer to peer, with signalling via the PeerJS cloud. In networks that
  block that (school firewalls), use `streamMethod: websocket` with `websocketUrl` pointing to the `/stream`
  endpoint of an [edrys-labs websocket-server](https://github.com/edrys-labs/websocket-server). Safari cannot
  watch websocket streams.
- `peerServerConfig` (own PeerJS server) has no form field: set it as a YAML map with `host`, `port`, `path`,
  `secure`.
