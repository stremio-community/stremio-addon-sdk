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
});
