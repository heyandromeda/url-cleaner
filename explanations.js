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
  cvid: "Bing and MSN session identifier. Removed only on Bing and MSN links, not on other sites.",
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
  igsh: "Instagram share identifier (newer alias of igshid) added to copied and shared links.",
  pk_campaign: "Matomo (formerly Piwik) campaign name.",
  pk_kwd: "Matomo campaign keyword.",
  pk_source: "Matomo campaign source.",
  pk_medium: "Matomo campaign medium.",
  pk_content: "Matomo campaign content.",
  pk_cid: "Matomo campaign identifier.",
  si: "Share identifier added to links copied from YouTube and Spotify; removed only on those sites.",
  _gcl_aw: "Google Ads conversion-linker parameter for an ad click.",
  _gcl_dc: "Google Ads conversion-linker parameter for a Campaign Manager click.",
  _gcl_gs: "Google Ads conversion-linker parameter for a Google Shopping click.",
  _gcl_gb: "Google Ads conversion-linker parameter used with gbraid.",
  usqp: "Google AMP and source-tracking parameter.",
  ef_id: "Adobe Advertising and Search Ads 360 click identifier (ef_id).",
  action_object_map: "Facebook social-plugin field mapping an action to an object.",
  action_ref_map: "Facebook social-plugin field mapping an action to a referrer.",
  action_type_map: "Facebook social-plugin field mapping an action to its type.",
  sccid: "Snapchat click identifier (ScCid) added to advertised landing pages.",
  rdt_cid: "Reddit Ads click identifier appended to advertised landing pages.",
  yadclid: "Yandex advertising click identifier.",
  ocid: "Microsoft originating campaign identifier used on Microsoft marketing links.",
  "wt.mc_id": "Microsoft WebTrends marketing campaign identifier.",
  __hstc: "HubSpot tracking cookie echoed into a link.",
  __hssc: "HubSpot session cookie echoed into a link.",
  __hsfp: "HubSpot fingerprint cookie echoed into a link.",
  __s: "Drip email tracking parameter.",
  _bhlid: "Beehiiv subscriber identifier added to newsletter links.",
  _kx: "Klaviyo email exchange identifier added to newsletter links.",
  ml_subscriber: "MailerLite subscriber identifier on email links.",
  ml_subscriber_hash: "MailerLite subscriber hash on email links.",
  et_cid: "Salesforce Marketing Cloud (ExactTarget) campaign identifier.",
  et_lid: "Salesforce Marketing Cloud (ExactTarget) link identifier.",
  et_rid: "Salesforce Marketing Cloud (ExactTarget) recipient identifier.",
  sfmc_id: "Salesforce Marketing Cloud subscriber identifier.",
  sfmc_activityid: "Salesforce Marketing Cloud activity identifier.",
  vgo_ee: "ActiveCampaign site-tracking parameter.",
  wickedid: "Wicked Reports click identifier.",
  sscid: "ShareASale affiliate click identifier.",
  awc: "Awin affiliate click checksum.",
  irgwc: "Impact affiliate click identifier.",
  ranmid: "Rakuten Advertising merchant identifier.",
  raneaid: "Rakuten Advertising affiliate identifier.",
  ransiteid: "Rakuten Advertising site identifier.",
  pk_keyword: "Matomo campaign keyword. Unrelated pk_ names such as pk_live are kept.",
  pk_group: "Matomo campaign group.",
  pk_placement: "Matomo campaign placement.",
  itsct: "Apple iTunes Store campaign token.",
  itscg: "Apple iTunes Store campaign group.",
  bsft_clkid: "Blueshift email click identifier.",
  bsft_uid: "Blueshift user identifier on email links.",
  pp: "YouTube share-attribution parameter. Removed only on YouTube links.",
  feature: "YouTube share and embed attribution parameter. Removed only on YouTube, and kept on YouTube sign-in links.",
  embeds_referring_euri: "YouTube embed parameter naming the referring page.",
  embeds_referring_origin: "YouTube embed parameter naming the referring origin.",
  embeds_euri: "YouTube embed parameter naming the embedding page.",
  embeds_origin: "YouTube embed parameter naming the embedding origin.",
  embeds_loader_url_for_pings: "YouTube embed parameter used for view pings.",
  source_ve_path: "YouTube internal view-path attribution parameter.",
  s: "X (Twitter) share-source parameter. Removed only on X and Twitter links, never globally.",
  ref_src: "X (Twitter) referrer source added to shared posts.",
  ref_url: "X (Twitter) referrer URL added to shared posts.",
  cxt: "X (Twitter) share-context parameter.",
  _t: "TikTok share token. Removed only on TikTok links.",
  _r: "TikTok reshare counter. Removed only on TikTok links.",
  is_from_webapp: "TikTok flag marking a link copied from the web app.",
  sender_device: "TikTok parameter naming the device that shared the link.",
  sender_web_id: "TikTok web-session identifier of the person who shared the link.",
  is_copy_url: "TikTok flag set when a link was copied.",
  share_item_id: "TikTok identifier for a specific share event.",
  tt_from: "TikTok parameter naming the surface a link was shared from.",
  refer: "TikTok share-referrer parameter. Removed only on TikTok links.",
  u_code: "TikTok share code tied to the sharing account.",
  sharer_language: "TikTok parameter recording the sharer's language. The page language parameter is kept.",
  referer_url: "TikTok parameter naming the referring video URL.",
  referer_video_id: "TikTok parameter naming the referring video.",
  embed_source: "TikTok embed attribution parameter.",
  share_id: "Reddit share identifier. Removed only on Reddit links.",
  correlation_id: "Reddit app correlation identifier. Removed only on Reddit links.",
  ref_campaign: "Reddit share-campaign parameter. Removed only on Reddit links.",
  ref_source: "Reddit share-source parameter. Removed only on Reddit links.",
  ig_rid: "Instagram request identifier on Instagram links.",
  xmt: "Threads share-tracking parameter. Removed only on Threads links.",
  trk: "LinkedIn click-tracking code naming which button or module was used.",
  lipi: "LinkedIn page-instance tracking parameter.",
  trackingid: "LinkedIn tracking identifier on profile and job links.",
  trackingcode: "LinkedIn tracking code on profile links.",
  rcm: "LinkedIn recommendation-module tracking parameter.",
  ebp: "LinkedIn email or job tracking parameter.",
  __tn__: "Facebook notification-source tracking parameter. Removed only on Facebook links.",
  comment_tracking: "Facebook comment-click tracking parameter. comment_id itself is kept.",
  sfnsn: "Facebook notification tracking parameter.",
  idorvanity: "Facebook vanity-page tracking parameter.",
  paipv: "Facebook in-app view tracking parameter.",
  _rdr: "Facebook redirect-tracking parameter.",
  referral_story_type: "Facebook parameter naming the story type a click came from.",
  action_history: "Facebook parameter recording prior social actions on a link.",
  ftentidentifier: "Facebook feed-entry tracking identifier.",
  ls_ref: "Facebook link-shim referrer parameter.",
  tag: "Amazon Associates affiliate tag. Removed only on Amazon links.",
  ascsubtag: "Amazon Associates sub-tag. Removed only on Amazon links.",
  linkcode: "Amazon Associates link-type code.",
  linkid: "Amazon Associates link identifier.",
  creative: "Amazon Associates creative identifier. Removed only on Amazon links.",
  creativeasin: "Amazon Associates creative ASIN. The product ASIN in the path is kept.",
  camp: "Amazon Associates campaign number. Removed only on Amazon links.",
  dib: "Amazon discovery tracking parameter.",
  dib_tag: "Amazon discovery tag.",
  crid: "Amazon campaign or creative identifier. Removed only on Amazon links.",
  sprefix: "Amazon search-prefix tracking parameter.",
  "content-id": "Amazon content attribution identifier. Removed only on Amazon links.",
  ref_: "Amazon referral parameter. Removed only on Amazon links.",
  aaxitk: "Amazon advertising impression token.",
  qid: "Amazon search-query identifier. The search keywords themselves are kept.",
  _trkparms: "eBay tracking-parameter blob. Removed only on eBay links.",
  _trksid: "eBay tracking session identifier.",
  _from: "eBay click-origin parameter. Removed only on eBay links.",
  mkrid: "eBay Partner Network rotation identifier.",
  campid: "eBay Partner Network campaign identifier. Removed only on eBay links.",
  toolid: "eBay Partner Network tool identifier.",
  ga_order: "Etsy search-order tracking parameter. Removed only on Etsy links.",
  ga_search_type: "Etsy search-type tracking parameter.",
  ga_view_type: "Etsy gallery-view tracking parameter.",
  ga_search_query: "Etsy parameter recording the search that led to a listing.",
  organic_search_click: "Etsy organic-search click flag.",
  click_key: "Etsy click identifier.",
  frs: "Etsy referral-session parameter.",
  sts: "Etsy search-timestamp parameter.",
  ved: "Google search link-tracking token. Removed only on Google search URLs.",
  ei: "Google search event identifier. Removed only on Google search URLs.",
  oq: "Google search original-query parameter. The q search box value is kept.",
  uact: "Google search user-action tracking parameter.",
  sca_esv: "Google search client-attribution parameter.",
  gs_lp: "Google search layout tracking parameter.",
  gs_lcrp: "Google search layout tracking parameter.",
  sei: "Google search event identifier.",
  at: "Apple affiliate token. Removed only on Apple media links such as Apple Music.",
  ct: "Apple campaign text. Removed only on Apple media links. Song and album ids are kept.",
  t: "X (Twitter) share token. Removed only on X and Twitter links. YouTube timestamps use the same name and are kept.",
  ref: "Referral parameter. Removed on Amazon and Etsy. On other sites it is removed only when aggressive cleaning is on."
};

export const PREFIX_EXPLANATIONS = {
  utm_: "Urchin Tracking Module (UTM) campaign parameter used by Google Analytics and similar tools.",
  hsa_: "HubSpot ads tracking parameter.",
  mtm_: "Matomo campaign tracking parameter.",
  piwik_: "Matomo (formerly Piwik) campaign tracking parameter.",
  _ga_: "Google Analytics identifier parameter used with gtag.js / GA4.",
  "pd_rd_": "Amazon product-discovery tracking parameter. Removed only on Amazon links.",
  "pf_rd_": "Amazon product-finding tracking parameter. Removed only on Amazon links."
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
