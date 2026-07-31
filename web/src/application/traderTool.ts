import { GROUPS } from "../constants/groups";
import { TradeBy, TradeSticker } from "../type/trade";
import { isChroma, stickerGroupByType } from "./stickerTools";

const notNull = (list: TradeSticker[]): string[] =>
  list.filter((code) => code !== null);

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

export function filterCompleteTrades(trades: TradeBy[]): TradeBy[] {
  return trades.filter(
    ({ offer, receive }) =>
      notNull(offer).length > 0 && notNull(receive).length > 0,
  );
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

/** Set one side of a trade to `codes`; pull those codes off other rows; drop empty rows. */
export function applyManualTradeSide(
  trades: TradeBy[],
  fromKey: string,
  codes: string[],
  mode: "offer" | "receive",
): TradeBy[] {
  const taken = new Set(codes);
  const target = trades.find((t) => t.key === fromKey);
  if (!target) return trades;

  const prevSide = notNull(mode === "offer" ? target.offer : target.receive);
  const displaced = prevSide.filter((c) => !taken.has(c));

  const next = trades
    .map((t) => {
      if (t.key === fromKey) {
        const other = mode === "offer" ? t.receive : t.offer;
        const multi =
          codes.length > 1 || notNull(other).length > 1 ? "multi" : t.type;
        return {
          ...t,
          ...(mode === "offer" ? { offer: codes } : { receive: codes }),
          type: multi as TradeBy["type"],
        };
      }
      const side = mode === "offer" ? t.offer : t.receive;
      const filtered = side.filter((c) => c == null || !taken.has(c));
      if (filtered.length === side.length) return t;
      return {
        ...t,
        ...(mode === "offer" ? { offer: filtered } : { receive: filtered }),
      };
    })
    .filter((t) => notNull(t.offer).length > 0 || notNull(t.receive).length > 0);

  for (const code of displaced) {
    next.push({
      offer: mode === "offer" ? [code] : [],
      receive: mode === "receive" ? [code] : [],
      type: isChroma(code) ? "chroma" : "normal",
      savedAt: Date.now(),
      key: `${code}-solo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
  }
  return next;
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

export function getAllReceiveTrades(trades: TradeBy[]): string[] {
  return trades.reduce(
    (all, { receive }) => [...all, ...notNull(receive)],
    [] as string[],
  );
}

export function getAllGiveTrades(trades: TradeBy[]): string[] {
  return trades.reduce(
    (all, { offer }) => [...all, ...notNull(offer)],
    [] as string[],
  );
}
