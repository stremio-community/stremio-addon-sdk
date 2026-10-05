import { describe, it, expect, vi } from "vitest";
import { ValidationError } from "@stremio-addon/sdk";
import { AddonBuilder } from "./builder.js";
import type { ManifestSchema } from "./manifest.js";

const basicManifest: ManifestSchema = {
  id: "com.example.test",
  name: "Test",
  description: "test addon",
  version: "0.0.1",
  resources: ["stream", "meta", "catalog", "subtitles", "addon_catalog"],
  types: ["movie"],
  catalogs: [{ type: "movie", id: "c1", name: "Catalog" }],
};

const validStream = { url: "https://example.com/v.mp4" };
const validMeta = { id: "tt1", type: "movie" as const, name: "Movie" };
const validSubtitle = {
  id: "s1",
  url: "https://example.com/s.srt",
  lang: "en",
};

describe("AddonBuilder (zod) response validation", () => {
  describe("disabled (default)", () => {
    it("does not validate handler return values", async () => {
      const builder = new AddonBuilder(basicManifest).defineStreamHandler(
        async () => ({ streams: [{ bogus: true }] }) as any,
      );

      const result = await builder.getInterface().get("stream", "movie", "tt1");
      expect(result).toEqual({ streams: [{ bogus: true }] });
    });
  });

  describe("validateResponses: true", () => {
    it("passes valid stream responses through", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineStreamHandler(async () => ({
        streams: [validStream],
        cacheMaxAge: 60,
      }));

      const result = await builder.getInterface().get("stream", "movie", "tt1");
      expect(result).toEqual({ streams: [validStream], cacheMaxAge: 60 });
    });

    it("throws ValidationError on bad stream response", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineStreamHandler(async () => ({ streams: "not-an-array" }) as any);

      await expect(
        builder.getInterface().get("stream", "movie", "tt1"),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("validates meta responses", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineMetaHandler(async () => ({ meta: { id: 123 } }) as any);

      await expect(
        builder.getInterface().get("meta", "movie", "tt1"),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("validates catalog responses", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineCatalogHandler(async () => ({ metas: [validMeta] }));

      const result = await builder.getInterface().get("catalog", "movie", "c1");
      expect(result).toEqual({ metas: [validMeta] });
    });

    it("keeps Native EPG fields in guide catalog responses", async () => {
      const guide = {
        metasDetailed: [
          {
            id: "exampletv:news",
            type: "tv" as const,
            name: "Example News",
            behaviorHints: { isLive: true, hasScheduledVideos: true },
            videos: [
              {
                id: "exampletv:news:epg:2026-09-12T18:00:00.000Z",
                title: "Evening News",
                released: "2026-09-12T18:00:00.000Z",
                startTime: "2026-09-12T18:00:00.000Z",
                endTime: "2026-09-12T18:45:00.000Z",
                runtime: "45 min",
                ratings: [{ value: "PG", system: "TVPG" }],
              },
            ],
          },
        ],
        cacheMaxAge: 300,
      };
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineCatalogHandler(async () => guide);

      const result = await builder
        .getInterface()
        .get("catalog", "tv", "channels", { date: "2026-09-12" });
      expect(result).toEqual(guide);
    });

    it("validates subtitles responses", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineSubtitlesHandler(async () => ({ subtitles: [validSubtitle] }));

      const result = await builder
        .getInterface()
        .get("subtitles", "movie", "tt1");
      expect(result).toEqual({ subtitles: [validSubtitle] });
    });

    it("validates manually-registered addon_catalog handler", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
      }).defineResourceHandler(
        "addon_catalog",
        async () => ({ addons: "nope" }) as any,
      );

      await expect(
        builder.getInterface().get("addon_catalog", "movie", "x"),
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe("onValidationError callback", () => {
    it("receives the error and resource context", async () => {
      const onValidationError = vi.fn();
      const bad = { streams: [{ url: 42 }] };
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
        onValidationError,
      }).defineStreamHandler(async () => bad as any);

      const result = await builder.getInterface().get("stream", "movie", "tt1");

      expect(onValidationError).toHaveBeenCalledTimes(1);
      const [error, ctx] = onValidationError.mock.calls[0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(ctx).toEqual({ resource: "stream", value: bad });
      expect(result).toEqual(bad);
    });

    it("propagates errors thrown from the callback", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
        onValidationError: () => {
          throw new Error("custom");
        },
      }).defineStreamHandler(async () => ({ streams: "x" }) as any);

      await expect(
        builder.getInterface().get("stream", "movie", "tt1"),
      ).rejects.toThrow("custom");
    });

    it("awaits async callbacks and propagates their rejections", async () => {
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
        onValidationError: async () => {
          await Promise.resolve();
          throw new Error("async-custom");
        },
      }).defineStreamHandler(async () => ({ streams: "x" }) as any);

      await expect(
        builder.getInterface().get("stream", "movie", "tt1"),
      ).rejects.toThrow("async-custom");
    });

    it("is not called when validation passes", async () => {
      const onValidationError = vi.fn();
      const builder = new AddonBuilder(basicManifest, {
        validateResponses: true,
        onValidationError,
      }).defineStreamHandler(async () => ({ streams: [validStream] }));

      await builder.getInterface().get("stream", "movie", "tt1");
      expect(onValidationError).not.toHaveBeenCalled();
    });
  });
});
