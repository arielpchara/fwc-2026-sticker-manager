import { GROUPS } from "../data/groups";
import { TradeBy } from "../type/trade";
import { isChroma, stickerGroupByType } from "./stickerTools";

function shuffleStickers(codes: string[]) {
  const shuffled = [...codes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function trade(give: string[], receive: string[]): TradeBy[] {
  const shuffledGive = shuffleStickers(give);
  const shuffledReceive = shuffleStickers(receive);
  const tradeEntries: TradeBy[] = [];
  const maxLength = Math.max(shuffledGive.length, shuffledReceive.length);
  for (let i = 0; i < maxLength; i++) {
    tradeEntries.push({
      give: shuffledGive[i] ? [shuffledGive[i]] : [],
      receive: shuffledReceive[i] ? [shuffledReceive[i]] : [],
      type: isChroma(shuffledGive[i] ?? shuffledReceive[i] ?? "")
        ? "chroma"
        : "normal",
      savedAt: Date.now(),
      key: [shuffledGive[i], shuffledReceive[i]].sort().join(""),
    });
  }
  return tradeEntries;
}

export function sortByGroup(trades: TradeBy[]): TradeBy[] {
  const teamsInOrder = GROUPS.flatMap((group) => group.prefixes).reduce(
    (acc, prefix) => ({
      ...acc,
      [prefix]: [],
    }),
    {
      FWC: [],
    } as Record<string, TradeBy[]>,
  );
  for (const trade of trades) {
    const sticker = trade.give[0] || trade.receive[0];
    if (!sticker) continue;
    const prefix = sticker.slice(0, 3);
    if (prefix && teamsInOrder[prefix]) {
      teamsInOrder[prefix].push(trade);
    }
  }
  return Object.values(teamsInOrder).flat();
}

export function updateTrade(
  trades: TradeBy[],
  index: number,
  newTrade: TradeBy,
): TradeBy[] {
  const updated = [...trades];
  updated[index] = newTrade;
  return updated;
}

export function trader(give: string[], receive: string[]): TradeBy[] {
  const { chroma: giveChroma, normal: giveNormal } = stickerGroupByType(give);
  const { chroma: receiveChroma, normal: receiveNormal } =
    stickerGroupByType(receive);
  return [
    ...trade(giveChroma, receiveChroma),
    ...trade(giveNormal, receiveNormal),
  ];
}

export function countGiveTradedStickers(trades: TradeBy[]): number {
  return trades.reduce((count, trade) => count + trade.give.length, 0);
}

export function countReceiveTradedStickers(trades: TradeBy[]): number {
  return trades.reduce((count, trade) => count + trade.receive.length, 0);
}
