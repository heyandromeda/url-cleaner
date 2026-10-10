import { cleanUrl, isOpaqueShortener } from "./cleaner.js";

const form = document.querySelector("#clean-form");
const input = document.querySelector("#url-input");
const pasteButton = document.querySelector("#paste-button");
const cleanOnPaste = document.querySelector("#clean-on-paste");
const autoCopy = document.querySelector("#auto-copy");
const resultPanel = document.querySelector("#result-panel");
const originalOutput = document.querySelector("#original-url");
const output = document.querySelector("#cleaned-url");
const shortenerWarning = document.querySelector("#shortener-warning");
const shareButton = document.querySelector("#share-button");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const removedList = document.querySelector("#removed-list");

const CLEAN_ON_PASTE_KEY = "url-cleaner.clean-on-paste";
const AUTO_COPY_KEY = "url-cleaner.auto-copy";
let cleanedValue = "";

function readSetting(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Settings are a convenience; the cleaner still works if storage is unavailable.
  }
}

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function renderRemoved(parameters) {
  removedList.replaceChildren();

  if (parameters.length === 0) {
    const item = document.createElement("li");
    item.textContent = "None";
    item.className = "muted";
    removedList.append(item);
    return;
  }

  for (const parameter of parameters) {
    const item = document.createElement("li");
    item.textContent = parameter;
    removedList.append(item);
  }
}

function renderOriginalUrl(value, removedParameters) {
  const url = new URL(value.trim());
  const removedNames = new Set(removedParameters.map((name) => name.toLowerCase()));
  const base = url.href.slice(0, url.href.length - url.search.length - url.hash.length);

  originalOutput.replaceChildren(document.createTextNode(base));

  const entries = [...url.searchParams.entries()];
  entries.forEach(([name, parameterValue], index) => {
    originalOutput.append(document.createTextNode(index === 0 ? "?" : "&"));
    const segment = document.createElement(removedNames.has(name.toLowerCase()) ? "mark" : "span");
    segment.textContent = new URLSearchParams([[name, parameterValue]]).toString();
    originalOutput.append(segment);
  });

  if (url.hash) {
    originalOutput.append(document.createTextNode(url.hash));
  }
}

async function copyText(value) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function showCleanResult(result, { allowAutoCopy = true, originalValue = "" } = {}) {
  cleanedValue = result.url;
  renderOriginalUrl(originalValue, result.removedParameters);
  output.textContent = result.url;
  renderRemoved(result.removedParameters);
  shortenerWarning.hidden = !isOpaqueShortener(originalValue);
  resultPanel.hidden = false;
  copyButton.disabled = false;

  const baseMessage = result.changed
    ? "Tracking parameters removed."
    : "Already clean — no tracking parameters found.";

  showMessage(baseMessage, "success");

  if (allowAutoCopy && autoCopy.checked) {
    copyText(cleanedValue).then((copied) => {
      showMessage(
        copied ? `${baseMessage} Copied to clipboard.` : `${baseMessage} Clipboard copy was unavailable.`,
        copied ? "success" : "info"
      );
    });
  }
}

function runClean(options = {}) {
  resultPanel.hidden = true;
  copyButton.disabled = true;
  cleanedValue = "";

  try {
    const originalValue = input.value;
    showCleanResult(cleanUrl(originalValue), { ...options, originalValue });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function pasteFromClipboard() {
  if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
    showMessage("Clipboard access is unavailable. Paste the URL manually.", "error");
    return;
  }

  try {
    input.value = await navigator.clipboard.readText();
    input.focus();
    if (cleanOnPaste.checked) {
      runClean();
    } else {
      showMessage("URL pasted.");
    }
  } catch {
    showMessage("Clipboard permission was denied. Paste the URL manually.", "error");
  }
}

cleanOnPaste.checked = readSetting(CLEAN_ON_PASTE_KEY, true);
autoCopy.checked = readSetting(AUTO_COPY_KEY, false);
shareButton.hidden = typeof navigator.share !== "function";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runClean();
});

pasteButton.addEventListener("click", pasteFromClipboard);

input.addEventListener("paste", () => {
  if (cleanOnPaste.checked) {
    // Wait for the browser to insert the pasted text before cleaning once.
    window.setTimeout(() => runClean(), 0);
  }
});

cleanOnPaste.addEventListener("change", () => {
  saveSetting(CLEAN_ON_PASTE_KEY, cleanOnPaste.checked);
});

autoCopy.addEventListener("change", () => {
  saveSetting(AUTO_COPY_KEY, autoCopy.checked);
});

copyButton.addEventListener("click", async () => {
  if (!cleanedValue) return;

  if (await copyText(cleanedValue)) {
    showMessage("Cleaned URL copied.", "success");
  } else {
    showMessage("Copy failed. Select the URL and copy it manually.", "error");
  }
});

shareButton.addEventListener("click", async () => {
  if (!cleanedValue || typeof navigator.share !== "function") return;

  try {
    await navigator.share({ url: cleanedValue });
    showMessage("Cleaned URL shared.", "success");
  } catch (error) {
    if (error?.name !== "AbortError") {
      showMessage("Sharing was unavailable. Copy the URL instead.", "error");
    }
  }
});

const sharedUrl = new URL(window.location.href).searchParams.get("url");
if (sharedUrl) {
  input.value = sharedUrl;
  runClean({ allowAutoCopy: false });
  window.history.replaceState(null, "", window.location.pathname);
}
