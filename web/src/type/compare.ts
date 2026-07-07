export type CompareMode = "receive" | "give";

export interface CompareEntry {
  name: string;
  text: string;
  stickers: string[];
  mode: CompareMode;
  savedAt: number;
}

export interface CompareState {
  entries: Record<string, CompareEntry>;
}
