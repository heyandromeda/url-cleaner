import { TRACKER_PROFILES } from "./tracker-profiles.js";

export { TRACKER_PROFILES };

export const PARAMETER_EXPLANATIONS = {
  utm_source: "Google Analytics UTM field naming the site, campaign, or tool that sent the visit.",
  utm_medium: "Google Analytics UTM field naming the marketing medium, such as email or CPC.",
  utm_campaign: "Google Analytics UTM field naming the campaign this link belongs to.",
  utm_term: "Google Analytics UTM field used for paid-search keywords.",
  utm_content: "Google Analytics UTM field used to tell ads or links in the same campaign apart.",
  utm_id: "Google Analytics UTM campaign identifier.",
  utm_name: "Older Google Analytics UTM campaign name field.",
  fbclid: "Facebook click identifier added to outbound links from Facebook products.",
  fb_action_ids: "Facebook social-plugin field identifying an action taken on Facebook.",
  fb_action_types: "Facebook social-plugin field naming the type of action taken.",
  fb_source: "Facebook parameter describing where a shared link was shown.",
  fb_ref: "Facebook referrer parameter used for traffic attribution.",
  gclid: "Google Ads click identifier assigned when someone clicks a Google ad.",
  dclid: "Display Click Identifier used by Campaign Manager 360 / Display & Video 360 enhanced attribution.",
  gbraid: "Google Ads privacy-preserving click parameter used for app conversion measurement.",
  wbraid: "Google Ads privacy-preserving click parameter used for web conversion measurement.",
  gad_source: "Google Ads parameter describing the ad source that generated the click.",
  gad_campaignid: "Google Ads parameter identifying the campaign of a clicked ad.",
  gclsrc: "Google Ads parameter naming the click-id source, such as Google Ads or Search Ads 360.",
  gclaw: "Google Ads conversion-linker parameter.",
  gcldc: "Google Ads conversion-linker parameter for DoubleClick / Campaign Manager.",
  _gac: "Google Analytics / Ads linker parameter that carries click information between properties.",
  _gcl_au: "Google Ads conversion-linker parameter used with gtag.js.",
  msclkid: "Microsoft Advertising (Bing Ads) click identifier.",
  cvid: "Microsoft Advertising correlation / click identifier seen on Bing traffic.",
  twclid: "X (Twitter) click identifier added to outbound advertised or tracked links.",
  ttclid: "TikTok click identifier added to outbound advertised links.",
  yclid: "Yandex Ads click identifier.",
  ymclid: "Yandex Metrica click identifier.",
  ysclid: "Yandex Search click identifier.",
  srsltid: "Google Merchant Center result id appended to free product listing clicks.",
  epik: "Pinterest ad-click matching parameter cached by the Pinterest tag as _epik.",
  scid: "Snapchat click identifier.",
  s_kwcid: "Adobe Advertising / Microsoft Advertising keyword click identifier.",
  li_fat_id: "LinkedIn first-party ads tracking identifier (li_fat_id).",
  mc_cid: "Mailchimp campaign identifier added to tracked email links.",
  mc_eid: "Mailchimp unique email identifier added to tracked email links.",
  _ga: "Google Analytics identifier sometimes seen when analytics linker decoration is present.",
  _gl: "Google Analytics cross-domain linker parameter.",
  _hsenc: "HubSpot email identity-tracking parameter.",
  _hsmi: "HubSpot marketing email identifier.",
  hsctatracking: "HubSpot call-to-action tracking parameter.",
  mkt_tok: "Adobe Marketo email-click tracking token.",
  cjevent: "CJ Affiliate (Commission Junction) click event identifier.",
  irclickid: "Impact (Impact Radius) affiliate click identifier.",
  mkcid: "CJ Affiliate marketing/click identifier.",
  mkevt: "CJ Affiliate event-type parameter.",
  aff_fcid: "Affiliate network click identifier (commonly Admitad / related networks).",
  aff_fsk: "Affiliate network session or click key.",
  aff_platform: "Affiliate network platform identifier.",
  aff_trace_key: "Affiliate network trace key used to attribute a click.",
  oly_enc_id: "Omeda (Olytics) encrypted identity parameter on email links.",
  oly_anon_id: "Omeda (Olytics) anonymous identifier on email links.",
  ck_subscriber_id: "Kit (ConvertKit) subscriber identifier on email links.",
  dm_i: "Dotdigital email campaign identifier.",
  mibextid: "Meta (Facebook/Instagram) share/extension identifier.",
  _openstat: "Openstat analytics campaign parameter.",
  rb_clickid: "Admitad (and similar) affiliate click identifier.",
  s_cid: "Adobe Analytics campaign identifier.",
  s_fid: "Adobe Analytics fallback visitor identifier.",
  s_ppv: "Adobe Analytics previous-page-view parameter.",
  s_channel: "Adobe Analytics channel parameter.",
  s_ptc: "Adobe Analytics page-time counter parameter.",
  s_plt: "Adobe Analytics page-load-time parameter.",
  s_vnum: "Adobe Analytics visit-number parameter.",
  s_invisit: "Adobe Analytics in-visit indicator.",
  s_cc: "Adobe Analytics cookie-consent / cookie-check parameter.",
  s_sq: "Adobe Analytics click-map / previous-query parameter.",
  vero_conv: "Vero email conversion tracking parameter.",
  vero_id: "Vero email recipient identifier.",
  igshid: "Instagram share identifier added to outbound shared links.",
  pk_campaign: "Matomo (formerly Piwik) campaign name.",
  pk_kwd: "Matomo campaign keyword.",
  pk_source: "Matomo campaign source.",
  pk_medium: "Matomo campaign medium.",
  pk_content: "Matomo campaign content.",
  pk_cid: "Matomo campaign identifier.",
  si: "YouTube share identifier commonly added to shared video links."
};

export const PREFIX_EXPLANATIONS = {
  utm_: "Urchin Tracking Module (UTM) campaign parameter used by Google Analytics and similar tools.",
  hsa_: "HubSpot ads tracking parameter.",
  mtm_: "Matomo campaign tracking parameter.",
  piwik_: "Matomo (formerly Piwik) campaign tracking parameter.",
  _ga_: "Google Analytics identifier parameter used with gtag.js / GA4."
};

export function explainParameter(name) {
  if (name == null || name === "") return null;
  const normalized = String(name).toLowerCase();
  if (Object.hasOwn(PARAMETER_EXPLANATIONS, normalized)) {
    return PARAMETER_EXPLANATIONS[normalized];
  }
  for (const [prefix, explanation] of Object.entries(PREFIX_EXPLANATIONS)) {
    if (normalized.startsWith(prefix)) {
      return explanation;
    }
  }
  return null;
}

export function getTrackerProfile(name) {
  if (name == null || name === "") return null;
  const normalized = String(name).toLowerCase();
  const profile = TRACKER_PROFILES[normalized];
  if (!profile) return null;
  return {
    name: normalized,
    explanation: PARAMETER_EXPLANATIONS[normalized],
    ...profile
  };
}

export function trackerOfTheDay(date = new Date()) {
  const names = Object.keys(TRACKER_PROFILES).sort();
  const stamp = utcDateStamp(date);
  const days = Math.floor(Date.parse(`${stamp}T00:00:00Z`) / 86400000);
  const name = names[((days % names.length) + names.length) % names.length];
  const profile = getTrackerProfile(name);
  return { date: stamp, ...profile };
}

export function utcDateStamp(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function estimateProfileWordCount(profile) {
  const chunks = [
    profile.what,
    profile.who,
    profile.how,
    profile.why,
    profile.privacy,
    ...(profile.funFacts || []),
    profile.exampleNote,
    profile.safeToRemove
  ];
  return chunks.join(" ").trim().split(/\s+/).filter(Boolean).length;
}
