export const TRACKING_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "fbclid", "gclid", "dclid", "msclkid", "twclid",
  "ttclid", "li_fat_id", "mc_cid", "mc_eid", "_ga", "_gl", "vero_conv",
  "vero_id", "igshid", "si"
]);

export function cleanUrl(input) {
  const value = input.trim();
  if (!value) throw new TypeError("Enter a URL to clean.");
  let url;
  try { url = new URL(value); }
  catch { throw new TypeError("Enter a valid URL, including https:// or http://."); }

  const keptParameters = new URLSearchParams();
  const removedParameters = [];
  for (const [name, parameterValue] of url.searchParams) {
    const normalizedName = name.toLowerCase();
    if (normalizedName.startsWith("utm_") || TRACKING_PARAMETERS.has(normalizedName)) {
      removedParameters.push(name);
    } else {
      keptParameters.append(name, parameterValue);
    }
  }
  url.search = keptParameters.toString();
  return { url: url.toString(), removedParameters, changed: removedParameters.length > 0 };
}
