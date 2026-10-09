import { cleanUrl, isOpaqueShortener } from "./cleaner.js";

const form = document.querySelector("#clean-form");
const input = document.querySelector("#url-input");
const pasteButton = document.querySelector("#paste-button");
const inspectButton = document.querySelector("#inspect-button");
const cleanOnPaste = document.querySelector("#clean-on-paste");
const autoCopy = document.querySelector("#auto-copy");
const aggressiveMode = document.querySelector("#aggressive-mode");
const unwrapRedirects = document.querySelector("#unwrap-redirects");
const removeDuplicates = document.querySelector("#remove-duplicates");
const resultPanel = document.querySelector("#result-panel");
const originalOutput = document.querySelector("#original-url");
const output = document.querySelector("#cleaned-url");
const shortenerWarning = document.querySelector("#shortener-warning");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const removedList = document.querySelector("#removed-list");
const fingerprintSummary = document.querySelector("#fingerprint-summary");
const fingerprintCount = document.querySelector("#fingerprint-count");
const redirectPanel = document.querySelector("#redirect-panel");
const redirectList = document.querySelector("#redirect-list");
const duplicateSummary = document.querySelector("#duplicate-summary");
const urlParts = document.querySelector("#url-parts");
const parameterBreakdown = document.querySelector("#parameter-breakdown");
const weirdnessPanel = document.querySelector("#weirdness-panel");
const weirdnessList = document.querySelector("#weirdness-list");
const xrayPanel = document.querySelector("#xray-panel");

const CLEAN_ON_PASTE_KEY = "url-cleaner.clean-on-paste";
const AUTO_COPY_KEY = "url-cleaner.auto-copy";
const AGGRESSIVE_MODE_KEY = "url-cleaner.aggressive-mode";
const UNWRAP_REDIRECTS_KEY = "url-cleaner.unwrap-redirects";
const REMOVE_DUPLICATES_KEY = "url-cleaner.remove-duplicates";
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

function renderRemoved(parameters, aggressiveParameters = []) {
  removedList.replaceChildren();
  const aggressiveNames = new Set(aggressiveParameters.map((name) => name.toLowerCase()));

  if (parameters.length === 0) {
    const item = document.createElement("li");
    item.textContent = "None";
    item.className = "muted";
    removedList.append(item);
    return;
  }

  for (const parameter of parameters) {
    const item = document.createElement("li");
    item.textContent = aggressiveNames.has(parameter.toLowerCase()) ? `${parameter} (aggressive)` : parameter;
    if (aggressiveNames.has(parameter.toLowerCase())) item.className = "aggressive-removal";
    removedList.append(item);
  }
}

function addPart(name, value) {
  const term = document.createElement("dt");
  term.textContent = name;
  const description = document.createElement("dd");
  description.textContent = value;
  urlParts.append(term, description);
}

function renderInspection(inspection) {
  urlParts.replaceChildren();
  addPart("Scheme", inspection.scheme);
  addPart("Host", inspection.host);
  addPart("Port", inspection.port);
  addPart("Path", inspection.path);
  addPart("Fragment", inspection.fragment);

  parameterBreakdown.replaceChildren();
  if (inspection.parameters.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No query parameters.";
    parameterBreakdown.append(empty);
  }
  for (const parameter of inspection.parameters) {
    const row = document.createElement("div");
    row.className = "parameter-row";
    const heading = document.createElement("strong");
    heading.textContent = parameter.name;
    const category = document.createElement("span");
    category.className = `category category-${parameter.category.replace("/", "-")}`;
    category.textContent = parameter.category;
    const value = document.createElement("code");
    value.textContent = parameter.value || "(empty)";
    row.append(heading, category, value);
    for (const decoded of parameter.decodedValues) {
      const decodedValue = document.createElement("small");
      decodedValue.textContent = `Decoded: ${decoded}`;
      row.append(decodedValue);
    }
    parameterBreakdown.append(row);
  }

  weirdnessList.replaceChildren();
  const flags = inspection.weirdness.length > 0
    ? inspection.weirdness
    : ["No unusual URL characteristics detected."];
  weirdnessPanel.dataset.clear = String(inspection.weirdness.length === 0);
  for (const flag of flags) {
    const item = document.createElement("li");
    item.textContent = flag;
    weirdnessList.append(item);
  }
}

function renderRedirectLayers(layers) {
  redirectList.replaceChildren();
  redirectPanel.hidden = layers.length === 0;
  for (const layer of layers) {
    const item = document.createElement("li");
    const host = document.createElement("strong");
    host.textContent = layer.host;
    const destination = document.createElement("code");
    destination.textContent = layer.to;
    item.append(host, document.createTextNode(` via ${layer.parameter} → `), destination);
    redirectList.append(item);
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

function showCleanResult(result, { allowAutoCopy = true, originalValue = "", revealInspection = false } = {}) {
  cleanedValue = result.url;
  renderOriginalUrl(originalValue, result.removedParameters);
  output.textContent = result.url;
  renderRemoved(result.removedParameters, result.aggressiveRemovedParameters);
  shortenerWarning.hidden = !isOpaqueShortener(originalValue);
  fingerprintCount.textContent = String(result.fingerprint.count);
  fingerprintSummary.textContent = `${result.fingerprint.label} — ${result.fingerprint.categories.tracking} tracking, ${result.fingerprint.categories.affiliate} affiliate/referral, ${result.fingerprint.categories.wrappers} redirect wrapper.`;
  renderRedirectLayers(result.redirectLayers);
  duplicateSummary.hidden = result.duplicateParameters.length === 0;
  duplicateSummary.textContent = result.duplicateParameters.length === 0 ? "" : `${result.duplicateParameters.length} identical duplicate parameter${result.duplicateParameters.length === 1 ? "" : "s"} removed; different values were preserved.`;
  renderInspection(result.inspection);
  if (revealInspection) xrayPanel.open = true;
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
    showCleanResult(cleanUrl(originalValue, {
      aggressive: aggressiveMode.checked,
      unwrapRedirects: unwrapRedirects.checked,
      removeDuplicateParameters: removeDuplicates.checked
    }), { ...options, originalValue });
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
aggressiveMode.checked = readSetting(AGGRESSIVE_MODE_KEY, false);
unwrapRedirects.checked = readSetting(UNWRAP_REDIRECTS_KEY, true);
removeDuplicates.checked = readSetting(REMOVE_DUPLICATES_KEY, false);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runClean();
});

pasteButton.addEventListener("click", pasteFromClipboard);
inspectButton.addEventListener("click", () => runClean({ allowAutoCopy: false, revealInspection: true }));

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

aggressiveMode.addEventListener("change", () => {
  saveSetting(AGGRESSIVE_MODE_KEY, aggressiveMode.checked);
  if (input.value) runClean({ allowAutoCopy: false });
});

unwrapRedirects.addEventListener("change", () => {
  saveSetting(UNWRAP_REDIRECTS_KEY, unwrapRedirects.checked);
  if (input.value) runClean({ allowAutoCopy: false });
});

removeDuplicates.addEventListener("change", () => {
  saveSetting(REMOVE_DUPLICATES_KEY, removeDuplicates.checked);
  if (input.value) runClean({ allowAutoCopy: false });
});

copyButton.addEventListener("click", async () => {
  if (!cleanedValue) return;

  if (await copyText(cleanedValue)) {
    showMessage("Cleaned URL copied.", "success");
  } else {
    showMessage("Copy failed. Select the URL and copy it manually.", "error");
  }
});

const sharedUrl = new URL(window.location.href).searchParams.get("url");
if (sharedUrl) {
  input.value = sharedUrl;
  runClean({ allowAutoCopy: false });
  window.history.replaceState(null, "", window.location.pathname);
}
