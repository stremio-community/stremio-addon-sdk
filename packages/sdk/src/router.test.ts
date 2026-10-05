import { describe, it, expect, vi } from "vitest";
import { createRouter } from "./router.js";
import {
  basicManifest,
  bigBuckBunnyCatalog,
  bigBuckBunnyStream,
  configurableManifest,
  configurationRequiredManifest,
  makeAddon,
} from "./__fixtures__.js";
import type { ContentType, Manifest, ShortManifestResource } from "./types.js";

const BASE = "http://localhost";

type GetCall = {
  resource: ShortManifestResource;
  type: ContentType;
  id: string;
  extra: Record<string, any>;
  config: Record<string, any>;
};

function spyAddon(manifest: Manifest, response: any = {}) {
  const calls: GetCall[] = [];
  const addon = makeAddon(
    manifest,
    async (resource, type, id, extra, config) => {
      calls.push({
        resource,
        type,
        id,
        extra: extra ?? {},
        config: config ?? {},
      });
      return response;
    },
  );
  return { addon, calls };
}

async function readJson(res: Response) {
  return JSON.parse(await res.text());
}

describe("createRouter", () => {
  describe("manifest route", () => {
    it("serves the manifest at /manifest.json", async () => {
      const router = createRouter(makeAddon(basicManifest));
      const res = await router(new Request(`${BASE}/manifest.json`));

      expect(res).not.toBeNull();
      expect(res!.status).toBe(200);
      expect(res!.headers.get("Content-Type")).toBe(
        "application/json; charset=utf-8",
      );
      expect(res!.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(await readJson(res!)).toEqual(basicManifest);
    });

    it("returns null for unmatched paths", async () => {
      const router = createRouter(makeAddon(basicManifest));

      expect(await router(new Request(`${BASE}/random`))).toBeNull();
      expect(await router(new Request(`${BASE}/`))).toBeNull();
      expect(await router(new Request(`${BASE}/manifest`))).toBeNull();
    });
  });

  describe("resource routes (protocol URLs)", () => {
    it("routes catalog feed: /catalog/movie/moviecatalog.json", async () => {
      const { addon, calls } = spyAddon(basicManifest, bigBuckBunnyCatalog);
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/catalog/movie/moviecatalog.json`),
      );

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(bigBuckBunnyCatalog);
      expect(calls).toEqual([
        {
          resource: "catalog",
          type: "movie",
          id: "moviecatalog",
          extra: {},
          config: {},
        },
      ]);
    });

    it("routes stream: /stream/movie/tt1254207.json", async () => {
      const { addon, calls } = spyAddon(basicManifest, bigBuckBunnyStream);
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(bigBuckBunnyStream);
      expect(calls[0]).toMatchObject({
        resource: "stream",
        type: "movie",
        id: "tt1254207",
      });
    });

    it("preserves colons in id: /stream/series/tt0898266:9:17.json", async () => {
      const seriesManifest: Manifest = {
        ...basicManifest,
        resources: ["stream"],
        catalogs: [],
      };
      const { addon, calls } = spyAddon(seriesManifest, { streams: [] });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/series/tt0898266:9:17.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0]).toMatchObject({
        resource: "stream",
        type: "series",
        id: "tt0898266:9:17",
      });
    });

    it("routes meta: /meta/movie/tt1254207.json", async () => {
      const metaManifest: Manifest = {
        ...basicManifest,
        resources: ["meta"],
        catalogs: [],
      };
      const { addon, calls } = spyAddon(metaManifest, {
        meta: { id: "tt1254207" },
      });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/meta/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0].resource).toBe("meta");
    });

    it("routes subtitles: /subtitles/movie/tt1254207.json", async () => {
      const subsManifest: Manifest = {
        ...basicManifest,
        resources: ["subtitles"],
        catalogs: [],
      };
      const { addon, calls } = spyAddon(subsManifest, { subtitles: [] });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/subtitles/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0].resource).toBe("subtitles");
    });

    it("decodes extra params from URL-encoded path segment", async () => {
      const { addon, calls } = spyAddon(basicManifest, { metas: [] });
      const router = createRouter(addon);

      await router(
        new Request(
          `${BASE}/catalog/movie/top/search=big%20buck%20bunny&skip=0.json`,
        ),
      );

      expect(calls[0].extra).toEqual({
        search: "big buck bunny",
        skip: "0",
      });
    });

    it("parses single extra param: genre=Action", async () => {
      const { addon, calls } = spyAddon(basicManifest, { metas: [] });
      const router = createRouter(addon);

      await router(
        new Request(`${BASE}/catalog/movie/trending/genre=Action.json`),
      );

      expect(calls[0].extra).toEqual({ genre: "Action" });
    });

    it("routes player events: /player/series/tt1%3A1%3A1/action=start&currentTime=600000&duration=3600000.json", async () => {
      const manifest: Manifest = {
        ...basicManifest,
        resources: [
          ...basicManifest.resources,
          { name: "player", types: ["series"], idPrefixes: ["tt"] },
        ],
      };
      const { addon, calls } = spyAddon(manifest, { success: true });
      const router = createRouter(addon);

      const res = await router(
        new Request(
          `${BASE}/player/series/tt1%3A1%3A1/action=start&currentTime=600000&duration=3600000.json`,
        ),
      );

      expect(res!.status).toBe(200);
      expect(calls[0]).toEqual({
        resource: "player",
        type: "series",
        id: "tt1:1:1",
        extra: { action: "start", currentTime: "600000", duration: "3600000" },
        config: {},
      });
    });
  });

  describe("resource routes (errors)", () => {
    it("returns 404 for resource not declared in manifest", async () => {
      const router = createRouter(makeAddon(basicManifest));

      const res = await router(
        new Request(`${BASE}/subtitles/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(404);
      expect(await readJson(res!)).toEqual({ err: "resource not found" });
    });

    it("returns 500 when the handler rejects", async () => {
      const addon = makeAddon(basicManifest, async () => {
        throw new Error("boom");
      });
      const router = createRouter(addon);
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(500);
      expect(await readJson(res!)).toEqual({ err: "handler error" });
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it("returns 307 redirect when result.redirect is set", async () => {
      const addon = makeAddon(basicManifest, async () => ({
        redirect: "https://example.com/elsewhere.json",
      }));
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(307);
      expect(res!.headers.get("Location")).toBe(
        "https://example.com/elsewhere.json",
      );
    });
  });

  describe("cache headers", () => {
    it("sets Cache-Control from cacheMaxAge", async () => {
      const addon = makeAddon(basicManifest, async () => ({
        streams: [],
        cacheMaxAge: 3600,
      }));
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.headers.get("Cache-Control")).toBe("max-age=3600, public");
    });

    it("combines cacheMaxAge, staleRevalidate, and staleError", async () => {
      const addon = makeAddon(basicManifest, async () => ({
        streams: [],
        cacheMaxAge: 3600,
        staleRevalidate: 1800,
        staleError: 86400,
      }));
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.headers.get("Cache-Control")).toBe(
        "max-age=3600, stale-while-revalidate=1800, stale-if-error=86400, public",
      );
    });

    it("ignores non-integer cache values", async () => {
      const addon = makeAddon(basicManifest, async () => ({
        streams: [],
        cacheMaxAge: 3.5,
        staleRevalidate: "1800",
      }));
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.headers.get("Cache-Control")).toBeNull();
    });

    it("omits Cache-Control when no cache fields present", async () => {
      const addon = makeAddon(basicManifest, async () => ({ streams: [] }));
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.headers.get("Cache-Control")).toBeNull();
    });
  });

  describe("config prefix (regression for #41/#42)", () => {
    it("strips configurable flags when manifest served under config prefix", async () => {
      const router = createRouter(makeAddon(configurationRequiredManifest));

      const res = await router(new Request(`${BASE}/eyJxIjoxfQ/manifest.json`));

      expect(res!.status).toBe(200);
      const body = await readJson(res!);
      expect(body.behaviorHints.configurable).toBeUndefined();
      expect(body.behaviorHints.configurationRequired).toBeUndefined();
      expect(body.behaviorHints.adult).toBe(false);
      expect(body.behaviorHints.p2p).toBe(false);
    });

    it("preserves configurable flags when manifest served without config prefix", async () => {
      const router = createRouter(makeAddon(configurationRequiredManifest));

      const res = await router(new Request(`${BASE}/manifest.json`));

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(configurationRequiredManifest);
    });

    it("decodes URL-encoded JSON config and passes it to the handler", async () => {
      const { addon, calls } = spyAddon(configurableManifest, { streams: [] });
      const router = createRouter(addon);

      await router(
        new Request(
          `${BASE}/%7B%22apiKey%22%3A%22secret%22%7D/stream/movie/tt1254207.json`,
        ),
      );

      expect(calls[0].config).toEqual({ apiKey: "secret" });
    });

    it("#41: configurable manifest still serves /manifest.json without prefix", async () => {
      const router = createRouter(makeAddon(configurableManifest));

      const res = await router(new Request(`${BASE}/manifest.json`));

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(configurableManifest);
    });

    it("#41: configurable manifest still routes /stream/... without prefix", async () => {
      const { addon, calls } = spyAddon(configurableManifest, { streams: [] });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0]).toMatchObject({
        resource: "stream",
        type: "movie",
        id: "tt1254207",
        config: {},
      });
    });

    it("#41: configurable manifest still routes /catalog/... without prefix", async () => {
      const { addon, calls } = spyAddon(configurableManifest, { metas: [] });
      const router = createRouter(addon);

      const res = await router(new Request(`${BASE}/catalog/movie/main.json`));

      expect(res!.status).toBe(200);
      expect(calls[0]).toMatchObject({
        resource: "catalog",
        type: "movie",
        id: "main",
        config: {},
      });
    });

    it("config prefix activates from non-empty manifest.config alone", async () => {
      const manifest: Manifest = {
        ...configurableManifest,
        behaviorHints: undefined,
      };
      const { addon, calls } = spyAddon(manifest, { streams: [] });
      const router = createRouter(addon);

      await router(
        new Request(
          `${BASE}/%7B%22apiKey%22%3A%22x%22%7D/stream/movie/tt1254207.json`,
        ),
      );

      expect(calls[0].config).toEqual({ apiKey: "x" });
    });

    it("non-configurable manifest does not activate prefix", async () => {
      const router = createRouter(makeAddon(basicManifest));

      expect(
        await router(new Request(`${BASE}/anything/manifest.json`)),
      ).toBeNull();
    });

    it("non-configurable manifest returns base manifest verbatim", async () => {
      const router = createRouter(makeAddon(basicManifest));

      const res = await router(new Request(`${BASE}/manifest.json`));

      expect(await readJson(res!)).toEqual(basicManifest);
    });
  });

  describe("config parsing", () => {
    it("falls back to {} when config segment is not valid JSON", async () => {
      const { addon, calls } = spyAddon(configurableManifest, { streams: [] });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/not-valid-json/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0].config).toEqual({});
    });
  });

  describe("catalog auto-registration", () => {
    it("registers catalog handler when manifest.catalogs is non-empty even if resources omits it", async () => {
      const manifest: Manifest = {
        ...basicManifest,
        resources: ["stream"],
      };
      const { addon, calls } = spyAddon(manifest, { metas: [] });
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/catalog/movie/moviecatalog.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0].resource).toBe("catalog");
    });
  });

  // The Fetch API requires absolute URLs on `new Request(...)`, so we construct a duck-typed Request to exercise the relative-URL branch of `getUrl`.
  // This branch is hit in practice when the SDK is wrapped by Node/Express adapters (see @stremio-addon/compat).
  describe("relative URL handling", () => {
    function fakeRequest(url: string, host: string | null): Request {
      return {
        url,
        headers: { get: (name: string) => (name === "host" ? host : null) },
      } as unknown as Request;
    }

    it("uses the host header when url is relative", async () => {
      const router = createRouter(makeAddon(basicManifest));

      const res = await router(
        fakeRequest("/manifest.json", "example.com:8080"),
      );

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(basicManifest);
    });

    it("falls back to localhost when host header is missing", async () => {
      const router = createRouter(makeAddon(basicManifest));

      const res = await router(fakeRequest("/manifest.json", null));

      expect(res!.status).toBe(200);
      expect(await readJson(res!)).toEqual(basicManifest);
    });
  });

  describe("full-form resource objects in manifest", () => {
    it("routes when resources contains a FullManifestResource", async () => {
      const manifest: Manifest = {
        ...basicManifest,
        resources: [
          { name: "stream", types: ["movie"], idPrefixes: ["tt"] },
          { name: "meta", types: ["movie", "series"] },
        ],
        catalogs: [],
      };
      const { addon, calls } = spyAddon(manifest, bigBuckBunnyStream);
      const router = createRouter(addon);

      const res = await router(
        new Request(`${BASE}/stream/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(200);
      expect(calls[0].resource).toBe("stream");
    });

    it("404s for a resource not listed in the full-form resources array", async () => {
      const manifest: Manifest = {
        ...basicManifest,
        resources: [{ name: "stream", types: ["movie"] }],
        catalogs: [],
      };
      const router = createRouter(makeAddon(manifest));

      const res = await router(
        new Request(`${BASE}/subtitles/movie/tt1254207.json`),
      );

      expect(res!.status).toBe(404);
    });
  });
});
