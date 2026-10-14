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

  const match = text.match(/https?:\/\/[^\s<>"'()]+/i);
  if (!match) return "";
  const candidate = match[0].replace(/[.,;:]+$/, "");
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

export function bookmarkletCode(origin) {
  const base = String(origin).replace(/\/+$/, "");
  const target = `${base}/?url=`;
  return `javascript:void(location.href=${JSON.stringify(target)}+encodeURIComponent(location.href))`;
}

export function canReadClipboard(permissionState) {
  return permissionState === "granted";
}

export function shouldAutoCleanOnPaste(cleanOnPasteEnabled) {
  return Boolean(cleanOnPasteEnabled);
}
