export const TRACKING_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "fbclid", "fb_action_ids", "fb_action_types",
  "fb_source", "fb_ref", "gclid", "dclid", "gbraid", "wbraid",
  "gad_source", "gad_campaignid", "gclsrc", "gclaw", "gcldc", "_gac",
  "_gcl_au", "msclkid", "cvid", "twclid", "ttclid", "yclid", "ymclid",
  "ysclid", "srsltid", "epik", "scid", "s_kwcid", "li_fat_id", "mc_cid",
  "mc_eid", "_ga", "_gl", "_hsenc", "_hsmi", "hsctatracking", "mkt_tok",
  "cjevent", "irclickid", "mkcid", "mkevt", "aff_fcid", "aff_fsk",
  "aff_platform", "aff_trace_key", "oly_enc_id", "oly_anon_id",
  "ck_subscriber_id", "dm_i", "mibextid", "_openstat", "rb_clickid", "s_cid",
  "s_fid", "s_ppv", "s_channel", "s_ptc", "s_plt", "s_vnum", "s_invisit",
  "s_cc", "s_sq", "vero_conv", "vero_id", "igshid", "si"
]);

export const TRACKING_PARAMETER_PREFIXES = ["utm_", "hsa_", "mtm_", "pk_", "piwik_", "_ga_"];

export const AGGRESSIVE_PARAMETERS = new Set([
  "affiliate", "affiliate_id", "affid", "aff_id", "campaign", "campaignid",
  "clickid", "click_id", "partner", "partner_id", "ref", "referrer",
  "referral", "source", "src", "tracking", "tracking_id"
]);

export const OPAQUE_SHORTENER_HOSTS = new Set([
  "bit.ly", "buff.ly", "cutt.ly", "goo.gl", "is.gd", "ow.ly",
  "rebrand.ly", "shorturl.at", "t.co", "tiny.cc", "tinyurl.com"
]);

const FUNCTIONAL_PARAMETERS = new Set([
  "id", "lang", "language", "list", "page", "q", "query", "search", "t", "tab", "v"
]);

const AFFILIATE_PARAMETERS = new Set([
  "affiliate", "affiliate_id", "affid", "aff_id", "cjevent", "irclickid",
  "mkcid", "mkevt", "partner", "partner_id", "ref", "referral"
]);

const REDIRECT_RULES = [
  { hosts: ["google.com", "www.google.com"], path: "/url", parameters: ["q", "url"] },
  { hosts: ["facebook.com", "www.facebook.com", "l.facebook.com", "lm.facebook.com"], path: "/l.php", parameters: ["u"] },
  { hosts: ["youtube.com", "www.youtube.com"], path: "/redirect", parameters: ["q"] },
  { hosts: ["linkedin.com", "www.linkedin.com"], path: "/safety/go", parameters: ["url"] },
  { hosts: ["outlook.office.com", "nam01.safelinks.protection.outlook.com", "nam02.safelinks.protection.outlook.com"], parameters: ["url"] },
  { hosts: ["away.vk.com"], path: "/away.php", parameters: ["to"] }
];

function parseUrl(input) {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url;
  } catch {
    throw new TypeError("Enter a valid URL, including https:// or http://.");
  }
}

function isTracker(name) {
  const normalized = name.toLowerCase();
  return TRACKING_PARAMETERS.has(normalized)
    || TRACKING_PARAMETER_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function decodeForInspection(value, maximumPasses = 2) {
  const versions = [];
  let current = value;
  for (let pass = 0; pass < maximumPasses; pass += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      versions.push(decoded);
      current = decoded;
    } catch {
      break;
    }
  }
  return versions;
}

function redirectRuleFor(url) {
  return REDIRECT_RULES.find((rule) => rule.hosts.includes(url.hostname.toLowerCase())
    && (!rule.path || rule.path === url.pathname));
}

function validDestination(value) {
  for (const candidate of [value, ...decodeForInspection(value)]) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") return url;
    } catch {
      // An encoded or malformed value is safe to ignore.
    }
  }
  return null;
}

export function unwrapRedirectUrl(input, maximumDepth = 5) {
  let current = parseUrl(input);
  const layers = [];
  const visited = new Set([current.href]);

  for (let depth = 0; depth < maximumDepth; depth += 1) {
    const rule = redirectRuleFor(current);
    if (!rule) break;
    const parameter = rule.parameters.find((name) => current.searchParams.has(name));
    if (!parameter) break;
    const destination = validDestination(current.searchParams.get(parameter));
    if (!destination || visited.has(destination.href)) break;
    layers.push({ from: current.href, host: current.hostname, parameter, to: destination.href });
    current = destination;
    visited.add(current.href);
  }

  return { url: current, layers };
}

export function isOpaqueShortener(input) {
  try {
    const hostname = new URL(input.trim()).hostname.toLowerCase().replace(/^www\./, "");
    return OPAQUE_SHORTENER_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export function categorizeParameter(name) {
  const normalized = name.toLowerCase();
  if (isTracker(normalized)) return "tracking";
  if (AFFILIATE_PARAMETERS.has(normalized)) return "affiliate/referral";
  if (["url", "u", "to", "target", "destination", "redirect", "redirect_uri"].includes(normalized)) return "redirect-related";
  if (FUNCTIONAL_PARAMETERS.has(normalized)) return "functional";
  return "unknown";
}

export function detectWeirdness(input) {
  const url = parseUrl(input);
  const flags = [];
  const names = [...url.searchParams.keys()].map((name) => name.toLowerCase());
  if (url.search.length > 500) flags.push("The query string is unusually long.");
  if (new Set(names).size < names.length) flags.push("One or more parameter names are repeated.");
  if (url.username || url.password) flags.push("The URL includes a username or password in its authority.");
  if (url.hostname.split(".").some((part) => part.startsWith("xn--"))) flags.push("The hostname uses punycode for an internationalized domain.");
  if (url.port && !["80", "443"].includes(url.port)) flags.push(`The URL uses the unusual port ${url.port}.`);
  if (/%25(?:[0-9a-f]{2})/i.test(url.href)) flags.push("The URL appears to contain repeated percent encoding.");
  if (/%[0-9a-f]{2}/i.test(url.href) && /[\u0080-\uffff]/u.test(decodeForInspection(url.href, 1)[0] || "")) {
    flags.push("The URL mixes encoded and unencoded text.");
  }
  if ([...url.searchParams.values()].some((value) => value.includes("#") || /%23/i.test(value))) {
    flags.push("A query parameter contains a nested fragment marker.");
  }
  const redirect = unwrapRedirectUrl(url.href);
  if (redirect.layers.length > 1) flags.push(`The URL contains ${redirect.layers.length} redirect wrapper layers.`);
  return flags;
}

export function trackingFingerprint(input) {
  const original = parseUrl(input);
  const redirect = unwrapRedirectUrl(original.href);
  const wrappers = redirect.layers.length;
  let tracking = 0;
  let affiliate = 0;
  const inspectedUrls = new Map([[original.href, original], [redirect.url.href, redirect.url]]);
  for (const url of inspectedUrls.values()) {
    for (const [name] of url.searchParams) {
      const category = categorizeParameter(name);
      if (category === "tracking") tracking += 1;
      if (category === "affiliate/referral") affiliate += 1;
    }
  }
  const count = tracking + affiliate + wrappers;
  const label = count === 0 ? "Clean slate" : count <= 2 ? "Lightly tracked" : count <= 5 ? "Tracker confetti" : "Tracking parade";
  return { count, label, categories: { tracking, affiliate, wrappers } };
}

export function inspectUrl(input) {
  const url = parseUrl(input);
  const redirect = unwrapRedirectUrl(url.href);
  return {
    scheme: url.protocol.slice(0, -1),
    host: url.hostname,
    port: url.port || "default",
    path: url.pathname,
    fragment: url.hash ? url.hash.slice(1) : "none",
    parameters: [...url.searchParams].map(([name, value]) => ({
      name,
      value,
      category: categorizeParameter(name),
      decodedValues: decodeForInspection(value)
    })),
    redirectLayers: redirect.layers,
    weirdness: detectWeirdness(url.href)
  };
}

export function cleanUrl(input, options = {}) {
  const value = input.trim();
  if (!value) throw new TypeError("Enter a URL to clean.");
  const { aggressive = false, unwrapRedirects = true, removeDuplicateParameters = false } = options;
  const redirect = unwrapRedirects ? unwrapRedirectUrl(value) : { url: parseUrl(value), layers: [] };
  const url = redirect.url;
  const keptParameters = new URLSearchParams();
  const removedParameters = [];
  const aggressiveRemovedParameters = [];
  const duplicateParameters = [];
  const seenPairs = new Set();

  for (const [name, parameterValue] of url.searchParams) {
    const normalizedName = name.toLowerCase();
    const pair = JSON.stringify([normalizedName, parameterValue]);
    if (isTracker(normalizedName)) {
      removedParameters.push(name);
    } else if (aggressive && AGGRESSIVE_PARAMETERS.has(normalizedName)) {
      removedParameters.push(name);
      aggressiveRemovedParameters.push(name);
    } else if (removeDuplicateParameters && seenPairs.has(pair)) {
      duplicateParameters.push(name);
    } else {
      keptParameters.append(name, parameterValue);
      seenPairs.add(pair);
    }
  }
  url.search = keptParameters.toString();
  const changed = removedParameters.length > 0 || duplicateParameters.length > 0 || redirect.layers.length > 0;
  return {
    url: url.toString(),
    removedParameters,
    aggressiveRemovedParameters,
    duplicateParameters,
    redirectLayers: redirect.layers,
    changed,
    fingerprint: trackingFingerprint(value),
    inspection: inspectUrl(value)
  };
}
