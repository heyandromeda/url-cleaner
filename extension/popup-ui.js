import { explainParameter } from "./vendor/explanations.js";
import { cleanTabUrl, NOTHING_TO_CLEAN } from "./clean.js";

export const COPIED = "Copied.";
export const COPIED_STILL_WRAPPED = "Copied, but still wrapped.";
export const ALREADY_CLEAN = "Already clean, copied.";
export const COPY_FAILED = "Copy failed.";
export const FOCUS_WAIT_MS = 150;

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
    const kind = result.error === NOTHING_TO_CLEAN ? "neutral" : "error";
    return { kind, text: result.error, check: false };
  }
  if (!copyOutcome) {
    return { kind: "", text: "", check: false };
  }
  if (!copyOutcome.ok) {
    return { kind: "error", text: COPY_FAILED, check: false };
  }
  if (result.unwrapLimitReached) {
    return { kind: "neutral", text: COPIED_STILL_WRAPPED, check: false };
  }
  if (!result.changed) {
    return { kind: "neutral", text: ALREADY_CLEAN, check: false };
  }
  return { kind: "success", text: COPIED, check: true };
}

export async function waitForDocumentFocus({
  win = globalThis,
  doc = globalThis.document,
  now = Date.now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs = FOCUS_WAIT_MS
} = {}) {
  try {
    win.focus?.();
  } catch {
    // Popup may not allow focus; the execCommand fallback still runs.
  }
  if (typeof doc?.hasFocus !== "function") return true;
  if (doc.hasFocus()) return true;

  const deadline = now() + timeoutMs;
  while (!doc.hasFocus() && now() < deadline) {
    await sleep(Math.min(16, Math.max(0, deadline - now())));
  }
  return doc.hasFocus();
}

export function copyWithExecCommand(text, doc = globalThis.document) {
  if (!text || !doc?.body || typeof doc.execCommand !== "function") return false;
  const previousFocus = doc.activeElement;
  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;";
  doc.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let ok = false;
  try {
    ok = Boolean(doc.execCommand("copy"));
  } catch {
    ok = false;
  }
  textarea.remove();
  if (previousFocus && typeof previousFocus.focus === "function") {
    try {
      previousFocus.focus();
    } catch {
      // Popup may not allow restoring focus to the prior control.
    }
  }
  return ok;
}

export async function writeClipboard(text, {
  clipboard = globalThis.navigator?.clipboard,
  win = globalThis,
  doc = globalThis.document,
  now,
  sleep,
  timeoutMs,
  copyFallback = copyWithExecCommand
} = {}) {
  if (!text) return { ok: false };

  await waitForDocumentFocus({ win, doc, now, sleep, timeoutMs });

  try {
    if (clipboard?.writeText) {
      await clipboard.writeText(text);
      return { ok: true };
    }
  } catch {
    // MV3 popups often reject with "Document is not focused".
  }

  const fallbackOk = typeof copyFallback === "function" ? copyFallback(text, doc) : false;
  return { ok: Boolean(fallbackOk) };
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
  const unwrapHosts = [...new Set(result.unwrappedFrom ?? [])];
  const removedCount = unique.length + (unwrapHosts.length ? 1 : 0);
  if (elements.removedRow && elements.removedBadge && elements.chips) {
    if (removedCount) {
      elements.removedRow.hidden = false;
      elements.removedBadge.textContent = removedCount === 1 ? "1 removed" : `${removedCount} removed`;
      elements.chips.replaceChildren();
      for (const host of unwrapHosts) {
        const chip = document.createElement("li");
        chip.className = "chip-unwrap";
        chip.textContent = `${host} redirect`;
        chip.title = `Redirect wrapper on ${host}`;
        elements.chips.append(chip);
      }
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
  elements = popupElements(),
  win,
  doc,
  copyFallback
} = {}) {
  if (!result.copy || !result.cleaned) {
    applyHeadline(elements, headlineFor(result, null));
    return { ok: false };
  }
  const outcome = await writeClipboard(result.cleaned, { clipboard, win, doc, copyFallback });
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
  elements = popupElements(),
  win,
  doc,
  copyFallback
} = {}) {
  const result = cleanTabUrl(tabUrl ?? await currentTabUrl());
  renderResult(result, elements);
  await settleCopy(result, { clipboard, elements, win, doc, copyFallback });
  return result;
}
