import { describe, it, expect } from "vitest";
import {
  matchAllChain,
  matchAllGrouped,
  matchAllRegular,
  MatchCain,
} from "../parser/matchers";

describe("matchers", () => {
  describe("matchAllRegular", () => {
    it("should match all regular codes in the text", () => {
      const text = "FWC12 (x3) ALG5 CC10 (x2) FWC12 (x1) BRA1 CC2 CC22 CC10";
      const result = matchAllRegular({ text, matches: [] });
      expect(result.matches.length).toBe(7);
      expect(result.matches).toEqual([
        ["FWC12", 3],
        ["ALG5", 1],
        ["CC10", 2],
        ["FWC12", 1],
        ["BRA1", 1],
        ["CC2", 1],
        ["CC10", 1],
      ]);
    });
  });

  describe("matchAllGrouped", () => {
    it("should match all grouped codes in the line", () => {
      const text = "FWC: 1, 2, 3, 20 40 - 50";
      const result = matchAllGrouped({ text, matches: [] });
      expect(result.matches.length).toBe(3);
      expect(result.matches).toEqual([
        ["FWC1", 1],
        ["FWC2", 1],
        ["FWC3", 1],
      ]);
    });
  });

  describe("chain matchers", () => {
    const text = `FWC: 1, 2, 3
                    ALG: 5, 6
                    CC: 10
                    FWC12 (x3) ALG5 CC10 00`;

    it("should match all codes in the text", () => {
      const result = matchAllChain(text);
      expect(result.matches.length).toBe(10);
      expect(result.matches).toEqual([
        ["FWC12", 3],
        ["ALG5", 1],
        ["CC10", 1],
        ["00", 1],
        ["FWC1", 1],
        ["FWC2", 1],
        ["FWC3", 1],
        ["ALG5", 1],
        ["ALG6", 1],
        ["CC10", 1],
      ]);
    });
  });
});
