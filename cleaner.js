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
  "s_cc", "s_sq", "vero_conv", "vero_id", "igshid",
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

function getWrapperDestination(url) {
  const host = normalizeHostname(url.hostname);
  const path = url.pathname;

  if ((host === "google.com" || host === "googleadservices.com") && path === "/url") {
    return url.searchParams.get("q");
  }

  if ((host === "facebook.com" || host === "l.facebook.com" || host === "lm.facebook.com") && path === "/l.php") {
    return url.searchParams.get("u");
  }

  if (host === "safelinks.protection.outlook.com" || host.endsWith(".safelinks.protection.outlook.com")) {
    return url.searchParams.get("url");
  }

  if ((host === "youtube.com" || host === "m.youtube.com") && path === "/redirect") {
    return url.searchParams.get("q");
  }

  if (host === "href.li") {
    return getHrefLiDestination(url);
  }

  return null;
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

  const keptParameters = new URLSearchParams();
  const removedParameters = [];
  for (const [name, parameterValue] of url.searchParams) {
    if (isTrackingParameter(name, url.hostname)) {
      removedParameters.push(name);
    } else {
      keptParameters.append(name, parameterValue);
    }
  }
  url.search = keptParameters.toString();
  return {
    url: url.toString(),
    removedParameters,
    changed: removedParameters.length > 0,
    unwrappedFrom: []
  };
}

export function cleanUrl(input) {
  return cleanUrlAtDepth(input, 0);
}
