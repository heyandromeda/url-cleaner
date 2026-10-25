import { cleanTabUrl } from "./clean.js";

const status = document.querySelector("#status");
const cleaned = document.querySelector("#cleaned");
const summary = document.querySelector("#summary");
const warning = document.querySelector("#warning");
const openSite = document.querySelector("#open-site");

function show(element, text) {
  element.hidden = !text;
  element.textContent = text || "";
}

export function renderPopup(result) {
  status.dataset.kind = result.error ? "error" : "success";
  status.textContent = result.error || (result.copy ? "Copied the cleaned URL." : "");
  show(cleaned, result.cleaned);
  show(summary, result.summary);
  show(warning, result.warning);
  if (result.openSite && result.handoffUrl) {
    openSite.hidden = false;
    openSite.href = result.handoffUrl;
  } else {
    openSite.hidden = true;
    openSite.removeAttribute("href");
  }
}

async function currentTabUrl() {
  const tabs = globalThis.chrome?.tabs;
  if (!tabs?.query) return "";
  const [tab] = await tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? "";
}

async function copyCleaned(text) {
  if (!text || !navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

async function main() {
  const result = cleanTabUrl(await currentTabUrl());
  renderPopup(result);
  if (result.copy && result.cleaned) {
    try {
      const copied = await copyCleaned(result.cleaned);
      if (!copied) {
        status.textContent = "Cleaned locally. Copy the URL if your browser blocked the clipboard.";
      }
    } catch {
      status.textContent = "Cleaned locally. Copy the URL if your browser blocked the clipboard.";
    }
  }
}

main();
