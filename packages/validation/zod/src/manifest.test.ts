import { describe, it, expect } from "vitest";
import { manifestSchema } from "./manifest.js";

describe("manifestSchema", () => {
  it("accepts the player and library event resources", () => {
    const result = manifestSchema.safeParse({
      id: "com.example.tracker",
      name: "Tracker",
      description: "records what you watch",
      version: "1.0.0",
      types: ["movie", "series"],
      catalogs: [],
      resources: [
        "player",
        { name: "library", types: ["movie", "series"], idPrefixes: ["tt"] },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("keeps the Native EPG provider hint and date extra", () => {
    const result = manifestSchema.parse({
      id: "org.example.livetv",
      name: "Example Live TV",
      description: "Live channels with a programme guide",
      version: "1.0.0",
      types: ["tv"],
      resources: ["catalog", "meta", "stream"],
      catalogs: [
        {
          type: "tv",
          id: "channels",
          name: "Channels",
          extra: [{ name: "skip" }, { name: "date" }],
        },
      ],
      behaviorHints: { epgProvider: true },
    });

    expect(result.behaviorHints).toEqual({ epgProvider: true });
  });
});
