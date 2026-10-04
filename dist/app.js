import { cleanUrl } from "./cleaner.js";

const form = document.querySelector("#clean-form");
const input = document.querySelector("#url-input");
const resultPanel = document.querySelector("#result-panel");
const output = document.querySelector("#cleaned-url");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const removedList = document.querySelector("#removed-list");
let cleanedValue = "";

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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resultPanel.hidden = true;
  copyButton.disabled = true;
  cleanedValue = "";
  try {
    const result = cleanUrl(input.value);
    cleanedValue = result.url;
    output.textContent = result.url;
    renderRemoved(result.removedParameters);
    resultPanel.hidden = false;
    copyButton.disabled = false;
    showMessage(result.changed ? "Tracking parameters removed." : "Already clean — no tracking parameters found.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

copyButton.addEventListener("click", async () => {
  if (!cleanedValue) return;
  try {
    await navigator.clipboard.writeText(cleanedValue);
    showMessage("Cleaned URL copied.", "success");
  } catch {
    showMessage("Copy failed. Select the URL and copy it manually.", "error");
  }
});
