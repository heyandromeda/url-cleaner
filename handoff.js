const TRAILING_PUNCTUATION = ".,;:!?";

// Drops sentence punctuation after a link found in prose, plus a closing
// parenthesis only when it has no partner inside the link, so
// "(see https://en.wikipedia.org/wiki/Urchin_(software))" keeps "(software)".
function trimLinkEnd(candidate) {
  let unmatchedClosers = 0;
  for (const char of candidate) {
    if (char === ")") unmatchedClosers += 1;
    if (char === "(") unmatchedClosers -= 1;
  }

  let end = candidate.length;
  while (end > 0) {
    const char = candidate[end - 1];
    if (TRAILING_PUNCTUATION.includes(char)) {
      end -= 1;
    } else if (char === ")" && unmatchedClosers > 0) {
      end -= 1;
      unmatchedClosers -= 1;
    } else {
      break;
    }
  }
  return candidate.slice(0, end);
}

export function extractHttpUrl(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";

  try {
    const direct = new URL(text);
    if (direct.protocol === "http:" || direct.protocol === "https:") {
      return direct.href;
    }
  } catch {
    // Fall through and search inside surrounding text.
  }

  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return "";
  const candidate = trimLinkEnd(match[0]);
  try {
    const url = new URL(candidate);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return "";
  }
  return "";
}

export function parseHandoffParams(searchParams) {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(searchParams);

  const urlField = params.get("url");
  const fromUrl = extractHttpUrl(urlField);
  if (fromUrl) return fromUrl;

  const fromText = extractHttpUrl(params.get("text"));
  if (fromText) return fromText;

  const fromTitle = extractHttpUrl(params.get("title"));
  if (fromTitle) return fromTitle;

  return "";
}

// Links handed over after the "#" (#url=) are never sent to the server, so
// they win. The Android share target POSTs into the service worker, which
// redirects to /#url= without a network request. The ?url= form stays for
// legacy handoff links only.
export function parseHandoffUrl(href) {
  const url = new URL(href);
  return parseHandoffParams(url.hash.slice(1)) || parseHandoffParams(url.searchParams);
}

export function canReadClipboard(permissionState) {
  return permissionState === "granted";
}

export function shouldAutoCleanOnPaste(cleanOnPasteEnabled) {
  return Boolean(cleanOnPasteEnabled);
}
