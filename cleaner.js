export const TRACKING_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "fbclid", "fb_action_ids", "fb_action_types",
  "fb_source", "fb_ref", "gclid", "dclid", "gbraid", "wbraid",
  "gad_source", "gad_campaignid", "gclsrc", "gclaw", "gcldc", "_gac",
  "_gcl_au", "_gcl_aw", "_gcl_dc", "_gcl_gs", "_gcl_gb", "usqp",
  "msclkid", "twclid", "ttclid", "yclid", "ymclid",
  "ysclid", "yadclid", "srsltid", "epik", "scid", "sccid", "s_kwcid",
  "li_fat_id", "mc_cid",
  "mc_eid", "_ga", "_gl", "_hsenc", "_hsmi", "__hstc", "__hssc", "__hsfp",
  "hsctatracking", "mkt_tok",
  "cjevent", "irclickid", "irgwc", "mkcid", "mkevt", "aff_fcid", "aff_fsk",
  "aff_platform", "aff_trace_key", "sscid", "awc", "ranmid", "raneaid", "ransiteid",
  "oly_enc_id", "oly_anon_id",
  "ck_subscriber_id", "dm_i", "mibextid", "_openstat", "rb_clickid", "s_cid",
  "s_fid", "s_ppv", "s_channel", "s_ptc", "s_plt", "s_vnum", "s_invisit",
  "s_cc", "s_sq", "vero_conv", "vero_id", "igshid", "igsh",
  "pk_campaign", "pk_kwd", "pk_keyword", "pk_source", "pk_medium", "pk_content",
  "pk_cid", "pk_group", "pk_placement",
  "action_object_map", "action_ref_map", "action_type_map",
  "rdt_cid", "ef_id", "ocid", "wt.mc_id",
  "__s", "_bhlid", "_kx", "ml_subscriber", "ml_subscriber_hash",
  "et_cid", "et_lid", "et_rid", "sfmc_id", "sfmc_activityid",
  "vgo_ee", "wickedid", "itsct", "itscg", "bsft_clkid", "bsft_uid"
]);

export const TRACKING_PARAMETER_PREFIXES = ["utm_", "hsa_", "mtm_", "piwik_", "_ga_"];

// Removed only when aggressive cleaning is switched on: these names are often
// referral or campaign tags, but some sites need them for the page to work.
export const AGGRESSIVE_PARAMETERS = new Set([
  "affiliate", "affiliate_id", "affid", "aff_id", "campaign", "campaignid",
  "clickid", "click_id", "partner", "partner_id", "ref", "referrer",
  "referral", "source", "src", "tracking", "tracking_id"
]);

export const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be"
]);

export const SPOTIFY_HOSTS = new Set(["open.spotify.com"]);

export const HOST_TRACKING_PARAMETERS = new Map(
  [...YOUTUBE_HOSTS, ...SPOTIFY_HOSTS].map((host) => [host, new Set(["si"])])
);

// google.com plus country domains such as google.co.uk, google.de and google.com.au.
const GOOGLE_HOST_PATTERN = /^google\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;
const AMAZON_HOST_PATTERN = /(?:^|\.)amazon\.(?:com(?:\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})$/;
const EBAY_HOST_PATTERN = /(?:^|\.)ebay\.(?:com(?:\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})$/;
const ETSY_HOST_PATTERN = /(?:^|\.)etsy\.com$/;

const APPLE_MEDIA_HOSTS = new Set([
  "music.apple.com",
  "itunes.apple.com",
  "geo.itunes.apple.com",
  "apps.apple.com",
  "tv.apple.com",
  "podcasts.apple.com",
  "appsto.re"
]);

// Removed only on hosts where the name is known to be tracking. Short or
// common names (s, t, ref, feature, tag) stay on every other site.
const HOST_RULES = [
  {
    suffixes: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
    parameters: new Set([
      "pp", "feature",
      "embeds_referring_euri", "embeds_referring_origin",
      "embeds_euri", "embeds_origin", "embeds_loader_url_for_pings",
      "source_ve_path"
    ]),
    exceptPath: (pathname) => pathname === "/signin" || pathname.startsWith("/signin/")
  },
  {
    suffixes: ["x.com", "twitter.com"],
    parameters: new Set(["s", "t", "ref_src", "ref_url", "cxt"]),
    exceptPath: (pathname) => pathname === "/i/redirect" || pathname.startsWith("/i/redirect/")
  },
  {
    suffixes: ["tiktok.com"],
    parameters: new Set([
      "_t", "_r", "is_from_webapp", "sender_device", "sender_web_id",
      "is_copy_url", "share_item_id", "tt_from", "refer", "u_code",
      "sharer_language", "referer_url", "referer_video_id", "embed_source"
    ])
  },
  {
    suffixes: ["reddit.com"],
    parameters: new Set(["share_id", "correlation_id", "ref_campaign", "ref_source"])
  },
  {
    suffixes: ["instagram.com"],
    parameters: new Set(["ig_rid"])
  },
  {
    suffixes: ["threads.net", "threads.com"],
    parameters: new Set(["xmt"])
  },
  {
    suffixes: ["linkedin.com"],
    parameters: new Set(["trk", "lipi", "trackingid", "trackingcode", "rcm", "ebp"])
  },
  {
    suffixes: ["facebook.com", "fb.com"],
    parameters: new Set([
      "__tn__", "comment_tracking", "sfnsn", "idorvanity", "paipv",
      "_rdr", "referral_story_type", "action_history", "ftentidentifier", "ls_ref"
    ])
  },
  {
    match: (host) => AMAZON_HOST_PATTERN.test(host),
    parameters: new Set([
      "tag", "ascsubtag", "linkcode", "linkid", "creative", "creativeasin",
      "camp", "dib", "dib_tag", "crid", "sprefix", "content-id", "ref_",
      "aaxitk", "ref", "qid"
    ]),
    prefixes: ["pd_rd_", "pf_rd_"]
  },
  {
    match: (host) => EBAY_HOST_PATTERN.test(host),
    parameters: new Set(["_trkparms", "_trksid", "_from", "mkrid", "campid", "toolid"])
  },
  {
    match: (host) => ETSY_HOST_PATTERN.test(host),
    parameters: new Set([
      "ga_order", "ga_search_type", "ga_view_type", "ga_search_query",
      "organic_search_click", "click_key", "frs", "sts", "ref"
    ])
  },
  {
    match: (host) => GOOGLE_HOST_PATTERN.test(host),
    path: /^\/search(?:\/|$)/,
    parameters: new Set(["ved", "ei", "oq", "uact", "sca_esv", "gs_lp", "gs_lcrp", "sei"])
  },
  {
    suffixes: ["bing.com", "msn.com"],
    parameters: new Set(["cvid"])
  },
  {
    hosts: APPLE_MEDIA_HOSTS,
    parameters: new Set(["at", "ct"])
  }
];

export const OPAQUE_SHORTENER_HOSTS = new Set([
  "a.co", "amzn.to", "bit.ly", "buff.ly", "cutt.ly", "goo.gl", "is.gd",
  "lnkd.in", "ow.ly", "pin.it", "rb.gy", "rebrand.ly", "shorturl.at",
  "spoti.fi", "t.co", "t.ly", "tiny.cc", "tinyurl.com",
  "vm.tiktok.com", "vt.tiktok.com"
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

export const MAX_UNWRAP_DEPTH = 5;

// %30-%39 (0-9), %41-%5A (A-Z) and %61-%7A (a-z).
const ENCODED_ALPHANUMERIC_PATTERN = /%(?:3[0-9]|4[1-9a-f]|5[0-9a]|6[1-9a-f]|7[0-9a])/i;

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isHttpUrl(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function hostRuleApplies(rule, hostname, pathname) {
  const host = normalizeHostname(hostname);
  const matched = rule.hosts
    ? rule.hosts.has(host)
    : rule.suffixes
      ? rule.suffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
      : rule.match(host);
  if (!matched) return false;
  if (rule.path && !rule.path.test(pathname || "")) return false;
  if (rule.exceptPath?.(pathname || "")) return false;
  return true;
}

function isHostRuleParameter(name, hostname, pathname) {
  for (const rule of HOST_RULES) {
    if (!hostRuleApplies(rule, hostname, pathname)) continue;
    if (rule.parameters.has(name)) return true;
    if (rule.prefixes?.some((prefix) => name.startsWith(prefix))) return true;
  }
  return false;
}

function isTrackingParameter(name, hostname, pathname = "") {
  const normalizedName = name.toLowerCase();
  if (TRACKING_PARAMETER_PREFIXES.some((prefix) => normalizedName.startsWith(prefix))) {
    return true;
  }
  if (TRACKING_PARAMETERS.has(normalizedName)) {
    return true;
  }
  const hostTrackers = HOST_TRACKING_PARAMETERS.get(normalizeHostname(hostname));
  if (hostTrackers?.has(normalizedName)) return true;
  return isHostRuleParameter(normalizedName, hostname, pathname);
}

function getHrefLiDestination(url) {
  const raw = url.search.startsWith("?") ? url.search.slice(1) : "";
  if (!raw) return null;
  let destination;
  try {
    destination = decodeURIComponent(raw);
  } catch {
    destination = raw;
  }
  // href.li takes the destination as its whole query, so a trailing #fragment
  // was parsed as the wrapper's own hash but belongs to the destination.
  return destination.includes("#") ? destination : destination + url.hash;
}

function getWrapperInfo(url) {
  const host = normalizeHostname(url.hostname);
  const path = url.pathname;

  if ((GOOGLE_HOST_PATTERN.test(host) || host === "googleadservices.com") && path === "/url") {
    // Gmail and Docs use q=; search-result links leave q empty and use url=.
    const parameter = ["q", "url"].find((name) => validHttpDestination(url.searchParams.get(name) ?? "")) ?? "q";
    return { parameter, destination: url.searchParams.get(parameter) };
  }

  if ((host === "facebook.com" || host === "l.facebook.com" || host === "lm.facebook.com") && path === "/l.php") {
    return { parameter: "u", destination: url.searchParams.get("u") };
  }

  if (host === "l.instagram.com" && path === "/") {
    return { parameter: "u", destination: url.searchParams.get("u") };
  }

  if (host === "safelinks.protection.outlook.com" || host.endsWith(".safelinks.protection.outlook.com")) {
    return { parameter: "url", destination: url.searchParams.get("url") };
  }

  if ((host === "youtube.com" || host === "m.youtube.com") && path === "/redirect") {
    return { parameter: "q", destination: url.searchParams.get("q") };
  }

  if (host === "linkedin.com" && (path === "/safety/go" || path === "/redir/redirect" || path === "/redir/redirect/")) {
    return { parameter: "url", destination: url.searchParams.get("url") };
  }

  if (host === "href.li") {
    return { parameter: "query", destination: getHrefLiDestination(url) };
  }

  return null;
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
export function isOriginalQuerySegmentRemoved(name, index, removedParameters, removedDuplicateIndices) {
  const removedNames = new Set(removedParameters.map((parameter) => parameter.toLowerCase()));
  return removedNames.has(String(name).toLowerCase()) || removedDuplicateIndices.includes(index);
}

// Duplicate indices are computed on the cleaned URL (after unwrap). The Before
// view shows the pasted URL, so skip index-based marks when a wrapper was peeled.
export function removedDuplicateIndicesForBeforeView(result) {
  return result.unwrappedFrom.length > 0 ? [] : result.removedDuplicateIndices;
}

export function querySegments(search) {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query.split("&").filter(Boolean).map((raw) => {
    const separator = raw.indexOf("=");
    const rawName = separator === -1 ? raw : raw.slice(0, separator);
    const rawValue = separator === -1 ? "" : raw.slice(separator + 1);
    return { raw, name: decodeQueryComponent(rawName), value: decodeQueryComponent(rawValue) };
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

function nextRedirectLayer(url, visited) {
  const info = getWrapperInfo(url);
  if (!info?.destination) return null;
  const destination = validHttpDestination(info.destination);
  if (!destination || visited.has(destination.href)) return null;
  return { info, destination };
}

// The single unwrap engine shared by cleaning, X-Ray, and the fingerprint, so
// they always agree on which layers were found.
function unwrapRedirectLayers(input, maximumDepth = MAX_UNWRAP_DEPTH) {
  let current = parseHttpUrl(input);
  const layers = [];
  const visited = new Set([current.href]);
  let next = nextRedirectLayer(current, visited);

  while (next && layers.length < maximumDepth) {
    layers.push({
      from: current.href,
      host: current.hostname,
      parameter: next.info.parameter,
      to: next.destination.href
    });
    current = next.destination;
    visited.add(current.href);
    next = nextRedirectLayer(current, visited);
  }

  return { url: current, layers, limitReached: Boolean(next) };
}

export function categorizeParameter(name, hostname = "", pathname = "") {
  const normalized = String(name).toLowerCase();
  if (isTrackingParameter(normalized, hostname, pathname)) return "tracking";
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
  // Non-Latin text is always percent-encoded, so that alone is normal. Encoded
  // plain letters or digits never need escaping and can hide words like "login".
  if (ENCODED_ALPHANUMERIC_PATTERN.test(url.pathname + url.search)) {
    flags.push("The URL percent-encodes plain letters or digits, which can hide what it says.");
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
      const category = categorizeParameter(name, url.hostname, url.pathname);
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

export function fingerprintRelevantParametersOnDestination(input) {
  const redirect = unwrapRedirectLayers(input);
  const hostname = redirect.url.hostname;
  const parameters = [];
  for (const [name, value] of redirect.url.searchParams) {
    const category = categorizeParameter(name, hostname, redirect.url.pathname);
    if (category === "tracking" || category === "affiliate/referral") {
      parameters.push({ name, value, category });
    }
  }
  return parameters;
}

export function fingerprintRemovedKeptDetail(input, removedParameters, { aggressive = false } = {}) {
  const fingerprintParams = fingerprintRelevantParametersOnDestination(input);
  if (fingerprintParams.length === 0) return null;

  const removedNames = new Set(removedParameters.map((name) => name.toLowerCase()));
  const kept = fingerprintParams.filter((parameter) => !removedNames.has(parameter.name.toLowerCase()));
  const removedCount = fingerprintParams.filter((parameter) => removedNames.has(parameter.name.toLowerCase())).length;
  const keptCount = kept.length;
  if (keptCount === 0) return null;

  const keptDescriptions = kept.map((parameter) => {
    if (parameter.category === "affiliate/referral" && !aggressive) {
      return `\`${parameter.name}\` (affiliate/referral, kept because aggressive cleaning is off)`;
    }
    return `\`${parameter.name}\` (${parameter.category})`;
  });

  const keptText = keptCount === 1
    ? `1 kept: ${keptDescriptions[0]}`
    : `${keptCount} kept: ${keptDescriptions.join("; ")}`;

  const keptAffiliate = kept.some((parameter) => parameter.category === "affiliate/referral");
  const detail = keptAffiliate && !aggressive
    ? `${removedCount} removed · ${keptCount} kept (affiliate/referral, kept because aggressive cleaning is off)`
    : `${removedCount} removed · ${keptCount} kept`;

  return { removedCount, keptCount, kept, keptText, detail };
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
      category: categorizeParameter(name, url.hostname, url.pathname),
      decodedValues: decodeForInspection(value)
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

function removeTrackingParameters(url, { aggressive = false, removeDuplicateParameters = false } = {}) {
  const keptSegments = [];
  const removedParameters = [];
  const aggressiveRemovedParameters = [];
  const duplicateParameters = [];
  const removedDuplicateIndices = [];
  const seenPairs = new Set();
  for (const [index, segment] of querySegments(url.search).entries()) {
    // Identical means same name and same decoded value; a=1&a=2 is never touched.
    const pair = JSON.stringify([segment.name, segment.value]);
    if (isTrackingParameter(segment.name, url.hostname, url.pathname)) {
      removedParameters.push(segment.name);
    } else if (aggressive && AGGRESSIVE_PARAMETERS.has(segment.name.toLowerCase())) {
      removedParameters.push(segment.name);
      aggressiveRemovedParameters.push(segment.name);
    } else if (removeDuplicateParameters && seenPairs.has(pair)) {
      duplicateParameters.push(segment.name);
      removedDuplicateIndices.push(index);
    } else {
      keptSegments.push(segment.raw);
      seenPairs.add(pair);
    }
  }
  url.search = keptSegments.join("&");
  return { removedParameters, aggressiveRemovedParameters, duplicateParameters, removedDuplicateIndices };
}

export function cleanUrl(input, options = {}) {
  const redirect = unwrapRedirectLayers(input);
  // A missing, malformed, or non-http(s) destination stops unwrapping, so the
  // wrapper itself is cleaned instead.
  const url = new URL(redirect.url.href);
  const { removedParameters, aggressiveRemovedParameters, duplicateParameters, removedDuplicateIndices } = removeTrackingParameters(url, options);
  return {
    url: url.toString(),
    removedParameters,
    aggressiveRemovedParameters,
    duplicateParameters,
    removedDuplicateIndices,
    changed: removedParameters.length > 0 || duplicateParameters.length > 0 || redirect.layers.length > 0,
    unwrappedFrom: redirect.layers.map((layer) => layer.host),
    unwrapLimitReached: redirect.limitReached,
    fingerprint: trackingFingerprint(input),
    inspection: inspectUrl(input)
  };
}

export function cleanBatch(text, options = {}) {
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
        result: cleanUrl(input, options)
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
