// Add a lowercase parameter name here to extend the exact-match tracker list.
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

// Add a lowercase prefix here for tracker families such as Matomo and HubSpot.
export const TRACKING_PARAMETER_PREFIXES = [
  "utm_", "hsa_", "mtm_", "pk_", "piwik_", "_ga_"
];

function isTrackingParameter(name) {
  const normalizedName = name.toLowerCase();
  return TRACKING_PARAMETER_PREFIXES.some((prefix) => normalizedName.startsWith(prefix)) || TRACKING_PARAMETERS.has(normalizedName);
}

export function cleanUrl(input) {
  const value = input.trim();
  if (!value) throw new TypeError("Enter a URL to clean.");

  let url;
  try { url = new URL(value); }
  catch { throw new TypeError("Enter a valid URL, including https:// or http://."); }

  const keptParameters = new URLSearchParams();
  const removedParameters = [];
  for (const [name, parameterValue] of url.searchParams) {
    if (isTrackingParameter(name)) removedParameters.push(name);
    else keptParameters.append(name, parameterValue);
  }
  url.search = keptParameters.toString();
  return { url: url.toString(), removedParameters, changed: removedParameters.length > 0 };
}
