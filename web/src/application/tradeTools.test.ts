import { describe, it, expect } from "vitest";
import { TradeBy, TradeSticker } from "../type/trade";
import {
  filterCompleteTrades,
  getAllGiveTrades,
  getAllReceiveTrades,
} from "./traderTool";

function stubTrade(
  give: TradeSticker[] = [],
  receive: TradeSticker[] = [],
): TradeBy {
  return {
    give: [...give],
    receive: [...receive],
    savedAt: Date.now(),
    type: "multi",
    key: "key,",
  };
}

describe("getCompleteTrades", () => {
  it("should return trade with give and receive", () => {
    const trades: TradeBy[] = [
      stubTrade(["BRA1"], ["MEX1"]),
      stubTrade(["BRA10"], ["USA9", "UBZ15"]),
      stubTrade(["FWC10"], [null]),
      stubTrade([null], ["SUI4"]),
    ];

    const completeTrades = filterCompleteTrades(trades);

    expect(completeTrades).length(2);
    expect(completeTrades[0].give).toEqual(["BRA1"]);
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
