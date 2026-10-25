import {
  cleanBatch,
  cleanedUrlsFromBatch,
  fingerprintRemovedKeptDetail,
  isOpaqueShortener,
  isOriginalQuerySegmentRemoved,
  querySegments,
  removedDuplicateIndicesForBeforeView
} from "./cleaner.js";
import { explainParameter, trackerOfTheDay } from "./explanations.js";
import { canReadClipboard, hasHandoffFields, parseHandoffUrl } from "./handoff.js";
import { createIcon, wrapIconButton } from "./icons.js";
import { breakableUrlMarkup } from "./url-break.js";
import {
  openThemeStorage,
  readStoredThemePreference,
  resolveActiveTheme,
  themeColorFor,
  toggleAppliedTheme
} from "./theme.js";
import {
  STORAGE_KEYS,
  openAppStorage,
  readBooleanSetting,
  writeBooleanSetting
} from "./storage.js";
import {
  applyHorribleAttribute,
  bindHorriblePage,
  popHorribleStamp,
  spawnHorribleConfetti
} from "./horrible.js";

const form = document.querySelector("#clean-form");
const input = document.querySelector("#url-input");
const pasteButton = document.querySelector("#paste-button");
const inspectButton = document.querySelector("#inspect-button");
const cleanOnPaste = document.querySelector("#clean-on-paste");
const autoCopy = document.querySelector("#auto-copy");
const aggressiveMode = document.querySelector("#aggressive-mode");
const removeDuplicates = document.querySelector("#remove-duplicates");
const resultPanel = document.querySelector("#result-panel");
const batchPanel = document.querySelector("#batch-panel");
const batchList = document.querySelector("#batch-list");
const copyAllButton = document.querySelector("#copy-all-button");
const originalOutput = document.querySelector("#original-url");
const output = document.querySelector("#cleaned-url");
const unwrapWarning = document.querySelector("#unwrap-warning");
const unwrapWarningText = unwrapWarning.querySelector("p");
const shortenerWarning = document.querySelector("#shortener-warning");
const duplicateNotice = document.querySelector("#duplicate-notice");
const duplicateNoticeText = duplicateNotice.querySelector("p");
const shareButton = document.querySelector("#share-button");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const removedList = document.querySelector("#removed-list");
const removedHint = document.querySelector("#removed-hint");
const fingerprintDetail = document.querySelector("#fingerprint-detail");
const fingerprintCount = document.querySelector("#fingerprint-count");
const fingerprintCountValue = document.querySelector("#fingerprint-count-value");
const redirectLayersPanel = document.querySelector("#redirect-layers-panel");
const redirectLayersList = document.querySelector("#redirect-layers-list");
const xrayPanel = document.querySelector("#xray-panel");
const urlParts = document.querySelector("#url-parts");
const parameterBreakdown = document.querySelector("#parameter-breakdown");
const weirdnessPanel = document.querySelector("#weirdness-panel");
const weirdnessList = document.querySelector("#weirdness-list");
const clipboardOffer = document.querySelector("#clipboard-offer");
const clipboardOfferText = document.querySelector("#clipboard-offer-text");
const clipboardOfferClean = document.querySelector("#clipboard-offer-clean");
const clipboardOfferDismiss = document.querySelector("#clipboard-offer-dismiss");
const totd = document.querySelector("#tracker-of-the-day");
const totdName = document.querySelector("#totd-name");
const totdDetails = document.querySelector("#totd-details");
const totdToggle = document.querySelector("#totd-toggle");
const themeToggle = document.querySelector("#theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const horribleMode = document.querySelector("#horrible-mode");

let cleanedValue = "";
let batchCopyValue = "";
let clipboardOfferValue = "";
let totdCollapsed = false;

function appStorage() {
  return openAppStorage(globalThis);
}

function readSetting(key, fallback) {
  return readBooleanSetting(appStorage(), key, fallback);
}

function saveSetting(key, value) {
  writeBooleanSetting(appStorage(), key, value);
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function activeTheme() {
  return resolveActiveTheme(globalThis, systemPrefersDark());
}

function appliedTheme() {
  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return activeTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColorFor(theme));
  }
  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.setAttribute("aria-label", isDark ? "Light mode" : "Dark mode");
    themeToggle.replaceChildren(createIcon(isDark ? "sun" : "moon", { size: 18 }));
  }
}

function bindDisclosureChevron(details) {
  if (!details) return;
  const summary = details.querySelector(":scope > summary");
  if (!summary?.querySelector(".disclosure-chevron")) return;
  const syncExpanded = () => {
    summary.setAttribute("aria-expanded", details.open ? "true" : "false");
  };
  syncExpanded();
  if (details.dataset.chevronBound === "true") return;
  details.dataset.chevronBound = "true";
  details.addEventListener("toggle", syncExpanded);
}

function decorateDisclosureSummary(summary) {
  if (summary.querySelector(".disclosure-chevron")) return;
  const label = summary.textContent.trim();
  summary.textContent = "";
  const wrap = document.createElement("span");
  wrap.className = "disclosure-summary";
  const chevronWrap = document.createElement("span");
  chevronWrap.className = "disclosure-chevron-wrap";
  chevronWrap.append(createIcon("chevronRight", { size: 16, className: "icon disclosure-chevron" }));
  wrap.append(chevronWrap, document.createTextNode(label));
  summary.append(wrap);
  bindDisclosureChevron(summary.closest("details"));
}

function decorateActionButtons() {
  wrapIconButton(pasteButton, "clipboard", "Paste");
  wrapIconButton(document.querySelector('button.primary-button[type="submit"]'), "sparkles", "Clean URL");
  wrapIconButton(inspectButton, "search", "Inspect URL");
  wrapIconButton(copyButton, "copy", "Copy");
  wrapIconButton(shareButton, "share", "Share");
  wrapIconButton(copyAllButton, "copy", "Copy cleaned URLs");
  decorateDisclosureSummary(xrayPanel.querySelector("summary"));
  decorateTotdToggleLabel();
}

function decorateTotdToggleLabel() {
  const label = totdToggle.textContent.trim();
  totdToggle.replaceChildren();
  const wrap = document.createElement("span");
  wrap.className = "icon-button";
  wrap.append(createIcon("chevronRight", { size: 16, className: "icon disclosure-chevron" }), document.createTextNode(label));
  totdToggle.append(wrap);
}

function setTotdToggleLabel(expanded) {
  const label = expanded ? "Collapse" : "Expand";
  totdToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  totdToggle.replaceChildren();
  const wrap = document.createElement("span");
  wrap.className = "icon-button";
  wrap.append(createIcon("chevronRight", { size: 16, className: "icon disclosure-chevron" }), document.createTextNode(label));
  totdToggle.append(wrap);
}

function applyHorribleMode(enabled) {
  applyHorribleAttribute(document.documentElement, enabled);
  if (horribleMode) horribleMode.checked = enabled;
  horribleEffects.setEnabled(enabled);
}

function celebrateHorribleClean() {
  spawnHorribleConfetti(document);
  popHorribleStamp(document.querySelector(".horrible-pow"));
}

let horribleEffects = {
  setEnabled() {}
};

function decorateHorribleToggle() {
  if (!horribleMode) return;
  const label = horribleMode.closest("label");
  if (!label || label.querySelector(".icon")) return;
  horribleMode.after(createIcon("flame", { size: 16 }));
}

function initTheme() {
  applyTheme(activeTheme());
  applyHorribleMode(readSetting(STORAGE_KEYS.horrible, false));
  decorateHorribleToggle();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const storage = openThemeStorage(globalThis);
    if (!storage || readStoredThemePreference(storage) === null) {
      applyTheme(activeTheme());
    }
  });
}

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function renderUnwrapNotice(unwrappedFrom = [], limitReached = false) {
  const hosts = unwrappedFrom.filter(Boolean);
  unwrapWarning.hidden = hosts.length === 0;
  if (hosts.length === 0) return;

  const wrappers = hosts.length === 1
    ? `This link used a redirect wrapper on ${hosts[0]}.`
    : `This link used redirect wrappers on ${hosts.join(", ")}.`;
  unwrapWarningText.textContent = limitReached
    ? `${wrappers} URL Cleaner stopped after ${hosts.length} layers, so the result is still a redirect link and may still carry tracking. Nothing was opened.`
    : `${wrappers} The destination was cleaned locally without opening it.`;
}

function appendRemovedItem(list, parameter, aggressive = false) {
  const item = document.createElement("li");
  const label = aggressive ? `${parameter} (aggressive)` : parameter;
  if (aggressive) item.className = "aggressive-removal";
  const explanation = explainParameter(parameter);
  if (!explanation) {
    item.textContent = label;
    list.append(item);
    return;
  }

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const summaryWrap = document.createElement("span");
  summaryWrap.className = "disclosure-summary";
  const chevronWrap = document.createElement("span");
  chevronWrap.className = "disclosure-chevron-wrap";
  chevronWrap.append(createIcon("chevronRight", { size: 16, className: "icon disclosure-chevron" }));
  summaryWrap.append(chevronWrap, document.createTextNode(label));
  summary.append(summaryWrap);
  const body = document.createElement("p");
  body.className = "param-explanation";
  body.textContent = explanation;
  details.append(summary, body);
  bindDisclosureChevron(details);
  item.append(details);
  list.append(item);
}

function renderRemoved(parameters, list = removedList, aggressiveParameters = []) {
  list.replaceChildren();
  const aggressiveNames = new Set(aggressiveParameters);

  if (list === removedList) {
    removedHint.hidden = parameters.length === 0;
  }

  if (parameters.length === 0) {
    const item = document.createElement("li");
    item.textContent = "None";
    item.className = "muted";
    list.append(item);
    return;
  }

  for (const parameter of parameters) {
    appendRemovedItem(list, parameter, aggressiveNames.has(parameter));
  }
}

function addUrlPart(name, value) {
  const term = document.createElement("dt");
  term.textContent = name;
  const description = document.createElement("dd");
  description.textContent = value;
  urlParts.append(term, description);
}

function renderFingerprint(fingerprint, { removedParameters = [], aggressive = false, originalInput = "" } = {}) {
  const removedCount = removedParameters.length;
  fingerprintCountValue.textContent = String(removedCount);

  const categoryParts = [
    `${fingerprint.categories.tracking} tracking`,
    `${fingerprint.categories.affiliate} affiliate/referral`,
    `${fingerprint.categories.wrappers} redirect wrapper`
  ];
  let detail = `${fingerprint.label} — ${categoryParts.join(", ")}.`;

  const removedKept = originalInput
    ? fingerprintRemovedKeptDetail(originalInput, removedParameters, { aggressive })
    : null;
  if (removedKept?.keptText) {
    detail = `${fingerprint.label} — ${removedKept.keptText}`;
  }

  fingerprintDetail.textContent = detail;
}

function renderRedirectLayers(layers) {
  redirectLayersList.replaceChildren();
  redirectLayersPanel.hidden = layers.length === 0;
  for (const layer of layers) {
    const item = document.createElement("li");
    const host = document.createElement("strong");
    host.textContent = layer.host;
    const destination = document.createElement("code");
    destination.textContent = layer.to;
    item.append(host, document.createTextNode(` via ${layer.parameter} → `), destination);
    redirectLayersList.append(item);
  }
}

function renderInspection(inspection) {
  urlParts.replaceChildren();
  addUrlPart("Scheme", inspection.scheme);
  addUrlPart("Host", inspection.host);
  addUrlPart("Port", inspection.port);
  addUrlPart("Path", inspection.path);
  addUrlPart("Fragment", inspection.fragment);

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

function renderOriginalUrl(value, removedParameters, removedDuplicateIndices = []) {
  const url = new URL(value.trim());
  const base = url.href.slice(0, url.href.length - url.search.length - url.hash.length);

  originalOutput.replaceChildren(document.createTextNode(base));

  querySegments(url.search).forEach(({ raw, name }, index) => {
    originalOutput.append(document.createTextNode(index === 0 ? "?" : "&"));
    const removed = isOriginalQuerySegmentRemoved(name, index, removedParameters, removedDuplicateIndices);
    const segment = document.createElement(removed ? "mark" : "span");
    segment.textContent = raw;
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

function renderDuplicateNotice(duplicates) {
  duplicateNotice.hidden = duplicates.length === 0;
  duplicateNoticeText.textContent = `${duplicates.length} identical duplicate parameter${duplicates.length === 1 ? " was" : "s were"} removed. Repeated names with different values were kept.`;
}

function hideResults() {
  resultPanel.hidden = true;
  batchPanel.hidden = true;
  copyButton.disabled = true;
  copyAllButton.disabled = true;
  cleanedValue = "";
  batchCopyValue = "";
}

function showCleanResult(result, { allowAutoCopy = true, originalValue = "", revealInspection = false } = {}) {
  cleanedValue = result.url;
  renderOriginalUrl(
    originalValue,
    result.removedParameters,
    removedDuplicateIndicesForBeforeView(result)
  );
  output.textContent = result.url;
  renderRemoved(result.removedParameters, removedList, result.aggressiveRemovedParameters);
  renderDuplicateNotice(result.duplicateParameters);
  renderUnwrapNotice(result.unwrappedFrom, result.unwrapLimitReached);
  shortenerWarning.hidden = !isOpaqueShortener(originalValue) && !isOpaqueShortener(result.url);
  renderFingerprint(result.fingerprint, {
    removedParameters: result.removedParameters,
    aggressive: aggressiveMode.checked,
    originalInput: originalValue
  });
  renderRedirectLayers(result.inspection.redirectLayers);
  renderInspection(result.inspection);
  xrayPanel.open = Boolean(revealInspection);
  bindDisclosureChevron(xrayPanel);
  resultPanel.hidden = false;
  batchPanel.hidden = true;
  copyButton.disabled = false;

  const unwrapped = result.unwrappedFrom.length > 0;
  const baseMessage = result.unwrapLimitReached
    ? "Redirect partly unwrapped. The result is still a redirect link."
    : unwrapped
      ? result.removedParameters.length > 0
        ? "Redirect unwrapped. Tracking parameters removed."
        : "Redirect unwrapped. Destination had no tracking parameters."
      : result.removedParameters.length > 0
        ? "Tracking parameters removed."
        : result.changed
          ? "Identical duplicate parameters removed."
        : "Already clean — no tracking parameters found.";

  showMessage(baseMessage, result.unwrapLimitReached ? "info" : "success");
  celebrateHorribleClean();
  horribleEffects.afterClean?.({ url: result.url, source: "single" });

  if (allowAutoCopy && autoCopy.checked) {
    copyText(cleanedValue).then((copied) => {
      showMessage(
        copied ? `${baseMessage} Copied to clipboard.` : `${baseMessage} Clipboard copy was unavailable.`,
        copied ? "success" : "info"
      );
    });
  }
}

function showBatchResults(entries, { allowAutoCopy = true } = {}) {
  resultPanel.hidden = true;
  batchPanel.hidden = false;
  batchList.replaceChildren();
  copyButton.disabled = true;
  cleanedValue = "";
  const cleaned = cleanedUrlsFromBatch(entries);
  batchCopyValue = cleaned.join("\n");
  copyAllButton.disabled = cleaned.length === 0;

  for (const entry of entries) {
    const item = document.createElement("li");
    item.className = entry.ok ? "ok" : "fail";

    const status = document.createElement("p");
    status.className = "batch-status";
    status.textContent = entry.ok ? `Line ${entry.line}: cleaned` : `Line ${entry.line}: failed`;

    const original = document.createElement("div");
    original.className = "batch-url";
    original.textContent = entry.input;

    item.append(status, original);

    if (entry.ok) {
      const cleanedLine = document.createElement("div");
      cleanedLine.className = "batch-url";
      cleanedLine.textContent = entry.result.url;
      item.append(cleanedLine);

      if (entry.result.removedParameters.length > 0) {
        const removed = document.createElement("ul");
        removed.className = "removed-list";
        renderRemoved(entry.result.removedParameters, removed, entry.result.aggressiveRemovedParameters);
        item.append(removed);
      }
    } else {
      const error = document.createElement("p");
      error.className = "batch-error";
      error.textContent = entry.error;
      item.append(error);
    }

    batchList.append(item);
  }

  const failed = entries.length - cleaned.length;
  const baseMessage = failed === 0
    ? `${cleaned.length} URL${cleaned.length === 1 ? "" : "s"} cleaned.`
    : `${cleaned.length} cleaned, ${failed} failed.`;
  showMessage(baseMessage, cleaned.length > 0 ? "success" : "error");
  if (cleaned.length > 0) celebrateHorribleClean();
  if (cleaned.length > 0) horribleEffects.afterClean?.({ url: batchCopyValue, source: "batch" });

  if (allowAutoCopy && autoCopy.checked && batchCopyValue) {
    copyText(batchCopyValue).then((copied) => {
      showMessage(
        copied ? `${baseMessage} Copied cleaned URLs.` : `${baseMessage} Clipboard copy was unavailable.`,
        copied ? "success" : "info"
      );
    });
  }
}

function runClean(options = {}) {
  hideResults();

  const entries = cleanBatch(input.value, {
    aggressive: aggressiveMode.checked,
    removeDuplicateParameters: removeDuplicates.checked
  });
  if (entries.length === 0) {
    showMessage("Paste or type a URL to clean.", "error");
    return;
  }

  if (entries.length === 1) {
    const [entry] = entries;
    if (!entry.ok) {
      showMessage(entry.error, "error");
      return;
    }
    showCleanResult(entry.result, { ...options, originalValue: entry.input });
    return;
  }

  showBatchResults(entries, options);
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
    showMessage("Clipboard access is blocked. Press Ctrl/⌘+V in the box instead.", "info");
    input.focus();
  }
}

function appendTotdSection(container, iconName, title, paragraphs) {
  const section = document.createElement("section");
  section.className = "totd-section";

  const heading = document.createElement("h3");
  heading.className = "totd-section-title";
  heading.append(createIcon(iconName, { size: 16 }), document.createTextNode(title));
  section.append(heading);

  for (const text of paragraphs) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    section.append(paragraph);
  }

  container.append(section);
}

function renderTrackerDetails(fact) {
  totdDetails.replaceChildren();

  const summary = document.createElement("p");
  summary.className = "totd-summary";
  summary.textContent = fact.explanation;
  totdDetails.append(summary);

  appendTotdSection(totdDetails, "search", "What it does", [fact.what, `Who uses it? ${fact.who}`, `How it works: ${fact.how}`, `Why it exists: ${fact.why}`]);
  appendTotdSection(totdDetails, "shield", "Privacy impact", [fact.privacy, `Can it be safely removed? ${fact.safeToRemove}`]);

  const factsSection = document.createElement("section");
  factsSection.className = "totd-section";
  const factsHeading = document.createElement("h3");
  factsHeading.className = "totd-section-title";
  factsHeading.append(createIcon("brain", { size: 16 }), document.createTextNode("Did you know?"));
  factsSection.append(factsHeading);
  const list = document.createElement("ul");
  list.className = "totd-facts";
  for (const item of fact.funFacts) {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  }
  factsSection.append(list);
  totdDetails.append(factsSection);

  const exampleSection = document.createElement("section");
  exampleSection.className = "totd-section";
  const exampleHeading = document.createElement("h3");
  exampleHeading.className = "totd-section-title";
  exampleHeading.append(createIcon("link", { size: 16 }), document.createTextNode("Example URL"));
  exampleSection.append(exampleHeading);
  const exampleUrl = document.createElement("code");
  exampleUrl.className = "totd-example-url";
  exampleUrl.innerHTML = breakableUrlMarkup(fact.exampleUrl);
  exampleSection.append(exampleUrl);
  const exampleNote = document.createElement("p");
  exampleNote.textContent = fact.exampleNote;
  exampleSection.append(exampleNote);
  totdDetails.append(exampleSection);

  if (Array.isArray(fact.sources) && fact.sources.length > 0) {
    const sourcesSection = document.createElement("section");
    sourcesSection.className = "totd-section";
    const sourcesHeading = document.createElement("h3");
    sourcesHeading.className = "totd-section-title";
    sourcesHeading.append(createIcon("bookOpen", { size: 16 }), document.createTextNode("Sources"));
    sourcesSection.append(sourcesHeading);
    const sourcesList = document.createElement("ul");
    sourcesList.className = "totd-sources";
    for (const source of fact.sources) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      link.textContent = source.title;
      item.append(link);
      sourcesList.append(item);
    }
    sourcesSection.append(sourcesList);
    totdDetails.append(sourcesSection);
  }
}

function applyTotdCollapsedState() {
  totd.classList.toggle("is-collapsed", totdCollapsed);
  totdDetails.hidden = totdCollapsed;
  setTotdToggleLabel(!totdCollapsed);
}

function renderTrackerOfTheDay() {
  const fact = trackerOfTheDay();
  totdName.textContent = fact.name;
  renderTrackerDetails(fact);
  totdCollapsed = readSetting(STORAGE_KEYS.totdCollapsed, true);
  applyTotdCollapsedState();
  totd.hidden = false;
}

async function offerClipboardIfPermitted() {
  if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
    return;
  }

  let permissionState = "unavailable";
  if (navigator.permissions && typeof navigator.permissions.query === "function") {
    try {
      const status = await navigator.permissions.query({ name: "clipboard-read" });
      permissionState = status.state;
    } catch {
      return;
    }
  } else {
    return;
  }

  if (!canReadClipboard(permissionState)) {
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    const trimmed = text.trim();
    if (!trimmed) return;
    clipboardOfferValue = text;
    const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    clipboardOfferText.textContent = lines.length > 1
      ? `Your clipboard has ${lines.length} lines. Clean them locally?`
      : "Your clipboard looks like it contains a URL. Clean it locally?";
    clipboardOffer.hidden = false;
  } catch {
    // Permission may have been revoked between the query and the read.
  }
}

function clearHandoffFromAddressBar() {
  const url = new URL(window.location.href);
  if (!url.search && !url.hash) return;
  window.history.replaceState(null, "", url.pathname);
}

function loadHandoff() {
  const href = window.location.href;
  const handedOff = parseHandoffUrl(href);
  if (handedOff) {
    input.value = handedOff;
    runClean({ allowAutoCopy: false });
  }
  if (handedOff || hasHandoffFields(href)) {
    clearHandoffFromAddressBar();
  }
  return Boolean(handedOff);
}

initTheme();
decorateActionButtons();

cleanOnPaste.checked = readSetting(STORAGE_KEYS.cleanOnPaste, true);
autoCopy.checked = readSetting(STORAGE_KEYS.autoCopy, false);
aggressiveMode.checked = readSetting(STORAGE_KEYS.aggressiveMode, false);
removeDuplicates.checked = readSetting(STORAGE_KEYS.removeDuplicates, false);
shareButton.hidden = typeof navigator.share !== "function";
renderTrackerOfTheDay();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value.trim()) {
    showMessage("Paste or type a URL to clean.", "error");
    return;
  }
  if (horribleEffects.beforeClean?.({ source: "form", proceed: () => runClean() })) {
    return;
  }
  runClean();
});

input.addEventListener("input", () => {
  if (!input.value.trim()) {
    message.textContent = "";
    delete message.dataset.kind;
    hideResults();
  }
});

pasteButton.addEventListener("click", pasteFromClipboard);

inspectButton.addEventListener("click", () => {
  runClean({ allowAutoCopy: false, revealInspection: true });
});

input.addEventListener("paste", () => {
  if (cleanOnPaste.checked) {
    window.setTimeout(() => runClean(), 0);
  }
});

cleanOnPaste.addEventListener("change", () => {
  saveSetting(STORAGE_KEYS.cleanOnPaste, cleanOnPaste.checked);
});

autoCopy.addEventListener("change", () => {
  saveSetting(STORAGE_KEYS.autoCopy, autoCopy.checked);
});

for (const [toggle, key] of [[aggressiveMode, STORAGE_KEYS.aggressiveMode], [removeDuplicates, STORAGE_KEYS.removeDuplicates]]) {
  toggle.addEventListener("change", () => {
    saveSetting(key, toggle.checked);
    if (input.value.trim()) runClean({ allowAutoCopy: false });
  });
}

copyButton.addEventListener("click", async () => {
  if (!cleanedValue) return;

  if (await copyText(cleanedValue)) {
    showMessage("Cleaned URL copied.", "success");
    wrapIconButton(copyButton, "check", "Copy");
    window.setTimeout(() => wrapIconButton(copyButton, "copy", "Copy"), 1500);
  } else {
    showMessage("Copy failed. Select the URL and copy it manually.", "error");
  }
});

copyAllButton.addEventListener("click", async () => {
  if (!batchCopyValue) return;

  if (await copyText(batchCopyValue)) {
    showMessage("Cleaned URLs copied.", "success");
  } else {
    showMessage("Copy failed. Select the URLs and copy them manually.", "error");
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

themeToggle.addEventListener("click", () => {
  const storage = openThemeStorage(globalThis);
  const next = toggleAppliedTheme(appliedTheme(), storage);
  applyTheme(next);
});

if (horribleMode) {
  horribleMode.addEventListener("change", () => {
    saveSetting(STORAGE_KEYS.horrible, horribleMode.checked);
    applyHorribleMode(horribleMode.checked);
  });
}

horribleEffects = bindHorriblePage({
  stopButton: document.querySelector("#horrible-stop"),
  cleanButton: document.querySelector("#clean-form button.primary-button[type='submit']"),
  popupHost: document.querySelector("#horrible-popups"),
  hitCounter: document.querySelector(".horrible-hit-counter"),
  guestbook: document.querySelector("#horrible-guestbook"),
  onClean: () => runClean(),
  onStop: () => {
    saveSetting(STORAGE_KEYS.horrible, false);
    applyHorribleMode(false);
  }
});
horribleEffects.setEnabled(document.documentElement.dataset.horrible === "on");

totdToggle.addEventListener("click", () => {
  totdCollapsed = !totdCollapsed;
  saveSetting(STORAGE_KEYS.totdCollapsed, totdCollapsed);
  applyTotdCollapsedState();
});

clipboardOfferClean.addEventListener("click", () => {
  input.value = clipboardOfferValue;
  clipboardOffer.hidden = true;
  runClean();
});

clipboardOfferDismiss.addEventListener("click", () => {
  clipboardOffer.hidden = true;
  clipboardOfferValue = "";
});

if (!loadHandoff()) {
  offerClipboardIfPermitted();
}

// A #url= handoff to an already-open tab changes only the fragment, so no reload happens.
window.addEventListener("hashchange", loadHandoff);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Installability is optional; cleaning still works without a worker.
  });
}
