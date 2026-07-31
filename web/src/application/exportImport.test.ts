import { describe, it, expect } from "vitest";
import { serializeState, deserializeState, type ExportableState } from "./exportImport.js";
import { compress } from "./compress.js";

function makeFullState(): ExportableState {
  return {
    sticker: { inv: { BRA1: 1, BRA2: 2, ARG3: 1, MEX5: 1, "00": 1 } },
    compare: {
      entries: {
        "receive-joao": {
          name: "joao",
          text: "BRA1\nBRA2",
          stickers: ["BRA1", "BRA2"],
          mode: "receive",
          savedAt: 1700000000000,
        },
      },
    },
    trade: {
      trades: {
        "trade1": {
          name: "trade1",
          trades: [
            {
              offer: ["BRA1"],
              receive: ["ARG3"],
              type: "normal",
              savedAt: 1700000000000,
              key: "k1",
            },
          ],
          savedAt: 1700000000000,
          isLock: false,
        },
      },
    },
  };
}

function emptyState(): ExportableState {
  return {
    sticker: { inv: {} },
    compare: { entries: {} },
    trade: { trades: {} },
  };
}

describe("serializeState", () => {
  it("produces a base64-encoded compressed string", async () => {
    const state = makeFullState();
    const out = await serializeState(state);

    expect(typeof out).toBe("string");
    // base64 pattern: alphanumeric + / + = padding
    expect(out).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("round-trips through deserializeState", async () => {
    const original = makeFullState();
    const out = await serializeState(original);
    const restored = await deserializeState(out);
    expect(restored).toEqual(original);
  });

  it("handles empty state", async () => {
    const state = emptyState();
    const out = await serializeState(state);
    const restored = await deserializeState(out);
    expect(restored).toEqual(state);
  });
});

describe("deserializeState", () => {
  describe("valid data", () => {
    it("restores state with many compare entries", async () => {
      const state: ExportableState = {
        sticker: { inv: { BRA1: 1 } },
        compare: {
          entries: {
            "receive-a": { name: "a", text: "BRA1", stickers: ["BRA1"], mode: "receive", savedAt: 1 },
            "offer-b": { name: "b", text: "ARG3", stickers: ["ARG3"], mode: "offer", savedAt: 2 },
          },
        },
        trade: { trades: {} },
      };
      const out = await serializeState(state);
      expect(await deserializeState(out)).toEqual(state);
    });

    it("restores state with many trade sessions", async () => {
      const state: ExportableState = {
        sticker: { inv: { BRA1: 1, BRA2: 2 } },
        compare: { entries: {} },
        trade: {
          trades: {
            s1: { name: "s1", trades: [], savedAt: 100, isLock: true },
            s2: {
              name: "s2",
              trades: [
                { offer: [null], receive: ["BRA1"], type: "chroma", savedAt: 200, key: "x" },
                { offer: ["BRA2"], receive: [null], type: "multi", savedAt: 300, key: "y" },
              ],
              savedAt: 400,
              isLock: false,
            },
          },
        },
      };
      const out = await serializeState(state);
      expect(await deserializeState(out)).toEqual(state);
    });
  });

  describe("malformed data", () => {
    it("throws for empty string", async () => {
      await expect(deserializeState("")).rejects.toThrow("Invalid or corrupted data");
    });

    it("throws for invalid base64", async () => {
      await expect(deserializeState("not-valid-base64-!!!")).rejects.toThrow("Invalid or corrupted data");
    });

    it("throws for valid base64 but not zstd compressed", async () => {
      // "hello" base64-encoded = "aGVsbG8="
      await expect(deserializeState("aGVsbG8=")).rejects.toThrow("Invalid or corrupted data");
    });

    it("throws for compressed data that is not valid JSON", async () => {
      const bad = await compress("not json");
      await expect(deserializeState(bad)).rejects.toThrow("Invalid or corrupted data");
    });

    it("throws when sticker key is missing", async () => {
      const bad = await compress('{"compare":{"entries":{}},"trade":{"trades":{}}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'sticker.inv'");
    });

    it("throws when compare key is missing", async () => {
      const bad = await compress('{"sticker":{"inv":{}},"trade":{"trades":{}}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'compare.entries'");
    });

    it("throws when trade key is missing", async () => {
      const bad = await compress('{"sticker":{"inv":{}},"compare":{"entries":{}}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'trade.trades'");
    });

    it("throws when sticker.inv is not an object", async () => {
      const bad = await compress('{"sticker":{"inv":"invalid"},"compare":{"entries":{}},"trade":{"trades":{}}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'sticker.inv'");
    });

    it("throws when compare.entries is not an object", async () => {
      const bad = await compress('{"sticker":{"inv":{}},"compare":{"entries":[]},"trade":{"trades":{}}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'compare.entries'");
    });

    it("throws when trade.trades is not an object", async () => {
      const bad = await compress('{"sticker":{"inv":{}},"compare":{"entries":{}},"trade":{"trades":null}}');
      await expect(deserializeState(bad)).rejects.toThrow("Missing or invalid 'trade.trades'");
    });

    it("does not modify the original state when parsing fails", async () => {
      const original = makeFullState();
      const saved = JSON.stringify(original);
      try {
        await deserializeState("garbage");
      } catch {
        // expected
      }
      expect(JSON.stringify(original)).toBe(saved);
    });
  });
});
