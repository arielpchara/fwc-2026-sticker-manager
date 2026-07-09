import { useStickerGroup } from "../../application/useStickerGroup.js";
import { useOwnStickers } from "../../application/useStickers.js";
import { useLocale } from "../../i18n/index.js";
import Body from "../common/Body.js";
import GroupSticker from "../common/GroupSticker.js";
import MainLayout from "../common/MainLayout.js";

export default function MainPage() {
  const { inv } = useOwnStickers();
  const groups = useStickerGroup(inv);
  const { t } = useLocale();
  return (
    <MainLayout>
      <Body>
        {groups.byGroup.map(({ labelKey, teams }) => (
          <section key={t(labelKey as never)} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {t(labelKey as never)}
            </h2>
            <GroupSticker groups={teams} showMissing />
          </section>
        ))}
      </Body>
    </MainLayout>
  );
}
