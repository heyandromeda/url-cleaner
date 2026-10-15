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
  dclid: "Google Display Ads / Campaign Manager click identifier.",
  gbraid: "Google Ads click identifier used for iOS web-to-app measurement.",
  wbraid: "Google Ads click identifier used for iOS web-to-web measurement.",
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
  srsltid: "Google Shopping organic listing identifier.",
  epik: "Pinterest click identifier added to outbound advertised or tracked links.",
  scid: "Snapchat click identifier.",
  s_kwcid: "Adobe Advertising / Microsoft Advertising keyword click identifier.",
  li_fat_id: "LinkedIn first-party ads tracking identifier.",
  mc_cid: "Mailchimp campaign identifier added to tracked email links.",
  mc_eid: "Mailchimp unique email identifier added to tracked email links.",
  _ga: "Google Analytics cross-domain linker parameter.",
  _gl: "Google Analytics 4 cross-domain linker parameter.",
  _hsenc: "HubSpot email-click tracking parameter.",
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
  si: "YouTube share identifier used to attribute a shared video link."
};

export const PREFIX_EXPLANATIONS = {
  utm_: "Urchin Tracking Module (UTM) campaign parameter used by Google Analytics and similar tools.",
  hsa_: "HubSpot ads tracking parameter.",
  mtm_: "Matomo campaign tracking parameter.",
  piwik_: "Matomo (formerly Piwik) campaign tracking parameter.",
  _ga_: "Google Analytics identifier parameter used with gtag.js / GA4."
};

/**
 * Rich, educational profiles used by Tracker of the Day.
 * Short blurbs in PARAMETER_EXPLANATIONS still power the removed-parameter list.
 */
export const TRACKER_PROFILES = {
  utm_source: {
    what: "utm_source is the friendliest member of the UTM family. It simply names where a visit came from — a newsletter, a partner site, a QR poster, or an ad platform. Marketers add it by hand (or with a link builder) so analytics tools can group traffic by origin.",
    who: "Anyone using Google Analytics, Adobe Analytics, Matomo, or similar tools. Email platforms, social schedulers, and ad managers often append it automatically when you create a tracked link.",
    how: "When you open a tagged URL, the analytics snippet on the destination site reads utm_source from the query string and stores it with the session. Sharing the same link later usually carries the tag along unless something strips it.",
    why: "Campaign reports answer “which channel brought people here?” Without a source tag, many visits collapse into a vague “direct / none” bucket, so marketers lose the ability to compare channels.",
    privacy: "By itself it is usually a short label like newsletter or twitter, not a personal ID. Combined with other UTMs and cookies, it still helps paint a picture of how you arrived and which campaign you were part of.",
    funFacts: [
      "UTM stands for Urchin Tracking Module — Urchin Software was acquired by Google in 2005 and became Google Analytics.",
      "The five classic UTM fields (source, medium, campaign, term, content) have barely changed in two decades, which is why they show up everywhere.",
      "Many “smart” shorteners and email tools rewrite your links just to inject these tags.",
      "utm_source is intentionally human-readable: marketers pick the values, not an opaque algorithm."
    ],
    exampleUrl: "https://shop.example.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=march25",
    exampleNote: "Here utm_source=newsletter tells analytics the click came from an email list, while medium and campaign narrow it further.",
    safeToRemove: "Yes for browsing and sharing. Removing it does not change the page you land on; it only stops that visit from being attributed to the campaign in analytics."
  },
  utm_term: {
    what: "utm_term is the UTM field marketers use for paid-search keywords — the search phrases they bid on. It answers “which keyword brought this visit?” when someone clicks a search ad that lands on a tagged URL.",
    who: "Google Ads, Microsoft Advertising, and campaign-management tools that auto-tag landing-page URLs. Agencies and in-house SEM teams rely on it heavily.",
    how: "An ad platform can fill utm_term with the matched keyword (or a ValueTrack-style placeholder) when building the final URL. Your site’s analytics then stores that value with the session after the click.",
    why: "Paid search lives and dies by keyword performance. utm_term lets marketers connect spend, clicks, and on-site behavior without opening the ad platform for every question.",
    privacy: "It can reveal the search theme that led you to the page — sometimes surprisingly specific. It is not a personal identifier by itself, but it is a clue about intent in that moment.",
    funFacts: [
      "utm_term is optional; many social and email campaigns leave it blank because there is no “keyword.”",
      "Auto-tagging with gclid can make utm_term redundant for Google Ads, yet teams still add both for portable reports.",
      "Misspelled keyword values in utm_term are a classic sign of rushed campaign setup.",
      "Unlike gclid, utm_term is meant to be readable by humans in a spreadsheet."
    ],
    exampleUrl: "https://store.example.com/hiking-boots?utm_source=google&utm_medium=cpc&utm_term=waterproof%20trail%20shoes",
    exampleNote: "utm_term=waterproof trail shoes records the paid keyword associated with the ad click.",
    safeToRemove: "Yes. The product page still loads; only keyword attribution in analytics is affected."
  },
  utm_campaign: {
    what: "utm_campaign names the marketing effort behind a link — a product launch, a seasonal sale, a webinar invite. It is the “which promotion?” label that ties many ads and emails together.",
    who: "Marketing teams across Google Analytics, HubSpot, Mailchimp, and most link builders. If a report has a campaign column, this parameter is usually feeding it.",
    how: "Every creative in the same push shares one campaign value. When someone clicks, analytics records that campaign name for the session so later conversions can be credited to the push.",
    why: "Budgets are approved per campaign. Marketers need a stable name that survives across email, paid social, and display so results roll up in one place.",
    privacy: "Campaign names are often bland (spring_sale_2026), but sometimes they encode audience segments or offer types. Still not a personal ID — just marketing context.",
    funFacts: [
      "Inconsistent campaign spelling (SpringSale vs spring_sale) is one of the most common reasons marketing dashboards look “wrong.”",
      "Some teams treat utm_id as a machine-friendly twin of utm_campaign for joins into ad platforms.",
      "Printed QR codes still use campaign tags so offline posters can show up in web analytics.",
      "Because the value is free-text, playful internal codenames sometimes leak into public URLs."
    ],
    exampleUrl: "https://events.example.com/register?utm_source=linkedin&utm_medium=social&utm_campaign=webinar_april",
    exampleNote: "utm_campaign=webinar_april groups this LinkedIn post with every other link from the same webinar push.",
    safeToRemove: "Yes. Registration still works; the visit simply will not be bucketed under that campaign name."
  },
  gclid: {
    what: "gclid (Google Click Identifier) is a unique token Google Ads attaches when someone clicks an ad. The destination site — usually via Google tags — sends it back so Google can match the click to later conversions.",
    who: "Google Ads advertisers, Google Analytics properties with auto-tagging, and conversion-linker setups that bridge Ads and Analytics.",
    how: "You click an ad; Google appends gclid to the landing URL. The site stores it (often in a first-party cookie via the conversion linker) and includes it when reporting purchases or sign-ups.",
    why: "Advertisers need proof that ad spend led to results. gclid is Google’s durable join key between the auction click and on-site outcomes, even when cookies are messy.",
    privacy: "It is an opaque click ID, not your name, but it is specific to that click and helps Google and the advertiser stitch together ad exposure and site activity. Treat it as advertising telemetry.",
    funFacts: [
      "Auto-tagging can add gclid even when marketers never typed a UTM parameter.",
      "gclid values are intentionally opaque — you cannot decode the keyword from the string alone.",
      "Related IDs like gbraid and wbraid appeared to help measurement on privacy-restricted iOS flows.",
      "If you paste a Google Ads URL into a chat, the gclid often still rides along and attributes your friend incorrectly."
    ],
    exampleUrl: "https://www.example.com/offer?gclid=EAIaIQobChMIexampleclickid",
    exampleNote: "The long gclid value identifies this specific ad click so Google Ads can attribute a later conversion.",
    safeToRemove: "Yes for normal browsing. The page content does not depend on gclid; only ad conversion attribution does."
  },
  gbraid: {
    what: "gbraid is a Google Ads click identifier aimed at web-to-app measurement on iOS, where older cookie-style tracking is limited. It helps Google attribute app activity after someone taps an ad in a constrained environment.",
    who: "Google Ads advertisers promoting apps or measuring app conversions, especially on Apple platforms with App Tracking Transparency limits.",
    how: "A click can add gbraid to the URL. Google’s measurement tools use it as a modeled or privacy-preserving join between the ad interaction and later app events, rather than a simple third-party cookie.",
    why: "After iOS tightened ad tracking, advertisers still needed some way to learn whether ads led to installs or in-app actions. gbraid is part of Google’s answer for those paths.",
    privacy: "It is still advertising measurement data tied to a click. Google describes these IDs as designed for more aggregated/modeled use than classic click IDs, but they remain ad-tech identifiers worth stripping from shared links.",
    funFacts: [
      "gbraid (app) and wbraid (web) often appear as a pair in modern Google Ads tagging docs.",
      "You may see gbraid without utm_* when auto-tagging is on.",
      "These parameters showed up widely after platform privacy changes around the early 2020s.",
      "Unlike utm_term, gbraid is not meant for humans to read in a report."
    ],
    exampleUrl: "https://apps.example.com/download?gbraid=0AAAAAexamplegbraidvalue",
    exampleNote: "gbraid marks an ad click Google may use when measuring web-to-app conversions on privacy-limited iOS paths.",
    safeToRemove: "Yes. Removing it does not block the download page; it only affects Google’s ability to attribute that click."
  },
  wbraid: {
    what: "wbraid is Google Ads’ companion to gbraid for web-to-web measurement in privacy-restricted contexts (notably certain iOS browser flows). It helps attribute site conversions after an ad click when classic identifiers are less reliable.",
    who: "Google Ads advertisers measuring website conversions from traffic that may not support traditional click-id cookies the way desktop Chrome once did.",
    how: "The landing URL may include wbraid after an ad click. Google tags read it and use it in conversion measurement pipelines designed for those constrained environments.",
    why: "Advertisers still need feedback loops when cookies and cross-site tracking are limited. wbraid keeps web conversion measurement working in a more restricted form.",
    privacy: "Like other click IDs, it is advertising telemetry about a specific interaction. It is not required to view a page, and sharing URLs that contain it can leak attribution context.",
    funFacts: [
      "The “w” hints at web-to-web, while gbraid’s “g” path is associated with app measurement naming.",
      "A single Google Ads click URL can carry gclid historically and braid-style IDs in newer setups.",
      "If analytics looks “empty” after stripping Ads params, that is often expected — the page still works.",
      "These IDs are a reminder that ad measurement adapted rather than disappeared after platform privacy changes."
    ],
    exampleUrl: "https://www.example.com/pricing?wbraid=0AAAAAexamplewbraidvalue",
    exampleNote: "wbraid identifies the ad click for Google’s web conversion measurement when older tracking paths are limited.",
    safeToRemove: "Yes. Pricing pages do not need wbraid to function; only ad attribution is affected."
  },
  fbclid: {
    what: "fbclid is Meta’s click identifier. When you tap a link from Facebook or Instagram ads (and some organic surfaces), Meta may append fbclid so advertisers can attribute the visit.",
    who: "Meta Ads advertisers, Facebook/Instagram traffic, and sites using Meta Pixel or Conversions API setups that read click IDs.",
    how: "You click; fbclid appears on the destination URL. The site or pixel can capture it and later send conversion events associated with that click back to Meta.",
    why: "Meta needs a way to connect “person clicked this ad” with “person bought the shoes,” especially as browsers reduce third-party cookie lifetime.",
    privacy: "fbclid is a strong ad-click correlator. It does not spell out your profile URL, but it helps Meta and advertisers join click and conversion events. Strip it before sharing links from your browser bar.",
    funFacts: [
      "People noticed fbclid flooding shared URLs so often that “remove fbclid” became a popular browser-extension niche.",
      "fbclid can appear on links that feel organic, not only on obviously labeled ads.",
      "Related Meta parameters like mibextid show up on some share flows too.",
      "Pasting a Facebook link into Slack with fbclid attached can attribute your coworker’s click to your session trail."
    ],
    exampleUrl: "https://www.example.com/blog/post?fbclid=IwAR4examplefbclidvalue",
    exampleNote: "fbclid marks that this visit originated from a Facebook/Instagram click Meta wants to attribute.",
    safeToRemove: "Yes. Articles and shops load fine without it; only Meta ad measurement loses the click join."
  },
  igshid: {
    what: "igshid is an Instagram share identifier added to many outbound links when people share content from Instagram. It helps Instagram attribute which share led to an off-platform visit.",
    who: "Instagram’s sharing flows and sites receiving traffic from Instagram posts, stories, or profile links that pass through Instagram’s redirect/share wrapping.",
    how: "When you share or open certain Instagram links, Instagram appends igshid. The destination sees it in the query string even if the publisher never asked for it.",
    why: "Social platforms measure how sharing drives external traffic. igshid is a lightweight way to mark “this click came via an Instagram share path.”",
    privacy: "It primarily identifies a share/click context, not your handle in plain text. Still, it is platform telemetry you usually do not need when bookmarking or forwarding a link.",
    funFacts: [
      "igshid is a classic example of a tracker users did not opt into adding when they just wanted the article URL.",
      "Cleaning Instagram links is one of the most satisfying before/after demos for URL cleaners.",
      "Some sites ignore igshid entirely; it only matters if something reads it.",
      "Share IDs like this are why two people can “copy the same link” and still get different query strings."
    ],
    exampleUrl: "https://www.example.com/recipe/pasta?igshid=YmMyMTA2M2Y=",
    exampleNote: "igshid tags the visit as coming through an Instagram share path.",
    safeToRemove: "Yes. The recipe page does not need igshid; removing it only drops Instagram’s share attribution."
  },
  msclkid: {
    what: "msclkid is Microsoft Advertising’s click identifier — the Bing Ads cousin of Google’s gclid. It marks a specific ad click so Microsoft can attribute conversions on the advertiser’s site.",
    who: "Microsoft Advertising (Bing Ads) advertisers and sites using UET (Universal Event Tracking) tags.",
    how: "A Bing/Microsoft ad click appends msclkid. The UET tag can store and send it with conversion goals such as purchases or lead forms.",
    why: "Search ads on Bing still need a feedback loop. msclkid is the join key between the click and the outcome Microsoft reports to advertisers.",
    privacy: "Opaque click ID used for ad measurement. Not personally descriptive alone, but clearly advertising telemetry tied to that click.",
    funFacts: [
      "Microsoft auto-tagging can add msclkid similarly to Google’s gclid auto-tagging.",
      "You will sometimes see msclkid and UTM parameters together on the same URL.",
      "Bing’s smaller share of search makes msclkid less famous than gclid — but just as removable.",
      "cvid is another Microsoft-related correlation parameter that can appear on Bing traffic."
    ],
    exampleUrl: "https://www.example.com/demo?msclkid=123abcMicrosoftClickExample",
    exampleNote: "msclkid identifies the Microsoft Advertising click for conversion matching.",
    safeToRemove: "Yes. Product and demo pages work without it; only Bing ad attribution is affected."
  },
  ttclid: {
    what: "ttclid is TikTok’s click identifier for ads. When someone taps a TikTok ad that opens a website, TikTok may append ttclid so the advertiser’s pixel can attribute the visit.",
    who: "TikTok Ads advertisers and sites running the TikTok Pixel or Events API.",
    how: "Ad click → landing URL gains ttclid → pixel or server event sends conversion data referencing that click ID.",
    why: "TikTok’s ad auction needs conversion signals to optimize delivery and to show advertisers what worked.",
    privacy: "Advertising click identifier. Useful to strip before sharing, especially since TikTok links often look “normal” aside from this token.",
    funFacts: [
      "ttclid follows the same “clid” naming pattern as gclid, fbclid, and twclid — a mini lingua franca of ad tech.",
      "In-app browsers can make TikTok click IDs appear even when you thought you opened Safari/Chrome.",
      "Creative-heavy platforms still rely on boring query parameters behind the scenes.",
      "If a “For You” ad sent you to a shop, ttclid is often the quiet passenger in the address bar."
    ],
    exampleUrl: "https://shop.example.com/viral-mug?ttclid=E_C_P_exampletiktokclick",
    exampleNote: "ttclid ties this store visit to a TikTok ad click for pixel attribution.",
    safeToRemove: "Yes. Checkout still works; TikTok simply may not credit that ad click."
  },
  twclid: {
    what: "twclid is the click identifier associated with X (Twitter) advertising / tracked outbound clicks. It helps attribute website visits back to activity on X.",
    who: "Advertisers on X Ads and sites measuring traffic from promoted posts or tracked X links.",
    how: "Clicking a tracked/promoted link can add twclid to the destination URL. Analytics or X’s measurement tools use it to connect the click and later site events.",
    why: "Social ads need conversion feedback just like search ads. twclid is the click-scoped token for that join.",
    privacy: "Click-level ad telemetry. Removing it from a URL you save or share is a simple privacy hygiene step with no effect on reading the page.",
    funFacts: [
      "The “tw” prefix survived the rebrand to X in countless tracking parameter names.",
      "t.co wrappers historically added another layer before you even saw twclid on the final URL.",
      "Social click IDs often outlive the marketing copy that created them when links get bookmarked.",
      "URL cleaners treat twclid like other *clid parameters: safe to drop for browsing."
    ],
    exampleUrl: "https://www.example.com/launch?twclid=2emaiexampleTwitterClick",
    exampleNote: "twclid marks an X/Twitter ad or tracked click for attribution.",
    safeToRemove: "Yes. The launch page loads normally without twclid."
  },
  epik: {
    what: "epik is Pinterest’s click identifier added to outbound advertised or tracked links. It lets Pinterest attribute traffic and conversions after someone taps a Pin that leads off-platform.",
    who: "Pinterest Ads advertisers and merchants using Pinterest tag measurement.",
    how: "A tracked Pin click can append epik. The Pinterest tag on the destination site may read it when reporting checkout or signup events.",
    why: "Pinterest sells discovery and intent; advertisers still want proof that Pins led to site actions. epik is the click glue.",
    privacy: "Ad-click identifier specific to that interaction. Fine to remove for personal browsing and sharing.",
    funFacts: [
      "Pinterest traffic often looks “researchy” (recipes, home projects), which makes leftover epik params easy to miss.",
      "Visual platforms still ship invisible query-string plumbing.",
      "epik sometimes appears alongside UTM tags from the advertiser’s own templates.",
      "Saving a Pin’s destination without cleaning it can keep attributing later revisits incorrectly in some setups."
    ],
    exampleUrl: "https://shop.example.com/lamp?epik=dj0examplepinterestclick",
    exampleNote: "epik identifies the Pinterest click that sent the shopper to this product.",
    safeToRemove: "Yes. Product pages do not require epik to display or sell items."
  },
  li_fat_id: {
    what: "li_fat_id is LinkedIn’s first-party ads tracking identifier. It helps LinkedIn Insight Tag / Ads measurement associate a click or visit with campaign performance using a first-party-style identifier.",
    who: "LinkedIn Ads advertisers, B2B marketers, and sites running the LinkedIn Insight Tag.",
    how: "LinkedIn ad or tracked traffic can surface li_fat_id on URLs or related first-party storage. The Insight Tag uses it when sending conversion signals.",
    why: "B2B sales cycles are long; LinkedIn needs durable-enough measurement to optimize for leads and demo requests, not just immediate purchases.",
    privacy: "Advertising measurement ID. Especially worth stripping on professional content links you forward to coworkers, so their clicks are not tied to your ad trail.",
    funFacts: [
      "The “fat” in li_fat_id is often expanded as first-party ad tracking in LinkedIn developer/ads discussions.",
      "LinkedIn parameters show up a lot on whitepapers, webinars, and SaaS pricing pages.",
      "B2B links shared in Slack frequently drag ad IDs along by accident.",
      "First-party naming reflects the industry shift away from relying only on third-party cookies."
    ],
    exampleUrl: "https://www.example.com/whitepaper?li_fat_id=a1b2c3examplelinkedin",
    exampleNote: "li_fat_id helps LinkedIn attribute this whitepaper download path to an ad engagement.",
    safeToRemove: "Yes. The whitepaper link should still resolve; only LinkedIn attribution is affected."
  },
  mc_eid: {
    what: "mc_eid is Mailchimp’s unique email identifier placed on tracked links inside campaigns. It points at the subscriber record Mailchimp associates with that click.",
    who: "Senders using Mailchimp (and similar Mandrill/Mailchimp tracking), plus anyone clicking links from those newsletters.",
    how: "Mailchimp rewrites links in the email so each subscriber gets a URL containing mc_eid (often with mc_cid for the campaign). Clicking tells Mailchimp who clicked what.",
    why: "Email marketers measure click rates per person and per campaign, trigger automations, and sync engagement back to audiences.",
    privacy: "This one is more personal than a generic UTM. mc_eid can identify which subscriber list member clicked. Prefer cleaned links before forwarding a newsletter URL to someone else.",
    funFacts: [
      "mc_cid (campaign) and mc_eid (email/subscriber) often travel as a pair.",
      "Forwarding a newsletter without cleaning can make your friend’s clicks look like yours in the sender’s stats.",
      "List-unsubscribe and preference centers are functional; mc_eid is measurement, not navigation.",
      "Many “why does this email link look so long?” moments are just ESP tracking wrappers."
    ],
    exampleUrl: "https://www.example.com/weekly-tips?mc_cid=a1b2c3&mc_eid=d4e5f6",
    exampleNote: "mc_eid identifies the subscriber; mc_cid identifies the campaign Mailchimp is measuring.",
    safeToRemove: "Generally yes for reading the article. Removing it stops Mailchimp from attributing the click to that subscriber; the destination content remains the same."
  },
  mc_cid: {
    what: "mc_cid is Mailchimp’s campaign identifier on tracked email links. It names which campaign’s link was clicked, usually alongside mc_eid for the subscriber.",
    who: "Mailchimp users sending tracked campaigns, and recipients who click through.",
    how: "Mailchimp’s link-tracking rewrite adds mc_cid before the email goes out. The click passes through Mailchimp’s metrics and onward to the destination with the parameter visible.",
    why: "Campaign-level reporting needs a stable campaign key. mc_cid is that key in the URL.",
    privacy: "Campaign ID alone is less sensitive than mc_eid, but together they identify “which email to which person.” Still safe to strip for sharing.",
    funFacts: [
      "If you only see mc_cid without mc_eid, you might be looking at a preview, a shared link, or a partially cleaned URL.",
      "ESPs popularized the habit of making every link in an email unique per recipient.",
      "Campaign IDs are why two “identical” newsletter buttons can have different query strings.",
      "Cleaning mc_cid rarely breaks the blog post; it only breaks the ESP’s click map completeness."
    ],
    exampleUrl: "https://news.example.com/update?mc_cid=9f8e7d6c5b",
    exampleNote: "mc_cid tells Mailchimp which campaign’s link generated the click.",
    safeToRemove: "Yes for consuming the content. The update page does not depend on Mailchimp’s campaign id."
  },
  mkt_tok: {
    what: "mkt_tok is Adobe Marketo’s email-click tracking token. Links in Marketo messages often carry this token so Marketo can attribute activity to a lead record.",
    who: "B2B teams on Adobe Marketo Engage, especially for nurture emails, webinars, and gated content.",
    how: "Marketo wraps or tags links with mkt_tok. When you click, Marketo records engagement against the lead and may personalize follow-up automation.",
    why: "Marketing automation platforms score leads based on clicks. mkt_tok is how a simple link click becomes a CRM-visible activity.",
    privacy: "More sensitive than anonymous UTMs because it connects to a lead/email identity inside Marketo. Clean before sharing externally.",
    funFacts: [
      "Marketo tokens in URLs are a common reason sales decks and PDFs get shared with tracking junk attached.",
      "mkt_tok can be long enough to look like a session credential — it is still a tracking token, not a page password.",
      "Offline forwards of Marketo links confuse attribution and nurture streams.",
      "Adobe’s marketing cloud has several URL tokens; mkt_tok is the one people notice in the wild most often."
    ],
    exampleUrl: "https://www.example.com/ebook?mkt_tok=eyJ0eXBlIjoiZXhhbXBsZSJ9",
    exampleNote: "mkt_tok associates this ebook click with a Marketo lead’s email engagement history.",
    safeToRemove: "Yes for downloading or reading publicly linked content. Do not confuse it with real access tokens required by a paywall — mkt_tok is for Marketo attribution."
  },
  _hsenc: {
    what: "_hsenc is HubSpot’s email-click tracking parameter. HubSpot rewrites links in marketing emails so clicks can be attributed to contacts and campaigns (_hsmi often appears nearby).",
    who: "Companies using HubSpot Marketing Hub, and anyone clicking links from those emails.",
    how: "You click a HubSpot-tracked email link; the URL includes _hsenc. HubSpot logs the click against the contact timeline, then sends you to the content.",
    why: "CRM-tied marketing wants every click on the contact record. _hsenc is part of that instrumentation.",
    privacy: "Tied to email-click tracking for a contact. Forwarding the raw link can mis-attribute opens/clicks; cleaning is polite and private.",
    funFacts: [
      "HubSpot parameters often start with _hs — a handy mental regex for “marketing automation debris.”",
      "_hsmi identifies the email/message while _hsenc handles encryption/tracking of the click context.",
      "Salespeople pasting HubSpot links into LinkedIn DMs accidentally bring CRM tracking along.",
      "HubSpot’s own docs treat these as tracking/analytics fields, not content routing fields."
    ],
    exampleUrl: "https://www.example.com/case-study?_hsenc=p2ANqtz-example&_hsmi=123456789",
    exampleNote: "_hsenc tracks the email click; _hsmi points at the HubSpot message id.",
    safeToRemove: "Yes for viewing the case study. Removing HubSpot params does not typically change authorization for public pages."
  },
  _ga: {
    what: "_ga appearing in a URL is usually Google Analytics cross-domain linker material — a way to pass client identity between related sites so a multi-domain journey looks like one session.",
    who: "Sites using Google Analytics with cross-domain measurement (checkout on another domain, regional sites, etc.).",
    how: "When configured, links from site A to site B include linker parameters such as _ga (and in GA4 often _gl). Site B’s tag reads them and continues the visitor identity.",
    why: "Without linking, a hop from store.example.com to checkout.example.net looks like a brand-new user. Linker params glue the trip together for analytics.",
    privacy: "This is explicitly about stitching identity across domains. It is useful for the site owner’s analytics and worth removing if you are copying a URL for yourself or others.",
    funFacts: [
      "The same _ga name is famous as a cookie; seeing it in the query string usually means linker decoration, not a random coincidence.",
      "GA4 leans on _gl for linker payloads, but _ga still appears in many setups and docs.",
      "Cross-domain linking is one of the easiest ways analytics “unique users” get inflated when misconfigured.",
      "If you land with a giant _ga/_gl blob in the address bar, cleaning it rarely changes the page."
    ],
    exampleUrl: "https://checkout.example.net/pay?_ga=2.123456789.987654321.1710000000-123456789.1710000000",
    exampleNote: "The _ga query value is trying to continue Analytics identity from another related domain.",
    safeToRemove: "Yes for personal use. Checkout should rely on its own session/cart cookies, not on you preserving analytics linker params."
  },
  _gl: {
    what: "_gl is Google Analytics 4’s cross-domain linker parameter. It carries a compact payload so GA4 can associate a visitor moving between linked domains.",
    who: "GA4 installations with cross-domain measurement enabled across multiple first-party hostnames.",
    how: "Outbound links between linked domains get a _gl query param. The receiving page’s gtag/GA4 config decodes it to keep session continuity.",
    why: "Modern sites often split content, auth, and checkout across hostnames. _gl exists so reports do not shatter at each hop.",
    privacy: "Identity-stitching for analytics. Harmless to page function when removed; helpful to strip when sharing URLs from a checkout flow.",
    funFacts: [
      "_gl payloads look like gibberish by design — they are encoded linker data, not a product SKU.",
      "If _gl survives into public social shares, strangers may inherit bits of someone else’s analytics context.",
      "GA4 linker decoration can be easy to miss because the rest of the URL looks normal.",
      "URL Cleaner treats _gl as tracking, not as a functional checkout field."
    ],
    exampleUrl: "https://www.example.com/welcome?_gl=1_encoded_linker_payload_example",
    exampleNote: "_gl carries GA4 cross-domain linker information from the previous hostname in the journey.",
    safeToRemove: "Yes. Site navigation and login should not require you to keep _gl in the address bar."
  },
  cjevent: {
    what: "cjevent is CJ Affiliate’s (Commission Junction) click event identifier. Publisher links in the CJ network use it so a later purchase can pay the right partner a commission.",
    who: "Affiliate publishers, CJ advertisers (brands), and coupon/deal sites that deep-link through CJ.",
    how: "You click an affiliate link; CJ records an event id (cjevent) and sends you to the merchant with that id present. If you buy within the cookie/attribution window, CJ matches the order to the event.",
    why: "Affiliate marketing is literally “pay for attributed results.” Without a click event id, networks cannot settle commissions fairly.",
    privacy: "Click-event tracking for commission — commercial telemetry. It can also mark that you arrived via a deal site or publisher.",
    funFacts: [
      "Affiliate params are why two “identical” product URLs differ after visiting a coupons site.",
      "cjevent often appears with other CJ parameters like mkcid or mkevt depending on the link format.",
      "Clearing affiliate IDs can change who gets credit — which is sometimes the point of cleaning, and sometimes why publishers dislike cleaners.",
      "Affiliate IDs are tracking, but they are also the plumbing of an entire business model."
    ],
    exampleUrl: "https://www.shop.example/product/123?cjevent=0a1b2c3d4e5f",
    exampleNote: "cjevent identifies the CJ affiliate click event that may earn a publisher commission on purchase.",
    safeToRemove: "Yes for viewing the product. Removing it typically does not change price or stock; it may prevent affiliate commission attribution."
  },
  irclickid: {
    what: "irclickid is Impact’s (Impact Radius) affiliate click identifier — the token that ties a publisher click to a later conversion for payout.",
    who: "Brands and publishers on the Impact partnership platform, including many creator and affiliate programs.",
    how: "A tracked partnership link adds irclickid. Impact’s attribution matches downstream orders or leads to that click when rules say so.",
    why: "Creators and affiliates need trustworthy credit. irclickid is Impact’s click-level receipt.",
    privacy: "Commercial click tracking. Reveals you came through a partner link; safe to remove for personal browsing if you do not care about commission credit.",
    funFacts: [
      "Impact powers many “creator codes” behind the scenes even when the URL still looks like the brand’s site.",
      "irclickid is a cousin spirit to cjevent and other network click ids — different networks, same idea.",
      "Partnership platforms rebrand more often than their query parameters do.",
      "If a YouTuber’s link feels unusually long, an affiliate click id is a prime suspect."
    ],
    exampleUrl: "https://www.brand.example/offer?irclickid=AbCdEfImpactClickExample",
    exampleNote: "irclickid is the Impact click token used for partner attribution.",
    safeToRemove: "Yes for accessing the offer page. Commission attribution may be lost; page functionality generally is not."
  },
  srsltid: {
    what: "srsltid is a Google Shopping identifier seen on organic Shopping / free listings style traffic. It helps Google correlate those listing clicks with landing-page visits.",
    who: "Merchants appearing in Google Shopping experiences and sites receiving that referral traffic.",
    how: "Clicking certain Google Shopping results lands on a merchant URL that includes srsltid. Google can use it for measurement of those surfaces.",
    why: "Shopping results are a distinct acquisition channel. Google and merchants want analytics that separate them from plain web search.",
    privacy: "Listing/click measurement from Google Shopping surfaces — not needed for browsing the product page you already chose.",
    funFacts: [
      "People often discover srsltid only after wondering why a “normal” Google product click produced a weird query param.",
      "It is a good example of a lesser-known tracker that still shows up daily in cleaner logs.",
      "Shopping links can accumulate Google params even when no classic UTM was used.",
      "Merchants may never mention srsltid in their own docs, yet it still appears on inbound URLs."
    ],
    exampleUrl: "https://www.merchant.example/item/sku-42?srsltid=AfmBOopexampleShoppingId",
    exampleNote: "srsltid marks traffic associated with a Google Shopping listing click.",
    safeToRemove: "Yes. SKU pages should load from path alone; srsltid is measurement overhead."
  },
  pk_campaign: {
    what: "pk_campaign is Matomo’s campaign name parameter (Matomo was formerly Piwik). It plays a role similar to utm_campaign for sites that prefer Matomo’s naming.",
    who: "Teams running Matomo analytics, including privacy-conscious organizations that self-host Matomo instead of using Google Analytics.",
    how: "Marketers tag links with pk_campaign (and often pk_source, pk_medium, etc.). Matomo reads those query params and files the visit under that campaign.",
    why: "Same need as UTMs: channel reporting. Matomo kept its own prefixes so setups are explicit and not dependent on Google’s vocabulary.",
    privacy: "Campaign labeling for analytics. Usually non-personal labels, though the visit is still being categorized for measurement.",
    funFacts: [
      "Matomo also accepts mtm_ and legacy piwik_ prefixes for campaign parameters.",
      "Some orgs dual-tag links with both utm_* and pk_* during migrations between tools.",
      "Self-hosted analytics still uses URL tags — privacy-friendly tooling is not the same as “no measurement.”",
      "pk_ is a handy fingerprint that a site is speaking Matomo’s dialect."
    ],
    exampleUrl: "https://www.example.org/donate?pk_campaign=spring_drive&pk_source=newsletter",
    exampleNote: "pk_campaign=spring_drive names the Matomo campaign for this donation drive link.",
    safeToRemove: "Yes. Donations and content pages do not need Matomo campaign tags to function."
  },
  si: {
    what: "si on YouTube URLs is a share identifier used to attribute shared video links. YouTube can tell that a visit came from a particular share path rather than an unscoped generic link.",
    who: "YouTube’s share flows; creators and viewers who use the Share button and copy a link.",
    how: "Copying a share link from YouTube often adds si. Opening that link lets YouTube attribute the share; the video id itself remains in v= or the youtu.be path.",
    why: "Platforms measure how sharing drives views. si is YouTube’s marker for that attribution on shared URLs.",
    privacy: "Share attribution telemetry. Note that parameters like v (video id) or t (timestamp) are functional — si is the tracking extra URL Cleaner targets on YouTube hosts.",
    funFacts: [
      "This is a great example of distinguishing trackers from functional params: v= keeps the video, si= does not.",
      "youtu.be short links can carry si just like full youtube.com URLs.",
      "Creators sometimes paste si-tagged links into descriptions without realizing it.",
      "Cleaning YouTube links is one of the clearest demos of “same video, less telemetry.”"
    ],
    exampleUrl: "https://www.youtube.com/watch?v=dQw4w9wgxcq&si=AbCdEfShareExample",
    exampleNote: "v= selects the video (keep); si= attributes the share (safe to remove).",
    safeToRemove: "Yes — and you should keep v, t, list, and other playback parameters. Removing si does not change which video plays."
  },
  dclid: {
    what: "dclid is a Google click identifier associated with Display / Campaign Manager style measurement — a display-ads relative of gclid used in Google’s ad serving ecosystem.",
    who: "Advertisers running Google Display / Campaign Manager 360 style campaigns and sites tagged for those conversion paths.",
    how: "A display ad click can land with dclid on the URL. Google measurement tags use it to attribute view/click paths back to campaigns.",
    why: "Display campaigns need attribution across creatives and placements. dclid provides a click id suited to that part of Google’s stack.",
    privacy: "Ad-click measurement identifier. Opaque to humans, useful to strip from shared URLs.",
    funFacts: [
      "The leading “d” is the mnemonic people use for “display” when contrasting dclid with gclid.",
      "Large ad-tech stacks accumulate multiple click-id dialects over years of product renames.",
      "You may never see dclid on simple Search campaigns — it shows up more with display/CM paths.",
      "If your URL looks like alphabet soup (*clid), it is usually ad measurement, not page routing."
    ],
    exampleUrl: "https://www.example.com/landing?dclid=CJosexampleDisplayClick",
    exampleNote: "dclid attributes a Google display / Campaign Manager click to this landing page visit.",
    safeToRemove: "Yes. Landing-page content should not depend on dclid."
  },
  oly_enc_id: {
    what: "oly_enc_id is an Omeda (Olytics) encrypted identity parameter commonly seen on publisher and media email links. It helps the ESP/CDP recognize the reader who clicked.",
    who: "Publishers and brands using Omeda/Olytics for email and audience management — frequent in media newsletters.",
    how: "Tracked email links include oly_enc_id (sometimes with oly_anon_id). Clicking maps the event to an encrypted audience identifier in Omeda’s systems.",
    why: "Media companies personalize newsletters and measure engagement per subscriber. Encrypted ids let them attribute clicks without putting raw email addresses in the URL.",
    privacy: "More identity-adjacent than a campaign name. It is encoded, not plaintext email, but it still targets a subscriber record — clean before sharing newsletter links.",
    funFacts: [
      "Encrypted ids in URLs are a compromise: better than plain emails, still not something you should forward casually.",
      "News sites’ “view in browser” links are notorious for carrying ESP identity params.",
      "oly_anon_id may appear when the system tracks a less fully identified reader.",
      "If a magazine link looks unusually parameterized, Omeda-style tags are a common culprit."
    ],
    exampleUrl: "https://www.magazine.example/daily?oly_enc_id=ABCDEF123456",
    exampleNote: "oly_enc_id associates the click with an Omeda audience identity record.",
    safeToRemove: "Yes for reading public articles. Removing it drops subscriber click attribution for the publisher’s ESP."
  },
  ck_subscriber_id: {
    what: "ck_subscriber_id is Kit’s (formerly ConvertKit) subscriber identifier on email links. It tells Kit which subscriber clicked through from a broadcast or sequence.",
    who: "Creators and companies emailing with Kit/ConvertKit — newsletters, creator courses, and product launches.",
    how: "Kit rewrites links to include ck_subscriber_id. Clicks update subscriber engagement and can drive automations (tags, follow-up sequences).",
    why: "Creator email tools personalize journeys based on clicks. The subscriber id is how “clicked the pricing link” becomes an automation trigger.",
    privacy: "Identifies a subscriber in Kit. Forwarding your personal email link can make someone else’s clicks land on your subscriber timeline — clean links before sharing.",
    funFacts: [
      "ConvertKit’s rebrand to Kit left many ck_ parameter names unchanged.",
      "Creator newsletters are a top source of accidentally shared subscriber ids.",
      "Automation rules mean a single leftover tracking param can still trigger vendor-side logic if clicked.",
      "Public landing pages almost never need the subscriber id to render."
    ],
    exampleUrl: "https://www.creator.example/issue/88?ck_subscriber_id=987654321",
    exampleNote: "ck_subscriber_id maps this click to a specific Kit subscriber for engagement tracking.",
    safeToRemove: "Yes for reading the issue. Automations and click stats on the sender side will not see a cleaned visit as that subscriber’s click."
  },
  ymclid: {
    what: "ymclid is a Yandex Metrica click identifier — part of Yandex’s analytics/ads measurement ecosystem, more commonly seen on traffic related to Yandex properties and Russian-language marketing stacks.",
    who: "Advertisers and sites using Yandex Ads / Yandex Metrica measurement.",
    how: "A tracked click can append ymclid. Metrica/ads tooling uses it to attribute site activity to that click.",
    why: "Same attribution need as gclid/msclkid, in Yandex’s ecosystem: connect ad interaction to on-site outcomes.",
    privacy: "Advertising/analytics click id. Safe to remove for general browsing; useful educationally because not everyone expects non-Google click ids.",
    funFacts: [
      "Yandex parameters (yclid, ymclid, ysclid) are a reminder that tracking dialects are regional as well as corporate.",
      "Seeing ymclid on a URL is a strong hint about which ad/analytics ecosystem touched the link.",
      "Global sites sometimes collect unfamiliar *clid variants from international campaigns.",
      "URL cleaners that only know Google/Meta miss an entire family of trackers — diversity matters."
    ],
    exampleUrl: "https://www.example.com/promo?ymclid=12345678901234567890",
    exampleNote: "ymclid attributes the visit for Yandex Metrica / ads measurement.",
    safeToRemove: "Yes. Promotional pages should not require ymclid to display."
  }
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
