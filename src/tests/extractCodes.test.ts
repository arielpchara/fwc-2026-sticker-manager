import { extractStickers } from "../parser/extractStickers";
import { describe, it, expect } from "vitest";

describe("extractCodes", () => {
  it("should extract codes from text", () => {
    const text = "FWC12 (x3) ALG5 CC10 (x2) FWC12 (x1) BRA1 CC2 CC22 CC10";
    const result = extractStickers(text);
    expect(result).toEqual({
      FWC12: 4,
      ALG5: 1,
      CC10: 3,
      BRA1: 1,
      CC2: 1,
    });
  });

  it("should return an empty object for empty text", () => {
    const text = "";
    const result = extractStickers(text);
    expect(result).toEqual({});
  });

  it("should return an empty object for text with no codes", () => {
    const text = "This is a test with no codes.";
    const result = extractStickers(text);
    expect(result).toEqual({});
  });

  it("should handle codes with different cases", () => {
    const text = "fwc12 (x2) FWC12 (x3) fwc12 (x1)";
    const result = extractStickers(text);
    expect(result).toEqual({
      FWC12: 6,
    });
  });

  it("should ignore invalid codes", () => {
    const text = "FWC12 (x2) INVALID (x3) ALG5";
    const result = extractStickers(text);
    expect(result).toEqual({
      FWC12: 2,
      ALG5: 1,
    });
  });

  it("should handle codes out of the range", () => {
    const text = "FWC0 (x2) FWC21 (x3) ALG5 CC20";
    const result = extractStickers(text);
    expect(result).toEqual({
      ALG5: 1,
    });
  });

  it("should get special code 00", () => {
    const text = "CC10 (x2) CC5 (x3) FWC12 (x1) 00";
    const result = extractStickers(text);
    expect(result).toEqual({
      "00": 1,
      CC10: 2,
      CC5: 3,
      FWC12: 1,
    });
  });

  describe("extractCodes with grouped codes", () => {
    it("should extract grouped codes from text", () => {
      const text = `FWC: 1, 3, 7`;
      const result = extractStickers(text);
      expect(result).toEqual({
        FWC1: 1,
        FWC3: 1,
        FWC7: 1,
      });
    });
  });

  describe("extractCodes with mixed text", () => {
    it("should extract grouped codes from text", () => {
      const text = `FWC: 1, 2, 3,12
                    ALG: 5, 6
                    CC: 10
                    FWC12 (x3) ALG5 CC10 00`;
      const result = extractStickers(text);
      expect(result).toEqual({
        "00": 1,
        ALG5: 2,
        ALG6: 1,
        CC10: 2,
        FWC12: 4,
        FWC1: 1,
        FWC2: 1,
        FWC3: 1,
      });
    });
  });
});
