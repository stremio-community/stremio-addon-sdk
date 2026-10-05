# @stremio-addon/zod

## 1.1.0

### Minor Changes

- [#56](https://github.com/stremio-community/stremio-addon-sdk/pull/56) [`b4f7427`](https://github.com/stremio-community/stremio-addon-sdk/commit/b4f7427d916728371eadd3866d4d35bd9b669862) Thanks [@sleeyax](https://github.com/sleeyax)! - Support live TV and the Native EPG: the `epgProvider` manifest hint, the `date` catalog extra, `metasDetailed` catalog responses, the `isLive` / `hasScheduledVideos` meta hints, and programme fields on videos (`startTime`, `endTime`, `ratings`, ...).

- [#54](https://github.com/stremio-community/stremio-addon-sdk/pull/54) [`de108c6`](https://github.com/stremio-community/stremio-addon-sdk/commit/de108c695cdfca573e808619acc2066e89eb9f53) Thanks [@cryingzeuss](https://github.com/cryingzeuss)! - Accept the `player` and `library` resources, which Stremio Core 0.64 sends playback and library events to, with typed handler extras and `definePlayerHandler` / `defineLibraryHandler`.

- [#59](https://github.com/stremio-community/stremio-addon-sdk/pull/59) [`ab68f05`](https://github.com/stremio-community/stremio-addon-sdk/commit/ab68f055feb628576812d13554694dd0ac2acd70) Thanks [@sleeyax](https://github.com/sleeyax)! - Accept the optional subtitle `label`, shown in the subtitle picker instead of the language name.

### Patch Changes

- [#60](https://github.com/stremio-community/stremio-addon-sdk/pull/60) [`cf82842`](https://github.com/stremio-community/stremio-addon-sdk/commit/cf82842fe16c9b19a14a28b2da2a52445bf5b51b) Thanks [@sleeyax](https://github.com/sleeyax)! - Sync doc comments with the upstream protocol docs: `stream.url` protocols, the `stream.servers` example port, and ASS/SSA subtitle guidance on `subtitle.url`.

- Updated dependencies [[`b4f7427`](https://github.com/stremio-community/stremio-addon-sdk/commit/b4f7427d916728371eadd3866d4d35bd9b669862), [`de108c6`](https://github.com/stremio-community/stremio-addon-sdk/commit/de108c695cdfca573e808619acc2066e89eb9f53), [`ab68f05`](https://github.com/stremio-community/stremio-addon-sdk/commit/ab68f055feb628576812d13554694dd0ac2acd70), [`cf82842`](https://github.com/stremio-community/stremio-addon-sdk/commit/cf82842fe16c9b19a14a28b2da2a52445bf5b51b)]:
  - @stremio-addon/sdk@1.1.0

## 1.0.0

### Major Changes

- [#49](https://github.com/Stremio-Community/stremio-addon-sdk/pull/49) [`573a3c2`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/573a3c26dbb710541a13f1995bbfdbb0a24a4a7b) Thanks [@sleeyax](https://github.com/sleeyax)! - Release v1.

### Patch Changes

- Updated dependencies [[`573a3c2`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/573a3c26dbb710541a13f1995bbfdbb0a24a4a7b)]:
  - @stremio-addon/sdk@1.0.0

## 0.3.0

### Minor Changes

- [#47](https://github.com/Stremio-Community/stremio-addon-sdk/pull/47) [`4699f96`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/4699f96aa39685a7ed5f1939691e0dc3e78d1216) Thanks [@sleeyax](https://github.com/sleeyax)! - feat: opt-in response validation in `AddonBuilder`

  Pass `{ validateResponses: true }` to validate handler return values against the zod response schemas (`streamResponseSchema`, `metaResponseSchema`, `catalogResponseSchema`, `subtitlesResponseSchema`, `addonCatalogResponseSchema`). Off by default for performance. An optional `onValidationError` callback can intercept failures (log-only, custom error, etc.) instead of letting `ValidationError` propagate.

### Patch Changes

- Updated dependencies [[`91a2dea`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/91a2deacc1daf889bb2930075ce518e8698430d6)]:
  - @stremio-addon/sdk@0.3.4

## 0.2.4

### Patch Changes

- [#39](https://github.com/Stremio-Community/stremio-addon-sdk/pull/39) [`995f7df`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/995f7df7d2245be1ea55faff9a3740dc5d6a21d6) Thanks [@sleeyax](https://github.com/sleeyax)! - allow manifest extra name to contain custom string

- Updated dependencies [[`995f7df`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/995f7df7d2245be1ea55faff9a3740dc5d6a21d6)]:
  - @stremio-addon/sdk@0.3.3

## 0.2.3

### Patch Changes

- [#37](https://github.com/Stremio-Community/stremio-addon-sdk/pull/37) [`56d4ebf`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/56d4ebfc4ae3d6d3f8efca455666379422bb268f) Thanks [@sleeyax](https://github.com/sleeyax)! - allow catalog `type` to contain custom string

- [#35](https://github.com/Stremio-Community/stremio-addon-sdk/pull/35) [`64ef70d`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/64ef70d506884f96b3b7ce2954c3bbab069159e8) Thanks [@sleeyax](https://github.com/sleeyax)! - enforce `httpUrl` instead of `url` for image URLs

- Updated dependencies [[`56d4ebf`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/56d4ebfc4ae3d6d3f8efca455666379422bb268f)]:
  - @stremio-addon/sdk@0.3.2

## 0.2.2

### Patch Changes

- [#31](https://github.com/Stremio-Community/stremio-addon-sdk/pull/31) [`c5ae858`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/c5ae858d764672b58f59b0a1e856e0c1de8a3793) Thanks [@sleeyax](https://github.com/sleeyax)! - change logo field type to URL in manifest schemas

## 0.2.1

### Patch Changes

- [#29](https://github.com/Stremio-Community/stremio-addon-sdk/pull/29) [`36dd933`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/36dd933dc12128ab73c47fe40ee2b9d9f0f5f816) Thanks [@sleeyax](https://github.com/sleeyax)! - add backwards compatibility with zod 3

## 0.2.0

### Minor Changes

- [#23](https://github.com/Stremio-Community/stremio-addon-sdk/pull/23) [`9afde84`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/9afde84a2adab5526bb5078531af1735b5501a6b) Thanks [@sleeyax](https://github.com/sleeyax)! - Update stream types for usenet support

### Patch Changes

- Updated dependencies [[`9afde84`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/9afde84a2adab5526bb5078531af1735b5501a6b)]:
  - @stremio-addon/sdk@0.3.0

## 0.1.0

### Minor Changes

- [#21](https://github.com/Stremio-Community/stremio-addon-sdk/pull/21) [`4286433`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/42864331ab8926ea61108f463e5fc852b1830130) Thanks [@sleeyax](https://github.com/sleeyax)! - Add `stremioAddonsConfig` to manifest schema

### Patch Changes

- Updated dependencies [[`4286433`](https://github.com/Stremio-Community/stremio-addon-sdk/commit/42864331ab8926ea61108f463e5fc852b1830130)]:
  - @stremio-addon/sdk@0.2.0

## 0.0.3

### Patch Changes

- Updated dependencies [[ace0870](https://github.com/Stremio-Community/stremio-addon-sdk/commit/ace0870)]
  - @stremio-addon/sdk@0.1.0

## 0.0.2

### Patch Changes

- [873dfeb](https://github.com/Stremio-Community/stremio-addon-sdk/commit/873dfeb): Add package documentation
- Updated dependencies [[873dfeb](https://github.com/Stremio-Community/stremio-addon-sdk/commit/873dfeb)]
  - @stremio-addon/sdk@0.0.2
