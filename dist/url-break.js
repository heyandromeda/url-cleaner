const DELIMITERS = new Set(["?", "&", "/", "="]);

/** Inserts <wbr> after URL delimiter characters for nicer wrapping. */
export function breakableUrlMarkup(url) {
  const parts = [];
  for (const character of String(url)) {
    parts.push(character);
    if (DELIMITERS.has(character)) {
      parts.push("<wbr>");
    }
  }
  return parts.join("");
}
