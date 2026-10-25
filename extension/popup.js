import { applySystemTheme, bootPopup, popupElements, settleCopy } from "./popup-ui.js";
import { cleanTabUrl } from "./clean.js";

applySystemTheme();

const elements = popupElements();
const last = { result: await bootPopup({ elements }) };

elements.copyAgain?.addEventListener("click", async () => {
  if (!last.result?.cleaned) return;
  await settleCopy({ ...last.result, copy: true }, { elements });
});

globalThis.urlCleanerPopup = {
  bootPopup: async (options) => {
    last.result = await bootPopup({ elements, ...options });
    return last.result;
  },
  popupElements,
  settleCopy,
  cleanTabUrl,
  applySystemTheme
};
