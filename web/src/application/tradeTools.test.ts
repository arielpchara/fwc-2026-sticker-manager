import { describe, it, expect } from "vitest";
import { TradeBy, TradeSticker } from "../type/trade";
import {
  addPeerToCode,
  codesFromLockedTrades,
  collectPeerNames,
  collectShared,
  filterCompleteTrades,
  getAllGiveTrades,
  getAllReceiveTrades,
  isPairedTradeRow,
  normalizeTradeSide,
  peerSharedCodes,
} from "./traderTool";

function stubTrade(
  offer: TradeSticker[] = [],
  receive: TradeSticker[] = [],
): TradeBy {
  return {
    offer: [...offer],
    receive: [...receive],
    savedAt: Date.now(),
    type: "multi",
    key: "key,",
  };
}

describe("addPeerToCode", () => {
  it("ignores null/undefined codes", () => {
    const map = new Map<string, string[]>();
    addPeerToCode(map, null, "Ana");
    addPeerToCode(map, undefined, "Ana");
    expect(map.size).toBe(0);
  });

  it("adds peer and skips duplicates", () => {
    const map = new Map<string, string[]>();
    addPeerToCode(map, "BRA1", "Ana");
    addPeerToCode(map, "BRA1", "Ana");
    addPeerToCode(map, "BRA1", "Bob");
    expect(map.get("BRA1")).toEqual(["Ana", "Bob"]);
  });
});

describe("collectPeerNames", () => {
  it("unions compare names and trade keys", () => {
    const names = collectPeerNames(
      {
        "offer-Ana": { name: "Ana" },
        "receive-Bob": { name: "Bob" },
      },
      { Bob: {}, Carol: {} },
    );
    expect(names.sort()).toEqual(["Ana", "Bob", "Carol"]);
  });
});

describe("normalizeTradeSide", () => {
  it("returns array as-is", () => {
    expect(normalizeTradeSide(["BRA1", null])).toEqual(["BRA1", null]);
  });

  it("wraps single value", () => {
    expect(normalizeTradeSide("BRA1" as unknown as TradeSticker)).toEqual([
      "BRA1",
    ]);
  });

  it("returns empty for nullish", () => {
    expect(normalizeTradeSide(null)).toEqual([]);
    expect(normalizeTradeSide(undefined)).toEqual([]);
  });
});

describe("isPairedTradeRow", () => {
  it("true only when both sides have a code", () => {
    expect(isPairedTradeRow(stubTrade(["BRA1"], ["MEX1"]))).toBe(true);
    expect(isPairedTradeRow(stubTrade(["BRA1"], [null]))).toBe(false);
    expect(isPairedTradeRow(stubTrade([], ["MEX1"]))).toBe(false);
  });
});

describe("codesFromLockedTrades", () => {
  it("collects only paired rows", () => {
    const result = codesFromLockedTrades([
      stubTrade(["BRA1"], ["MEX1"]),
      stubTrade(["BRA2"], [null]),
      stubTrade([null], ["USA1"]),
      stubTrade(["FWC1", "FWC2"], ["SUI1"]),
    ]);
    expect(result.offer).toEqual(["BRA1", "FWC1", "FWC2"]);
    expect(result.receive).toEqual(["MEX1", "SUI1"]);
  });
});

describe("peerSharedCodes", () => {
  it("prefers locked trades over compare", () => {
    const result = peerSharedCodes(
      "Ana",
      {
        "offer-Ana": { stickers: ["BRA9"] },
        "receive-Ana": { stickers: ["MEX9"] },
      },
      {
        isLock: true,
        trades: [stubTrade(["BRA1"], ["MEX1"])],
      },
    );
    expect(result).toEqual({ offer: ["BRA1"], receive: ["MEX1"] });
  });

  it("uses compare when both sides non-empty and not locked", () => {
    const result = peerSharedCodes(
      "Ana",
      {
        "offer-Ana": { stickers: ["BRA1", "BRA2"] },
        "receive-Ana": { stickers: ["MEX1"] },
      },
      undefined,
    );
    expect(result).toEqual({
      offer: ["BRA1", "BRA2"],
      receive: ["MEX1"],
    });
  });

  it("returns null when compare is one-sided", () => {
    expect(
      peerSharedCodes(
        "Ana",
        { "offer-Ana": { stickers: ["BRA1"] } },
        { isLock: false, trades: [] },
      ),
    ).toBeNull();
  });

  it("falls back to compare when lock has empty trades", () => {
    const result = peerSharedCodes(
      "Ana",
      {
        "offer-Ana": { stickers: ["BRA1"] },
        "receive-Ana": { stickers: ["MEX1"] },
      },
      { isLock: true, trades: [] },
    );
    expect(result).toEqual({ offer: ["BRA1"], receive: ["MEX1"] });
  });
});

describe("collectShared", () => {
  it("excludes current name and maps codes to peers", () => {
    const { offer, receive } = collectShared(
      "Me",
      {
        "offer-Ana": { name: "Ana", stickers: ["BRA1"] },
        "receive-Ana": { name: "Ana", stickers: ["MEX1"] },
        "offer-Bob": { name: "Bob", stickers: ["BRA1"] },
        "receive-Bob": { name: "Bob", stickers: ["USA1"] },
        "offer-Me": { name: "Me", stickers: ["FWC1"] },
        "receive-Me": { name: "Me", stickers: ["SUI1"] },
      },
      {},
    );
    expect(offer.get("BRA1")).toEqual(["Ana", "Bob"]);
    expect(receive.get("MEX1")).toEqual(["Ana"]);
    expect(receive.get("USA1")).toEqual(["Bob"]);
    expect(offer.has("FWC1")).toBe(false);
  });

  it("uses locked trades for locked peers", () => {
    const { offer, receive } = collectShared(
      "Me",
      {
        "offer-Ana": { name: "Ana", stickers: ["BRA9"] },
        "receive-Ana": { name: "Ana", stickers: ["MEX9"] },
      },
      {
        Ana: {
          isLock: true,
          trades: [stubTrade(["BRA1"], ["MEX1"])],
        },
      },
    );
    expect(offer.get("BRA1")).toEqual(["Ana"]);
    expect(receive.get("MEX1")).toEqual(["Ana"]);
    expect(offer.has("BRA9")).toBe(false);
  });
});

describe("getCompleteTrades", () => {
  it("should return trade with offer and receive", () => {
    const trades: TradeBy[] = [
      stubTrade(["BRA1"], ["MEX1"]),
      stubTrade(["BRA10"], ["USA9", "UBZ15"]),
      stubTrade(["FWC10"], [null]),
      stubTrade([null], ["SUI4"]),
    ];

    const completeTrades = filterCompleteTrades(trades);

    expect(completeTrades).length(2);
    expect(completeTrades[0].offer).toEqual(["BRA1"]);
    expect(completeTrades[0].receive).toEqual(["MEX1"]);
  });
  it("should return nothing", () => {
    const trades: TradeBy[] = [
      stubTrade(["BRA1"], [null]),
      stubTrade(["BRA10"], [null]),
      stubTrade([null], ["FWC10"]),
    ];
    const completeTrades = filterCompleteTrades(trades);

    expect(completeTrades).length(0);
  });
});

describe("getAllReceiveTrades", () => {
  it("should list 3 receive items", () => {
    const trades: TradeBy[] = [
      stubTrade(["BRA1"], ["MEX1"]),
      stubTrade(["BRA10"], ["USA9", "UBZ15"]),
      stubTrade(["FWC10"], [null]),
      stubTrade([null], ["SUI4"]),
    ];
    const completeTrades = filterCompleteTrades(trades);
    const receiveStickers = getAllReceiveTrades(completeTrades);
    expect(receiveStickers).length(3);
    expect(receiveStickers).toEqual(["MEX1", "USA9", "UBZ15"]);
  });
});

describe("getAllGiveTrades", () => {
  it("should list 2 receive items", () => {
    const trades: TradeBy[] = [
      stubTrade(["BRA1"], ["MEX1"]),
      stubTrade(["BRA10"], ["USA9", "UBZ15"]),
      stubTrade(["FWC10"], [null]),
      stubTrade([null], ["SUI4"]),
    ];
    const completeTrades = filterCompleteTrades(trades);
    const receiveStickers = getAllGiveTrades(completeTrades);
    expect(receiveStickers).length(2);
    expect(receiveStickers).toEqual(["BRA1", "BRA10"]);
  });
});
