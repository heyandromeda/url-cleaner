import { explainParameter } from "./vendor/explanations.js";
import { cleanTabUrl } from "./clean.js";

export const COPIED = "Copied!";
export const ALREADY_CLEAN = "Already clean, copied";
export const COPY_FAILED = "Copy failed.";

const CHECK_SVG = `<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function popupElements(doc = document) {
  return {
    headline: doc.querySelector("#headline"),
    headlineIcon: doc.querySelector("#headline-icon"),
    status: doc.querySelector("#status"),
    cleaned: doc.querySelector("#cleaned"),
    removedRow: doc.querySelector("#removed-row"),
    removedBadge: doc.querySelector("#removed-badge"),
    chips: doc.querySelector("#chips"),
    warning: doc.querySelector("#warning"),
    actions: doc.querySelector("#actions"),
    copyAgain: doc.querySelector("#copy-again"),
    openSite: doc.querySelector("#open-site")
  };
}

export function headlineFor(result, copyOutcome) {
  if (result.error) {
    return { kind: "error", text: result.error, check: false };
  }
  if (!copyOutcome) {
    return { kind: "", text: "", check: false };
  }
  if (!copyOutcome.ok) {
    return { kind: "error", text: COPY_FAILED, check: false };
  }
  if (!result.removedParams.length) {
    return { kind: "neutral", text: ALREADY_CLEAN, check: false };
  }
  return { kind: "success", text: COPIED, check: true };
}

export async function writeClipboard(text, clipboard = globalThis.navigator?.clipboard) {
  if (!text || !clipboard?.writeText) return { ok: false };
  try {
    await clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function showText(element, text) {
  if (!element) return;
  element.hidden = !text;
  element.textContent = text || "";
}

export function applyHeadline(elements, headline) {
  const { headline: wrap, headlineIcon, status } = elements;
  if (!wrap || !status) return;

  wrap.hidden = !headline.text;
  wrap.classList.remove("is-success", "is-neutral", "is-error", "is-pop");
  if (headline.kind) wrap.classList.add(`is-${headline.kind}`);
  status.dataset.kind = headline.kind || "";
  status.textContent = headline.text;
  if (headlineIcon) {
    headlineIcon.innerHTML = headline.check ? CHECK_SVG : "";
  }
  if (headline.text && headline.kind === "success") {
    wrap.classList.add("is-pop");
  }
}

export function renderResult(result, elements = popupElements()) {
  applyHeadline(elements, headlineFor(result, null));

  const cleaned = elements.cleaned;
  if (cleaned) {
    if (result.cleaned) {
      cleaned.hidden = false;
      cleaned.textContent = result.cleaned;
      cleaned.title = result.cleaned;
    } else {
      cleaned.hidden = true;
      cleaned.textContent = "";
      cleaned.removeAttribute("title");
    }
  }

  const unique = [...new Set(result.removedParams)];
  if (elements.removedRow && elements.removedBadge && elements.chips) {
    if (unique.length) {
      elements.removedRow.hidden = false;
      const countLabel = unique.length === 1 ? "1 removed" : `${unique.length} removed`;
      elements.removedBadge.textContent = countLabel;
      elements.chips.replaceChildren();
      for (const name of unique) {
        const chip = document.createElement("li");
        chip.textContent = name;
        chip.title = explainParameter(name) || name;
        elements.chips.append(chip);
      }
    } else {
      elements.removedRow.hidden = true;
      elements.removedBadge.textContent = "";
      elements.chips.replaceChildren();
    }
  }

  showText(elements.warning, result.warning);

  const canAct = Boolean(result.cleaned && (result.copy || result.openSite));
  if (elements.actions) elements.actions.hidden = !canAct;
  if (elements.copyAgain) elements.copyAgain.hidden = !result.cleaned;
  if (elements.openSite) {
    if (result.openSite && result.handoffUrl) {
      elements.openSite.hidden = false;
      elements.openSite.href = result.handoffUrl;
    } else {
      elements.openSite.hidden = true;
      elements.openSite.removeAttribute("href");
    }
  }
}

export async function settleCopy(result, {
  clipboard = globalThis.navigator?.clipboard,
  elements = popupElements()
} = {}) {
  if (!result.copy || !result.cleaned) {
    applyHeadline(elements, headlineFor(result, null));
    return { ok: false };
  }
  const outcome = await writeClipboard(result.cleaned, clipboard);
  applyHeadline(elements, headlineFor(result, outcome));
  return outcome;
}

export async function currentTabUrl() {
  const tabs = globalThis.chrome?.tabs;
  if (!tabs?.query) return "";
  const [tab] = await tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? "";
}

export function applySystemTheme(doc = document, media = globalThis.matchMedia?.("(prefers-color-scheme: dark)")) {
  doc.documentElement.dataset.theme = media?.matches ? "dark" : "light";
}

export async function bootPopup({
  tabUrl,
  clipboard = globalThis.navigator?.clipboard,
  elements = popupElements()
} = {}) {
  const result = cleanTabUrl(tabUrl ?? await currentTabUrl());
  renderResult(result, elements);
  await settleCopy(result, { clipboard, elements });
  return result;
}
