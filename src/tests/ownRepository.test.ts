import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../storage/stickersRepository.js";
import { codesOf } from "../domain/inventory.js";

describe("ownRepository", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "sticker-test-"));
  });

  async function cleanup() {
    await rm(dir, { recursive: true, force: true });
  }

  describe("load", () => {
    it("returns empty state when own.json does not exist", async () => {
      const record = await load(dir);
      expect(record.inventory).toEqual({});
      expect(record.hash).toBe("");
      await cleanup();
    });

    it("reads back a previously saved record", async () => {
      await save({ ARG1: 1, BRA1: 1 }, dir);
      const record = await load(dir);
      expect(codesOf(record.inventory)).toEqual(["ARG1", "BRA1"]);
      await cleanup();
    });

    it("migrates old string[] format on load", async () => {
      const oldData = {
        stickers: ["BRA1", "ARG1"],
        hash: "old-hash",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };
      await writeFile(join(dir, "own.json"), JSON.stringify(oldData), "utf-8");
      const record = await load(dir);
      expect(record.inventory).toEqual({ ARG1: 1, BRA1: 1 });
      expect(record.hash).toBe("old-hash");
      await cleanup();
    });

    it("migrates old format without hash", async () => {
      const oldData = { stickers: ["BRA1"] };
      await writeFile(join(dir, "own.json"), JSON.stringify(oldData), "utf-8");
      const record = await load(dir);
      expect(record.inventory).toEqual({ BRA1: 1 });
      await cleanup();
    });
  });

  describe("save", () => {
    it("writes own.json and returns true on first save", async () => {
      const saved = await save({ ARG1: 1, BRA1: 1 }, dir);
      expect(saved).toBe(true);
      const raw = await readFile(join(dir, "own.json"), "utf-8");
      const parsed = JSON.parse(raw);
      expect(parsed.inv).toEqual({ ARG1: 1, BRA1: 1 });
      await cleanup();
    });

    it("writes a dated snapshot file on save", async () => {
      await save({ BRA1: 1 }, dir);
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const snapshotFile = join(dir, `own_${y}${m}${d}.json`);
      const raw = await readFile(snapshotFile, "utf-8");
      const parsed = JSON.parse(raw);
      expect(parsed.inv).toEqual({ BRA1: 1 });
      await cleanup();
    });

    it("returns false and does NOT write when hash is unchanged", async () => {
      await save({ BRA1: 1, ARG1: 1 }, dir);

      const { stat } = await import("node:fs/promises");
      const mtimeBefore = (await stat(join(dir, "own.json"))).mtimeMs;

      await new Promise((r) => setTimeout(r, 10));

      const saved = await save({ BRA1: 1, ARG1: 1 }, dir);
      expect(saved).toBe(false);

      const mtimeAfter = (await stat(join(dir, "own.json"))).mtimeMs;
      expect(mtimeAfter).toBe(mtimeBefore);

      await cleanup();
    });

    it("returns false for same inventory in different order", async () => {
      await save({ BRA1: 1, ARG1: 1 }, dir);
      const saved = await save({ ARG1: 1, BRA1: 1 }, dir);
      expect(saved).toBe(false);
      await cleanup();
    });

    it("returns true and writes when inventory changes", async () => {
      await save({ BRA1: 1 }, dir);
      const saved = await save({ BRA1: 1, ARG1: 1 }, dir);
      expect(saved).toBe(true);
      const record = await load(dir);
      expect(codesOf(record.inventory)).toEqual(["ARG1", "BRA1"]);
      await cleanup();
    });

    it("returns true when quantity changes", async () => {
      await save({ BRA1: 1 }, dir);
      const saved = await save({ BRA1: 3 }, dir);
      expect(saved).toBe(true);
      const record = await load(dir);
      expect(record.inventory).toEqual({ BRA1: 3 });
      await cleanup();
    });

    it("stores inventory sorted regardless of input order", async () => {
      await save({ FWC3: 1, ARG1: 1, BRA1: 1 }, dir);
      const record = await load(dir);
      expect(Object.keys(record.inventory)).toEqual(["ARG1", "BRA1", "FWC3"]);
      await cleanup();
    });

    it("stores a valid ISO updatedAt timestamp", async () => {
      await save({ BRA1: 1 }, dir);
      const record = await load(dir);
      expect(() => new Date(record.updatedAt)).not.toThrow();
      expect(new Date(record.updatedAt).getTime()).toBeGreaterThan(0);
      await cleanup();
    });
  });
});
