import { GROUPS } from "../constants/groups";
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

function trade(offer: string[], receive: string[]): TradeBy[] {
  const shuffledOffer = shuffleStickers(offer);
  const shuffledReceive = shuffleStickers(receive);
  const tradeEntries: TradeBy[] = [];
  const maxLength = Math.max(shuffledOffer.length, shuffledReceive.length);
  for (let i = 0; i < maxLength; i++) {
    tradeEntries.push({
      offer: shuffledOffer[i] ? [shuffledOffer[i]] : [],
      receive: shuffledReceive[i] ? [shuffledReceive[i]] : [],
      type: isChroma(shuffledOffer[i] ?? shuffledReceive[i] ?? "")
        ? "chroma"
        : "normal",
      savedAt: Date.now(),
      key: [shuffledOffer[i], shuffledReceive[i]].sort().join(""),
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
    const sticker = trade.offer[0] || trade.receive[0];
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

export function trader(offer: string[], receive: string[]): TradeBy[] {
  const { chroma: offerChroma, normal: offerNormal } = stickerGroupByType(offer);
  const { chroma: receiveChroma, normal: receiveNormal } =
    stickerGroupByType(receive);
  return [
    ...trade(offerChroma, receiveChroma),
    ...trade(offerNormal, receiveNormal),
  ];
}

export function countOfferTradedStickers(trades: TradeBy[]): number {
  return trades.reduce((count, trade) => count + trade.offer.length, 0);
}

export function countReceiveTradedStickers(trades: TradeBy[]): number {
  return trades.reduce((count, trade) => count + trade.receive.length, 0);
}
