# @stremio-addon/sdk

## 1.1.0

### Minor Changes

- [#56](https://github.com/stremio-community/stremio-addon-sdk/pull/56) [`b4f7427`](https://github.com/stremio-community/stremio-addon-sdk/commit/b4f7427d916728371eadd3866d4d35bd9b669862) Thanks [@sleeyax](https://github.com/sleeyax)! - Support live TV and the Native EPG: the `epgProvider` manifest hint, the `date` catalog extra, `metasDetailed` catalog responses, the `isLive` / `hasScheduledVideos` meta hints, and programme fields on videos (`startTime`, `endTime`, `ratings`, ...).

- [#54](https://github.com/stremio-community/stremio-addon-sdk/pull/54) [`de108c6`](https://github.com/stremio-community/stremio-addon-sdk/commit/de108c695cdfca573e808619acc2066e89eb9f53) Thanks [@cryingzeuss](https://github.com/cryingzeuss)! - Accept the `player` and `library` resources, which Stremio Core 0.64 sends playback and library events to, with typed handler extras and `definePlayerHandler` / `defineLibraryHandler`.

- [#59](https://github.com/stremio-community/stremio-addon-sdk/pull/59) [`ab68f05`](https://github.com/stremio-community/stremio-addon-sdk/commit/ab68f055feb628576812d13554694dd0ac2acd70) Thanks [@sleeyax](https://github.com/sleeyax)! - Accept the optional subtitle `label`, shown in the subtitle picker instead of the language name.

### Patch Changes

- [#60](https://github.com/stremio-community/stremio-addon-sdk/pull/60) [`cf82842`](https://github.com/stremio-community/stremio-addon-sdk/commit/cf82842fe16c9b19a14a28b2da2a52445bf5b51b) Thanks [@sleeyax](https://github.com/sleeyax)! - Sync doc comments with the upstream protocol docs: `stream.url` protocols, the `stream.servers` example port, and ASS/SSA subtitle guidance on `subtitle.url`.

## 1.0.0

### Major Changes

- [#49](https://github.com/Stremio-Community/stremio-addon-sdk/pull/49) [`573a3c2`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/573a3c26dbb710541a13f1995bbfdbb0a24a4a7b) Thanks [@sleeyax](https://github.com/sleeyax)! - Release v1.

## 0.3.4

### Patch Changes

- [#42](https://github.com/Stremio-Community/stremio-addon-sdk/pull/42) [`91a2dea`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/91a2deacc1daf889bb2930075ce518e8698430d6) Thanks [@sleeyax](https://github.com/sleeyax)! - fix: resolve route ambiguity when `behaviorHints.configurable=true`

  The optional `{/:config}` prefix was greedily matched by `path-to-regexp`, causing URLs like `/catalog/series/foo/skip=20.json` to be parsed as `config=catalog, resource=series, ...` and return "resource not found". The router now inspects the URL's first path segment: if it's a known resource or `manifest.json`, no config prefix is used; otherwise it's treated as the config segment.

## 0.3.3

### Patch Changes

- [#39](https://github.com/Stremio-Community/stremio-addon-sdk/pull/39) [`995f7df`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/995f7df7d2245be1ea55faff9a3740dc5d6a21d6) Thanks [@sleeyax](https://github.com/sleeyax)! - allow manifest extra name to contain custom string

## 0.3.2

### Patch Changes

- [#37](https://github.com/Stremio-Community/stremio-addon-sdk/pull/37) [`56d4ebf`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/56d4ebfc4ae3d6d3f8efca455666379422bb268f) Thanks [@sleeyax](https://github.com/sleeyax)! - allow catalog `type` to contain custom string

## 0.3.1

### Patch Changes

- [#27](https://github.com/Stremio-Community/stremio-addon-sdk/pull/27) [`5e8299d`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/5e8299d19ee169a2eb269a7671bd34de4bc52907) Thanks [@sleeyax](https://github.com/sleeyax)! - Fix config prefix logic for configurable addons

## 0.3.0

### Minor Changes

- [#23](https://github.com/Stremio-Community/stremio-addon-sdk/pull/23) [`9afde84`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/9afde84a2adab5526bb5078531af1735b5501a6b) Thanks [@sleeyax](https://github.com/sleeyax)! - Update stream types for usenet support

## 0.2.0

### Minor Changes

- [#21](https://github.com/Stremio-Community/stremio-addon-sdk/pull/21) [`4286433`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/42864331ab8926ea61108f463e5fc852b1830130) Thanks [@sleeyax](https://github.com/sleeyax)! - Add `stremioAddonsConfig` to manifest schema

## 0.1.0

### Minor Changes

- [ace0870](https://github.com/Stremio-Community/stremio-addon-sdk/commit/ace0870): Add CORS headers at SDK level

## 0.0.2

### Patch Changes

- [873dfeb](https://github.com/Stremio-Community/stremio-addon-sdk/commit/873dfeb): Add package documentation
