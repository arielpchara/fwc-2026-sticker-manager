import { flagOf } from "../data/flags";
import { StickerGroupByTeam } from "../type/group";
import { Stickers } from "../type/sticker";
import { TradeBy } from "../type/trade";
import { isChroma } from "./stickerTools";

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
  trade.give.length > 0 &&
    line.push(trade.give.map(formatStickerTrade).join(", "));
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
    ...trade.map(formatTrade).filter((line) => line.length > 0),
    footer,
  ].join("\n");
}

export function messageMissingTrade(
  trade: TradeBy[],
  header: string = "",
  footer: string = "",
): string {
  return [
    header,
    ...trade
      .filter((t) => t.give.length === 0 && t.receive.length > 0)
      .map(formatTrade)
      .filter((line) => line.length > 0),
    footer,
  ].join("\n");
}

export function messageStickerListByTeam(
  byTeams: StickerGroupByTeam[],
  header: string = "",
  footer: string = "",
): string {
  const want = byTeams.map(({ team, stickers }) => {
    const icon = flagOf(team);
    return `${icon} ${Object.keys(stickers)}`;
  });
  return [header, ...want.filter(Boolean), footer].join("\n");
}
