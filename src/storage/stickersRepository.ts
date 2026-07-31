import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Inventory } from "../domain/inventory.js";

export interface StickersRecord {
  inventory: Inventory;
  hash: string;
  updatedAt: string;
}

const EMPTY: StickersRecord = { inventory: {}, hash: "", updatedAt: "" };

function dataDir(): string {
  return process.env["DATA_DIR"] ?? "./data";
}

function computeHash(inv: Inventory): string {
  const sorted = Object.entries(inv).sort(([a], [b]) => a.localeCompare(b));
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
}

function dateSuffix(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

function migrateRecord(raw: Record<string, unknown>): StickersRecord {
  if (Array.isArray(raw["stickers"]) && !raw["inv"]) {
    const stickers = raw["stickers"] as string[];
    return {
      inventory: Object.fromEntries(stickers.map((s) => [s, 1])),
      hash: (raw["hash"] as string) ?? "",
      updatedAt: (raw["updatedAt"] as string) ?? "",
    };
  }
  return {
    inventory: (raw["inv"] as Inventory) ?? {},
    hash: (raw["hash"] as string) ?? "",
    updatedAt: (raw["updatedAt"] as string) ?? "",
  };
}

export async function load(dir?: string): Promise<StickersRecord> {
  const base = dir ?? dataDir();
  const file = join(base, "own.json");
  try {
    const raw = await readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateRecord(parsed);
  } catch (err: unknown) {
    if (isNodeError(err) && err.code === "ENOENT") return { ...EMPTY };
    throw err;
  }
}

function sortedInventory(inv: Inventory): Inventory {
  const sorted: Inventory = {};
  for (const key of Object.keys(inv).sort()) {
    sorted[key] = inv[key];
  }
  return sorted;
}

export async function save(inv: Inventory, dir?: string): Promise<boolean> {
  const base = dir ?? dataDir();
  const newHash = computeHash(inv);

  const current = await load(base);
  if (current.hash === newHash) return false;

  await ensureDir(base);

  const record: StickersRecord = {
    inventory: sortedInventory(inv),
    hash: newHash,
    updatedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(record, null, 2);
  await writeFile(join(base, "own.json"), json, "utf-8");
  await writeFile(join(base, `own_${dateSuffix()}.json`), json, "utf-8");

  return true;
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}
