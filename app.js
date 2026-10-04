import { cleanUrl } from "./cleaner.js";

const form = document.querySelector("#clean-form");
const input = document.querySelector("#url-input");
const resultPanel = document.querySelector("#result-panel");
const output = document.querySelector("#cleaned-url");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");
const removedList = document.querySelector("#removed-list");
let cleanedValue = "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resultPanel.hidden = true;
  copyButton.disabled = true;
  try {
    const result = cleanUrl(input.value);
    cleanedValue = result.url;
    output.textContent = result.url;
    removedList.replaceChildren(...(result.removedParameters.length
      ? result.removedParameters.map((name) => Object.assign(document.createElement("li"), { textContent: name }))
      : [Object.assign(document.createElement("li"), { textContent: "None" })]));
    resultPanel.hidden = false;
    copyButton.disabled = false;
    message.textContent = result.changed ? "Tracking parameters removed." : "Already clean — no tracking parameters found.";
  } catch (error) {
    message.textContent = error.message;
  }
});

copyButton.addEventListener("click", async () => {
  if (!cleanedValue) return;
  try {
    await navigator.clipboard.writeText(cleanedValue);
    message.textContent = "Cleaned URL copied.";
  } catch {
    message.textContent = "Copy failed. Select the URL and copy it manually.";
  }
});
