import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findMissing, findOffer } from "../../application/compareTools.js";
import { trader } from "../../application/traderTool.js";
import { useCompareHistory } from "../../hooks/useCompareHistory.js";
import { useStickers } from "../../hooks/useStickers.js";
import { useTrade } from "../../hooks/useTrade.js";
import { useLocale } from "../../i18n/index.js";
import type { CompareEntry } from "../../type/compare.js";
import BottomSheet from "../common/BottomSheet.js";
import Modal from "../common/Modal.js";
import CompareHistory from "./CompareHistory.js";
import CompareResult from "./CompareResult.js";

type Mode = "receive" | "offer";
type Step = 1 | 2 | 3;

function otherMode(m: Mode): Mode {
  return m === "receive" ? "offer" : "receive";
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={mode === "offer"}
      disabled={disabled}
      onClick={() => onChange(mode === "receive" ? "offer" : "receive")}
      className="relative inline-flex items-center rounded-lg bg-surface-2 p-0.5 border border-border disabled:opacity-60"
    >
      <span
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-transform duration-150 ${
          mode === "offer" ? "translate-x-full" : "translate-x-0"
        } bg-gold shadow-[0_0_10px_rgba(201,162,39,0.35)]`}
      />
      <span
        className={`relative z-10 px-3 py-1.5 text-xs font-medium min-w-[4.5rem] text-center transition-colors ${
          mode === "receive" ? "text-bg" : "text-muted"
        }`}
      >
        {t("compareReceiveTab")}
      </span>
      <span
        className={`relative z-10 px-3 py-1.5 text-xs font-medium min-w-[4.5rem] text-center transition-colors ${
          mode === "offer" ? "text-bg" : "text-muted"
        }`}
      >
        {t("compareOfferTab")}
      </span>
    </button>
  );
}

export default function CompareStickers() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const { inventory, extraInventory } = useStickers();
  const { entries, saveEntry, deleteEntry } = useCompareHistory();
  const { trades: storedTrades, saveTrade } = useTrade();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [firstMode, setFirstMode] = useState<Mode>("receive");
  const [label, setLabel] = useState("");
  const [textReceive, setTextReceive] = useState("");
  const [textOffer, setTextOffer] = useState("");
  const [receiveItems, setReceiveItems] = useState<string[]>([]);
  const [offerItems, setOfferItems] = useState<string[]>([]);

  const secondMode = otherMode(firstMode);

  const resetForm = useCallback(() => {
    setStep(1);
    setFirstMode("receive");
    setLabel("");
    setTextReceive("");
    setTextOffer("");
    setReceiveItems([]);
    setOfferItems([]);
  }, []);

  const openNew = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  function saveMode(
    mode: Mode,
    text: string,
    name: string,
  ): string[] {
    if (!text.trim()) return [];
    if (mode === "receive") {
      const missing = findMissing(text, inventory);
      saveEntry({
        name,
        text,
        savedAt: Date.now(),
        stickers: missing,
        mode: "receive",
      });
      return missing;
    }
    const offer = findOffer(text, extraInventory);
    saveEntry({
      name,
      text,
      savedAt: Date.now(),
      stickers: offer,
      mode: "offer",
    });
    return offer;
  }

  function finishCompare(recvText: string, offText: string, nameRaw: string) {
    const name = nameRaw.trim();
    if (!name) return;
    const recv = saveMode("receive", recvText, name);
    const off = saveMode("offer", offText, name);
    setReceiveItems(recv);
    setOfferItems(off);
    setStep(3);
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    const name = label.trim();
    const existing = entries[`${secondMode}-${name}`]?.text ?? "";
    if (secondMode === "receive") setTextReceive((v) => v || existing);
    else setTextOffer((v) => v || existing);
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    finishCompare(textReceive, textOffer, label);
  }

  function handleSkipStep2() {
    if (!label.trim()) return;
    const recv = firstMode === "receive" ? textReceive : "";
    const off = firstMode === "offer" ? textOffer : "";
    if (secondMode === "receive") setTextReceive("");
    else setTextOffer("");
    finishCompare(recv, off, label);
  }

  function refreshEntry(entry: CompareEntry): string[] {
    const stickers =
      entry.mode === "receive"
        ? findMissing(entry.text, inventory)
        : findOffer(entry.text, extraInventory);
    saveEntry({
      ...entry,
      stickers,
      savedAt: Date.now(),
    });
    return stickers;
  }

  function handleReopen(entry: CompareEntry) {
    const name = entry.name;
    const recvEntry = entries[`receive-${name}`];
    const offEntry = entries[`offer-${name}`];

    setLabel(name);
    setFirstMode(entry.mode);
    setTextReceive(recvEntry?.text ?? (entry.mode === "receive" ? entry.text : ""));
    setTextOffer(offEntry?.text ?? (entry.mode === "offer" ? entry.text : ""));

    const recv = recvEntry
      ? refreshEntry(recvEntry)
      : entry.mode === "receive"
        ? refreshEntry(entry)
        : [];
    const off = offEntry
      ? refreshEntry(offEntry)
      : entry.mode === "offer"
        ? refreshEntry(entry)
        : [];

    setReceiveItems(recv);
    setOfferItems(off);
    setStep(3);
    setOpen(true);
  }

  function handleRefreshAll() {
    for (const entry of Object.values(entries)) {
      refreshEntry(entry);
    }
  }

  const stepIndicator = (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
      {([1, 2, 3] as Step[]).map((n, i) => (
        <span key={n} className="inline-flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>→</span>}
          <span className={step === n ? "text-gold font-medium" : ""}>
            {n}.{" "}
            {n === 1
              ? t("compareStepFirst")
              : n === 2
                ? t("compareStepSecond")
                : t("compareStepResult")}
          </span>
        </span>
      ))}
    </div>
  );

  const formatsHelp = (
    <div className="bg-surface-2 rounded-lg p-3 space-y-1.5">
      <p className="text-xs font-medium text-fg">{t("ownFormatsTitle")}</p>
      <ul className="text-[11px] text-muted space-y-1 font-mono">
        <li>{t("ownFormatCodes")}</li>
        <li>{t("ownFormatQty")}</li>
        <li>{t("ownFormatGrouped")}</li>
      </ul>
      <p className="text-[11px] text-muted">{t("ownFormatMixed")}</p>
    </div>
  );

  const firstText = firstMode === "receive" ? textReceive : textOffer;
  const setFirstText = firstMode === "receive" ? setTextReceive : setTextOffer;
  const secondText = secondMode === "receive" ? textReceive : textOffer;
  const setSecondText =
    secondMode === "receive" ? setTextReceive : setTextOffer;

  const step1 = (
    <form onSubmit={handleStep1} className="space-y-3">
      {stepIndicator}
      <p className="text-xs text-muted">{t("compareStep1Hint")}</p>
      <ModeToggle mode={firstMode} onChange={setFirstMode} />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t("historyLabelPlaceholder")}
        required
        className="w-full border border-border bg-bg rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <textarea
        value={firstText}
        onChange={(e) => setFirstText(e.target.value)}
        placeholder={t("comparePlaceholder")}
        rows={4}
        className="w-full border border-border bg-bg rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      {formatsHelp}
      <button
        type="submit"
        disabled={!label.trim()}
        className="btn-glow w-full text-sm font-medium px-4 py-2.5 rounded-lg"
      >
        {t("compareStepNext")}
      </button>
    </form>
  );

  const step2 = (
    <form onSubmit={handleStep2} className="space-y-3">
      {stepIndicator}
      <p className="text-xs text-muted">
        {t("compareStep2Hint", {
          mode: t(
            secondMode === "receive"
              ? "compareReceiveTab"
              : "compareOfferTab",
          ),
        })}
      </p>
      <ModeToggle mode={secondMode} onChange={() => {}} disabled />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t("historyLabelPlaceholder")}
        required
        className="w-full border border-border bg-bg rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <textarea
        value={secondText}
        onChange={(e) => setSecondText(e.target.value)}
        placeholder={t("comparePlaceholder")}
        rows={4}
        className="w-full border border-border bg-bg rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      {formatsHelp}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-medium px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-fg"
        >
          ← {t("compareStepBack")}
        </button>
        <button
          type="button"
          onClick={handleSkipStep2}
          disabled={!label.trim()}
          className="text-sm font-medium px-4 py-2.5 rounded-lg border border-border text-muted hover:text-fg disabled:opacity-40"
        >
          {t("compareStepSkip")}
        </button>
        <button
          type="submit"
          disabled={!label.trim()}
          className="btn-glow flex-1 text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          {t("compareBtn")}
        </button>
      </div>
    </form>
  );

  const step3 = (
    <div className="space-y-3">
      {stepIndicator}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-fg"
        >
          ← {t("compareStepBack")}
        </button>
        {label.trim() &&
          receiveItems.length > 0 &&
          offerItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const name = label.trim() || t("historyUnnamed");
                if (!storedTrades[name]?.isLock) {
                  saveTrade(name, trader(offerItems, receiveItems), true);
                }
                closeDialog();
                navigate(`/compare/${name}`);
              }}
              className="btn-glow text-xs font-medium px-3 py-1.5 rounded-lg ml-auto"
            >
              {t("tradeWith", { name: label.trim() })}
            </button>
          )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-2 min-w-0">
          <p className="text-xs font-semibold text-copper uppercase tracking-wide">
            {t("compareOfferTab")}
          </p>
          {offerItems.length === 0 ? (
            <p className="text-xs text-muted">{t("compareEmptySide")}</p>
          ) : (
            <CompareResult items={offerItems} mode="offer" />
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-2 min-w-0">
          <p className="text-xs font-semibold text-gold uppercase tracking-wide">
            {t("compareReceiveTab")}
          </p>
          {receiveItems.length === 0 ? (
            <p className="text-xs text-muted">{t("compareEmptySide")}</p>
          ) : (
            <CompareResult items={receiveItems} mode="receive" />
          )}
        </div>
      </div>
    </div>
  );

  const dialogBody = step === 1 ? step1 : step === 2 ? step2 : step3;
  const dialogTitle =
    step === 3
      ? `${t("dialogCompare")} · ${label.trim() || t("historyUnnamed")}`
      : t("dialogCompare");

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold text-fg mr-auto">
          {t("historyTitle")}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/compare/validate")}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-muted border border-border hover:border-gold hover:text-fg transition"
        >
          {t("btnValidate")}
        </button>
        <button
          type="button"
          onClick={openNew}
          className="btn-glow inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("compareNew")}
        </button>
      </div>

      <CompareHistory
        entries={Object.values(entries)}
        onTradeNavigate={(name) => {
          if (!storedTrades[name]?.isLock) {
            const offer = entries[`offer-${name}`]?.stickers ?? [];
            const receive = entries[`receive-${name}`]?.stickers ?? [];
            saveTrade(name, trader(offer, receive), true);
          }
          navigate(`/compare/${name}`);
        }}
        onReopen={handleReopen}
        onRefreshAll={handleRefreshAll}
        onDelete={deleteEntry}
      />

      {desktop ? (
        <Modal open={open} onClose={closeDialog} title={dialogTitle}>
          <div className={step === 3 ? "md:min-w-[36rem]" : undefined}>
            {dialogBody}
          </div>
        </Modal>
      ) : (
        <BottomSheet open={open} onClose={closeDialog} title={dialogTitle}>
          {dialogBody}
        </BottomSheet>
      )}
    </div>
  );
}
