import type { Inventory } from "../type/sticker.js";
import type { CompareEntry } from "../type/compare.js";
import type { Trade } from "../type/trade.js";
import { compress, decompress } from "./compress.js";

export interface ExportableState {
  sticker: { inventory: Inventory };
  compare: { entries: Record<string, CompareEntry> };
  trade: { trades: Record<string, Trade> };
}

export async function serializeState(state: ExportableState): Promise<string> {
  return compress(JSON.stringify(state));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function deserializeState(data: string): Promise<ExportableState> {
  let json: string;
  try {
    json = await decompress(data);
  } catch {
    throw new Error("Invalid or corrupted data");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid or corrupted data");
  }

  if (!isRecord(parsed)) {
    throw new Error("Invalid or corrupted data");
  }

  if (!isRecord(parsed.sticker) || !isRecord(parsed.sticker.inv)) {
    throw new Error("Missing or invalid 'sticker.inv'");
  }

  if (!isRecord(parsed.compare) || !isRecord(parsed.compare.entries)) {
    throw new Error("Missing or invalid 'compare.entries'");
  }

  if (!isRecord(parsed.trade) || !isRecord(parsed.trade.trades)) {
    throw new Error("Missing or invalid 'trade.trades'");
  }

  return parsed as unknown as ExportableState;
}
