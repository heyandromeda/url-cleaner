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
  "s_cc", "s_sq", "vero_conv", "vero_id", "igshid", "igsh",
  "pk_campaign", "pk_kwd", "pk_source", "pk_medium", "pk_content", "pk_cid"
]);

export const TRACKING_PARAMETER_PREFIXES = ["utm_", "hsa_", "mtm_", "piwik_", "_ga_"];

export const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be"
]);

export const HOST_TRACKING_PARAMETERS = new Map(
  [...YOUTUBE_HOSTS].map((host) => [host, new Set(["si"])])
);

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

const REDIRECT_RELATED_PARAMETERS = new Set([
  "url", "u", "to", "target", "destination", "redirect", "redirect_uri"
]);

const MAX_UNWRAP_DEPTH = 3;

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isHttpUrl(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isTrackingParameter(name, hostname) {
  const normalizedName = name.toLowerCase();
  if (TRACKING_PARAMETER_PREFIXES.some((prefix) => normalizedName.startsWith(prefix))) {
    return true;
  }
  if (TRACKING_PARAMETERS.has(normalizedName)) {
    return true;
  }
  const hostTrackers = HOST_TRACKING_PARAMETERS.get(normalizeHostname(hostname));
  return Boolean(hostTrackers?.has(normalizedName));
}

function getHrefLiDestination(url) {
  const raw = url.search.startsWith("?") ? url.search.slice(1) : "";
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function getWrapperInfo(url) {
  const host = normalizeHostname(url.hostname);
  const path = url.pathname;

  if ((host === "google.com" || host === "googleadservices.com") && path === "/url") {
    return { parameter: "q", destination: url.searchParams.get("q") };
  }

  if ((host === "facebook.com" || host === "l.facebook.com" || host === "lm.facebook.com") && path === "/l.php") {
    return { parameter: "u", destination: url.searchParams.get("u") };
  }

  if (host === "safelinks.protection.outlook.com" || host.endsWith(".safelinks.protection.outlook.com")) {
    return { parameter: "url", destination: url.searchParams.get("url") };
  }

  if ((host === "youtube.com" || host === "m.youtube.com") && path === "/redirect") {
    return { parameter: "q", destination: url.searchParams.get("q") };
  }

  if (host === "linkedin.com" && path === "/safety/go") {
    return { parameter: "url", destination: url.searchParams.get("url") };
  }

  if (host === "href.li") {
    return { parameter: "query", destination: getHrefLiDestination(url) };
  }

  return null;
}

function getWrapperDestination(url) {
  return getWrapperInfo(url)?.destination ?? null;
}

function parseHttpUrl(input) {
  const value = String(input ?? "").trim();
  if (!value) throw new TypeError("Enter a URL to clean.");

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("Enter a valid URL, including https:// or http://.");
  }

  if (!isHttpUrl(url)) {
    throw new TypeError("Enter a valid URL, including https:// or http://.");
  }

  return url;
}

function decodeQueryComponent(value) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

// Splits a serialized query into raw "name=value" segments so kept parameters
// can be written back byte-for-byte instead of being re-encoded.
export function querySegments(search) {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query.split("&").filter(Boolean).map((raw) => {
    const separator = raw.indexOf("=");
    const rawName = separator === -1 ? raw : raw.slice(0, separator);
    return { raw, name: decodeQueryComponent(rawName) };
  });
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

function validHttpDestination(value) {
  for (const candidate of [value, ...decodeForInspection(value)]) {
    try {
      const url = new URL(candidate);
      if (isHttpUrl(url)) return url;
    } catch {
      // Encoded or malformed destinations are ignored.
    }
  }
  return null;
}

function unwrapRedirectLayers(input, maximumDepth = MAX_UNWRAP_DEPTH) {
  let current = parseHttpUrl(input);
  const layers = [];
  const visited = new Set([current.href]);

  for (let depth = 0; depth < maximumDepth; depth += 1) {
    const info = getWrapperInfo(current);
    if (!info?.destination) break;
    const destination = validHttpDestination(info.destination);
    if (!destination || visited.has(destination.href)) break;
    layers.push({
      from: current.href,
      host: current.hostname,
      parameter: info.parameter,
      to: destination.href
    });
    current = destination;
    visited.add(current.href);
  }

  return { url: current, layers };
}

export function categorizeParameter(name, hostname = "") {
  const normalized = String(name).toLowerCase();
  if (isTrackingParameter(normalized, hostname)) return "tracking";
  if (AFFILIATE_PARAMETERS.has(normalized)) return "affiliate/referral";
  if (REDIRECT_RELATED_PARAMETERS.has(normalized)) return "redirect-related";
  if (FUNCTIONAL_PARAMETERS.has(normalized)) return "functional";
  return "unknown";
}

export function detectWeirdness(input) {
  const url = parseHttpUrl(input);
  const flags = [];
  const names = [...url.searchParams.keys()].map((name) => name.toLowerCase());

  if (url.search.length > 500) flags.push("The query string is unusually long.");
  if (new Set(names).size < names.length) flags.push("One or more parameter names are repeated.");
  if (url.username || url.password) flags.push("The URL includes a username or password in its authority.");
  if (url.hostname.split(".").some((part) => part.startsWith("xn--"))) {
    flags.push("The hostname uses punycode for an internationalized domain.");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    flags.push(`The URL uses the unusual port ${url.port}.`);
  }
  if (/%25(?:[0-9a-f]{2})/i.test(url.href)) {
    flags.push("The URL appears to contain repeated percent encoding.");
  }
  if (/%[0-9a-f]{2}/i.test(url.href) && /[\u0080-\uffff]/u.test(decodeForInspection(url.href, 1)[0] || "")) {
    flags.push("The URL mixes encoded and unencoded text.");
  }
  if ([...url.searchParams.values()].some((value) => value.includes("#") || /%23/i.test(value))) {
    flags.push("A query parameter contains a nested fragment marker.");
  }

  const redirect = unwrapRedirectLayers(url.href);
  if (redirect.layers.length > 1) {
    flags.push(`The URL contains ${redirect.layers.length} redirect wrapper layers.`);
  }

  return flags;
}

export function trackingFingerprint(input) {
  const original = parseHttpUrl(input);
  const redirect = unwrapRedirectLayers(original.href);
  const wrappers = redirect.layers.length;
  let tracking = 0;
  let affiliate = 0;
  const inspectedUrls = new Map([[original.href, original], [redirect.url.href, redirect.url]]);

  for (const url of inspectedUrls.values()) {
    for (const [name] of url.searchParams) {
      const category = categorizeParameter(name, url.hostname);
      if (category === "tracking") tracking += 1;
      if (category === "affiliate/referral") affiliate += 1;
    }
  }

  const count = tracking + affiliate + wrappers;
  const label = count === 0
    ? "Clean slate"
    : count <= 2
      ? "Lightly tracked"
      : count <= 5
        ? "Tracker confetti"
        : "Tracking parade";

  return { count, label, categories: { tracking, affiliate, wrappers } };
}

export function inspectUrl(input) {
  const url = parseHttpUrl(input);
  const redirect = unwrapRedirectLayers(url.href);

  return {
    scheme: url.protocol.slice(0, -1),
    host: url.hostname,
    port: url.port || "default",
    path: url.pathname,
    fragment: url.hash ? url.hash.slice(1) : "none",
    parameters: [...url.searchParams].map(([name, value]) => ({
      name,
      value,
      category: categorizeParameter(name, url.hostname)
    })),
    redirectLayers: redirect.layers,
    weirdness: detectWeirdness(url.href)
  };
}

export function isOpaqueShortener(input) {
  try {
    const hostname = normalizeHostname(new URL(input.trim()).hostname);
    return OPAQUE_SHORTENER_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

function cleanUrlAtDepth(input, depth) {
  const value = input.trim();
  if (!value) throw new TypeError("Enter a URL to clean.");

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("Enter a valid URL, including https:// or http://.");
  }

  if (!isHttpUrl(url)) {
    throw new TypeError("Enter a valid URL, including https:// or http://.");
  }

  if (depth < MAX_UNWRAP_DEPTH) {
    const destination = getWrapperDestination(url);
    if (destination) {
      try {
        const nested = cleanUrlAtDepth(destination, depth + 1);
        return {
          url: nested.url,
          removedParameters: nested.removedParameters,
          changed: true,
          unwrappedFrom: [url.hostname, ...nested.unwrappedFrom]
        };
      } catch {
        // Destination is missing, malformed, or not http(s); clean the wrapper itself.
      }
    }
  }

  const keptSegments = [];
  const removedParameters = [];
  for (const segment of querySegments(url.search)) {
    if (isTrackingParameter(segment.name, url.hostname)) {
      removedParameters.push(segment.name);
    } else {
      keptSegments.push(segment.raw);
    }
  }
  url.search = keptSegments.join("&");
  return {
    url: url.toString(),
    removedParameters,
    changed: removedParameters.length > 0,
    unwrappedFrom: []
  };
}

export function cleanUrl(input) {
  const result = cleanUrlAtDepth(input, 0);
  return {
    ...result,
    fingerprint: trackingFingerprint(input),
    inspection: inspectUrl(input)
  };
}

export function cleanBatch(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const results = [];

  for (let index = 0; index < lines.length; index += 1) {
    const input = lines[index].trim();
    if (!input) continue;

    try {
      results.push({
        line: index + 1,
        input,
        ok: true,
        result: cleanUrl(input)
      });
    } catch (error) {
      results.push({
        line: index + 1,
        input,
        ok: false,
        error: error.message
      });
    }
  }

  return results;
}

export function cleanedUrlsFromBatch(results) {
  return results.filter((entry) => entry.ok).map((entry) => entry.result.url);
}
