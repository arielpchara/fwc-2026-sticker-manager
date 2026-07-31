import { flagOf } from "../constants/flags";
import { StickerGroupByTeam } from "../type/group";
import { Inventory } from "../type/sticker";
import { TradeBy } from "../type/trade";
import { filterStickersForCopy } from "./filterInventory";
import { isChroma } from "./stickerTools";
import { filterCompleteTrades } from "./traderTool";

export function copy(message: string): void {
  navigator.clipboard.writeText(message);
}

function formatStickerTrade(code: string | null): string {
  if (code == null) return "";
  const suffix = isChroma(code) ? "*" : "";
  return `${flagOf(code.slice(0, 3))} ${code}${suffix}`;
}

function formatTrade(trade: TradeBy): string {
  const line = [];
  trade.offer.length > 0 &&
    line.push(trade.offer.map(formatStickerTrade).join(", "));
  trade.receive.length > 0 &&
    line.push(trade.receive.map(formatStickerTrade).join(", "));
  return line.join(" <-> ");
}

export function messageCompleteTrade(
  trade: TradeBy[],
  header: string = "",
  footer: string = "",
): string {
  return [
    header,
    ...filterCompleteTrades(trade)
      .map(formatTrade)
      .filter((line) => line.length > 0),
    footer,
  ].join("\n");
}

export function messageAllTrades(
  trade: TradeBy[],
  header: string = "",
  footer: string = "",
): string {
  return [
    header,
    ...trade.map(formatTrade).filter((line) => line.length > 0),
    footer,
  ].join("\n");
}

export function messageStickerListByTeam(
  byTeams: StickerGroupByTeam[],
  header: string = "",
  footer: string = "",
  includeZero = false,
): string {
  return messageMissing(byTeams, header, footer, includeZero);
}

export function messageMissing(
  trades: StickerGroupByTeam[],
  header: string = "",
  footer: string = "",
  includeZero = false,
): string {
  return [
    header,
    ...trades.flatMap(({ team, stickers }) => {
      const codes = Object.keys(filterStickersForCopy(stickers, includeZero));
      return codes.length > 0 ? [`${flagOf(team)} ${codes.join(", ")}`] : [];
    }),
    footer,
  ].join("\n");
}
