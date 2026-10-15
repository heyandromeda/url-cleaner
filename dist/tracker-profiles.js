/**
 * Curated Tracker of the Day profiles.
 * Facts are limited to claims supported by the listed sources.
 * Prefer Wikipedia and vendor documentation over secondary blogs.
 */

export const TRACKER_PROFILES = {
  utm_source: {
    what: "utm_source is one of the classic Urchin Tracking Module (UTM) campaign parameters. It names which site, publication, or tool sent the traffic — for example google, newsletter, or a partner domain.",
    who: "Marketers and analysts using Google Analytics and many other analytics tools. Google’s own Campaign URL Builder and similar spreadsheet or SaaS builders are commonly used to attach it.",
    how: "Someone adds utm_source (usually with other utm_* fields) to a link. When the destination’s analytics software sees those query parameters, it attributes the browser session — and often later sessions until the campaign attribution window expires — to that campaign.",
    why: "Without a source tag, many visits collapse into vague buckets such as direct or (not set). utm_source is how teams compare channels in acquisition reports.",
    privacy: "Values are usually short marketing labels, not personal IDs. Combined with cookies and other campaign tags, they still help a site measure how you arrived and which promotion you were part of.",
    funFacts: [
      "UTM stands for Urchin Tracking Module — the parameters come from Google Analytics’ predecessor, Urchin.",
      "Wikipedia notes that Google Analytics supports UTM parameters out of the box because of that Urchin lineage.",
      "Google’s documentation treats utm_source as identifying the referrer (for example google, newsletter4, or billboard).",
      "Analytics tools may keep attributing later sessions to the campaign until an attribution window expires (Wikipedia cites a default of six months in Google Analytics)."
    ],
    exampleUrl: "https://shop.example.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=march25",
    exampleNote: "Here utm_source=newsletter tells analytics the click came from an email list, while medium and campaign narrow the campaign further.",
    safeToRemove: "Yes for browsing and sharing. Removing it does not change the destination page; it only stops that visit from being attributed to that campaign in analytics.",
    sources: [
      { title: "UTM parameters — Wikipedia", url: "https://en.wikipedia.org/wiki/UTM_parameters" },
      { title: "Collect campaign data with custom URLs — Google Analytics Help", url: "https://support.google.com/analytics/answer/10917952" },
      { title: "Urchin (software) — Wikipedia", url: "https://en.wikipedia.org/wiki/Urchin_(software)" }
    ]
  },

  utm_medium: {
    what: "utm_medium identifies what type of link was used — for example email, organic social, or pay-per-click (cpc/ppc). It answers “what kind of channel?” rather than “which brand or newsletter?”",
    who: "Anyone building campaign URLs for Google Analytics-compatible reporting, including email platforms and ad managers that auto-append UTM tags.",
    how: "Marketers set utm_medium when constructing a tracked URL. Destination analytics parses it with the other UTM fields and stores it on the session for channel reports.",
    why: "Source alone is not enough to compare tactics. Medium lets teams separate email from CPC from social even when the source name overlaps.",
    privacy: "Like other UTMs, it is a marketing label. It reveals campaign mechanics (for example that you clicked a paid link) more than personal identity.",
    funFacts: [
      "Wikipedia’s UTM table lists utm_medium examples such as email or pay-per-click advertising.",
      "Google Analytics Help examples include cpc, banner, and email as medium values.",
      "There are five classic UTM parameters; medium is one of the three Google strongly recommends always setting with source and campaign.",
      "Because values are free text, teams often standardize a controlled vocabulary so “email” and “e-mail” do not split reports."
    ],
    exampleUrl: "https://www.example.com/pricing?utm_source=google&utm_medium=cpc&utm_campaign=brand",
    exampleNote: "utm_medium=cpc marks this as paid-search style traffic in campaign reports.",
    safeToRemove: "Yes. Pricing and content pages do not need utm_medium to function.",
    sources: [
      { title: "UTM parameters — Wikipedia", url: "https://en.wikipedia.org/wiki/UTM_parameters" },
      { title: "Collect campaign data with custom URLs — Google Analytics Help", url: "https://support.google.com/analytics/answer/10917952" }
    ]
  },

  utm_campaign: {
    what: "utm_campaign names the promotion or strategic campaign behind a link — a product launch, spring sale, or webinar push. It is the “which campaign?” label that ties creatives together.",
    who: "Marketing teams using Google Analytics, Adobe Analytics, and other tools that ingest UTM campaign values.",
    how: "Every creative in the same push shares one campaign value. Analytics reads it from the landing URL and files the session under that campaign name.",
    why: "Budgets and reports are organized by campaign. A stable campaign name lets email, paid social, and display roll up together.",
    privacy: "Campaign names are marketing metadata. They are usually not personal, though they can reveal which offer or audience segment a link targeted.",
    funFacts: [
      "Wikipedia describes utm_campaign as identifying a specific product promotion or strategic campaign.",
      "Google’s examples include values like spring_sale or a product slogan / promo code.",
      "UTM parameters can be used in any order in the query string.",
      "Google Analytics also documents utm_id as a campaign ID that can sit alongside the human-readable campaign name."
    ],
    exampleUrl: "https://events.example.com/register?utm_source=linkedin&utm_medium=social&utm_campaign=webinar_april",
    exampleNote: "utm_campaign=webinar_april groups this social post with other links from the same webinar push.",
    safeToRemove: "Yes. Registration still works; the visit simply will not be bucketed under that campaign name.",
    sources: [
      { title: "UTM parameters — Wikipedia", url: "https://en.wikipedia.org/wiki/UTM_parameters" },
      { title: "Collect campaign data with custom URLs — Google Analytics Help", url: "https://support.google.com/analytics/answer/10917952" }
    ]
  },

  utm_term: {
    what: "utm_term identifies search terms. Marketers commonly use it for paid-search keywords so reports can show which query or keyword theme led to a visit.",
    who: "Paid-search teams and tools that generate Google Analytics-compatible campaign URLs for search ads.",
    how: "An ad or tracking template can fill utm_term with a keyword or search-term value. Analytics stores that value with the session after the click.",
    why: "Search campaigns are judged on keyword performance. utm_term makes keyword context visible inside analytics without opening the ad platform for every question.",
    privacy: "It can reveal the search theme that led you to the page. It is not a personal identifier by itself, but it is a clue about intent in that moment.",
    funFacts: [
      "Wikipedia’s UTM table defines utm_term as identifying search terms, with an example like running+shoes.",
      "utm_term is optional for many non-search campaigns that have no keyword to record.",
      "Google Ads auto-tagging with gclid can provide richer Ads↔Analytics linking than manual UTMs alone.",
      "Unlike opaque click IDs, utm_term is meant to be human-readable in reports and spreadsheets."
    ],
    exampleUrl: "https://store.example.com/hiking-boots?utm_source=google&utm_medium=cpc&utm_term=waterproof%20trail%20shoes",
    exampleNote: "utm_term records the paid-search keyword or search-term label associated with the click.",
    safeToRemove: "Yes. The product page still loads; only keyword attribution in analytics is affected.",
    sources: [
      { title: "UTM parameters — Wikipedia", url: "https://en.wikipedia.org/wiki/UTM_parameters" },
      { title: "Collect campaign data with custom URLs — Google Analytics Help", url: "https://support.google.com/analytics/answer/10917952" },
      { title: "About auto-tagging — Google Ads Help", url: "https://support.google.com/google-ads/answer/3095550" }
    ]
  },

  utm_content: {
    what: "utm_content identifies what specifically was clicked — for example a banner versus a text link. It is often used for A/B tests and content-targeted ads.",
    who: "Marketers comparing creatives inside the same campaign in Google Analytics-compatible tooling.",
    how: "Different creatives in one campaign get different utm_content values. Analytics attributes the session to the creative that was clicked.",
    why: "Source/medium/campaign alone cannot tell which headline or image won. utm_content separates those variants.",
    privacy: "A creative label, not a personal ID. It mainly reveals which ad variant you interacted with.",
    funFacts: [
      "Wikipedia notes utm_content is often used for A/B testing and content-targeted ads.",
      "Example values in Wikipedia include logolink versus textlink.",
      "It is one of the five original UTM parameters from the Urchin lineage.",
      "Teams sometimes overload utm_content with placement details when they lack a separate placement parameter."
    ],
    exampleUrl: "https://www.example.com/landing?utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_content=header_button",
    exampleNote: "utm_content=header_button distinguishes this email CTA from other links in the same campaign.",
    safeToRemove: "Yes. The landing page does not need utm_content to render.",
    sources: [
      { title: "UTM parameters — Wikipedia", url: "https://en.wikipedia.org/wiki/UTM_parameters" },
      { title: "Collect campaign data with custom URLs — Google Analytics Help", url: "https://support.google.com/analytics/answer/10917952" }
    ]
  },

  gclid: {
    what: "GCLID (Google Click Identifier) is a URL parameter Google Ads passes with ad clicks. It identifies the campaign and other attributes of that click for ad tracking and campaign attribution.",
    who: "Google Ads advertisers with auto-tagging enabled, and sites linking Google Ads data with Google Analytics or offline conversion imports.",
    how: "With auto-tagging on, Google appends gclid to the landing URL after an ad click. Tags or your own code can store it and send it back with conversion events.",
    why: "It is required for Google Ads website conversion tracking workflows that rely on click IDs, and it helps join Ads and Analytics data.",
    privacy: "It is an opaque click identifier for advertising measurement, not your name — but it is specific enough to join that click to later conversion events.",
    funFacts: [
      "Google’s auto-tagging docs show a simple example form like www.example.com/?gclid=123xyz.",
      "Google notes that sometimes a GCLID is created at impression time; repeated clicks on the same ad by the same user can reuse the same GCLID in reporting.",
      "If your site redirects, Google advises preserving gclid through to the final landing page or conversions can be lost.",
      "GCLID can also be captured for offline conversion imports, where leads are later uploaded back to Google Ads."
    ],
    exampleUrl: "https://www.example.com/offer?gclid=EAIaIQobChMIexampleclickid",
    exampleNote: "The gclid value identifies this Google Ads click so conversion tags or imports can attribute outcomes.",
    safeToRemove: "Yes for normal browsing. Page content does not depend on gclid; only ad conversion attribution does.",
    sources: [
      { title: "Google Click Identifier (GCLID): Definition — Google Ads Help", url: "https://support.google.com/google-ads/answer/9744275" },
      { title: "About auto-tagging — Google Ads Help", url: "https://support.google.com/google-ads/answer/3095550" },
      { title: "How Google Ads tracks website conversions — Google Ads Help", url: "https://support.google.com/google-ads/answer/7521212" }
    ]
  },

  gbraid: {
    what: "gbraid is a Google Ads URL parameter described by Google as a privacy-preserving identifier used to measure ad performance. Google states it measures conversions in a non-unique fashion (like a campaign ID) without linking them to individual users or events.",
    who: "Google Ads advertisers measuring app-related conversions, especially in privacy-restricted mobile environments where classic identifiers are limited.",
    how: "A click URL can include gbraid. Google’s Ads API documents gbraid as the URL parameter for clicks associated with app conversions (alongside gclid generally and wbraid for web).",
    why: "After platform privacy changes, advertisers still need measurement signals. gbraid is Google’s documented privacy-preserving click URL parameter for those app conversion paths.",
    privacy: "Google explicitly describes GBRAID as non-unique measurement rather than a per-user id. It is still advertising telemetry and worth stripping from shared links.",
    funFacts: [
      "Google Ads Help warns that GBRAID is case-sensitive and should not be lowercased or uppercased.",
      "Google’s ClickConversion API fields distinguish gbraid (app conversions) from wbraid (web conversions) and gclid.",
      "Google’s privacy-compliant app attribution guide discusses using gbraid for iOS 14.5+ users who have not opted in to app tracking.",
      "Offline conversion upload docs also describe appending GBRAID when available, even alongside other fields."
    ],
    exampleUrl: "https://apps.example.com/download?gbraid=0AAAAAexamplegbraidvalue",
    exampleNote: "gbraid is the privacy-preserving Google Ads parameter associated with app conversion measurement on the click URL.",
    safeToRemove: "Yes. Removing it does not block the page; it only affects Google’s ability to use that signal for attribution.",
    sources: [
      { title: "GBRAID URL parameter — Google Ads Help", url: "https://support.google.com/google-ads/answer/16297842" },
      { title: "ClickConversion — Google Ads API", url: "https://developers.google.com/google-ads/api/reference/rpc/v22/ClickConversion" },
      { title: "Privacy Compliant App Attribution — Google Developers", url: "https://developers.google.com/app-conversion-tracking/api/privacy-compliant-guide" }
    ]
  },

  wbraid: {
    what: "wbraid is the Google Ads URL parameter for clicks associated with web conversions in the same privacy-preserving click-id family as gbraid. Google’s Ads API lists it beside gclid and gbraid on conversion objects.",
    who: "Google Ads advertisers measuring website conversions when those privacy-preserving web click parameters are present.",
    how: "An ad click can land with wbraid on the URL. Measurement systems that accept wbraid can include it when reporting web conversions.",
    why: "It provides a web-conversion counterpart to gbraid so advertisers can keep measuring in environments where older identifiers are less available.",
    privacy: "Like gbraid, it is advertising measurement metadata on a click URL. It is not required to view a page.",
    funFacts: [
      "Google’s ClickConversion reference describes wbraid as the URL parameter for clicks associated with web conversions.",
      "The same API entry lists gbraid for app conversions and gclid for general Google click IDs — three related but distinct fields.",
      "Case sensitivity warnings that apply to GBRAID-style identifiers make blind URL lowercasing risky for measurement.",
      "Seeing wbraid without hand-built UTMs is a hint that Google Ads tagging — not a marketer’s spreadsheet — decorated the URL."
    ],
    exampleUrl: "https://www.example.com/pricing?wbraid=0AAAAAexamplewbraidvalue",
    exampleNote: "wbraid identifies the ad click for Google’s web conversion measurement field on the click URL.",
    safeToRemove: "Yes. Pricing pages do not need wbraid to function; only ad attribution is affected.",
    sources: [
      { title: "ClickConversion — Google Ads API", url: "https://developers.google.com/google-ads/api/reference/rpc/v22/ClickConversion" },
      { title: "GBRAID URL parameter — Google Ads Help", url: "https://support.google.com/google-ads/answer/16297842" }
    ]
  },

  fbclid: {
    what: "fbclid is Meta’s Facebook click identifier that can appear on destination URLs after Facebook/Instagram clicks. Meta’s Conversions API docs describe building an fbc value from the fbclid when the _fbc cookie is unavailable.",
    who: "Meta Ads advertisers and sites sending events through the Meta Pixel or Conversions API.",
    how: "A click may append fbclid to the landing URL. Meta documents constructing fbc as fb.1.<timestamp_ms>.<fbclid> for event matching when needed.",
    why: "Advertisers need to match offsite conversions back to Meta ad clicks as browsers reduce long-lived third-party cookies.",
    privacy: "fbclid is a click correlator used in advertising measurement. Strip it before sharing a URL copied from your address bar.",
    funFacts: [
      "Meta’s Conversions API parameter docs describe fbc as version, subdomain index, millisecond timestamp, and fbclid joined by dots.",
      "If the Pixel set an _fbc cookie, that cookie value is preferred over hand-building fbc from the URL.",
      "Because fbclid rides along in the query string, pasted links in chat apps often carry Meta click context by accident.",
      "URL cleaners treat fbclid as safe to drop for reading the destination page."
    ],
    exampleUrl: "https://www.example.com/blog/post?fbclid=IwAR4examplefbclidvalue",
    exampleNote: "fbclid marks a Meta click so Pixel/CAPI workflows can form an fbc match key.",
    safeToRemove: "Yes. Articles and shops load fine without it; only Meta ad measurement loses the click join.",
    sources: [
      { title: "fbp and fbc Parameters — Meta for Developers", url: "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc" }
    ]
  },

  msclkid: {
    what: "msclkid is the Microsoft Click ID. Microsoft Advertising auto-tagging appends it to landing-page URLs so Universal Event Tracking (UET) can attribute conversions.",
    who: "Microsoft Advertising (Bing Ads) advertisers using UET tags on their sites.",
    how: "After an ad click, msclkid appears on the landing URL. UET is expected to store it (commonly in a first-party _uetmsclkid cookie) and send it with pageLoad and custom events.",
    why: "Auto-tagging exists so conversions are not lost when Microsoft’s own cookies cannot be returned because of browser restrictions.",
    privacy: "Opaque advertising click ID used for conversion attribution. Fine to remove for personal browsing and sharing.",
    funFacts: [
      "Microsoft documents msclkid as a GUID-like value, sometimes with a suffix such as -0 or -1 depending on whether it is new for the session.",
      "Suggested first-party cookie name in Microsoft’s docs is _uetmsclkid, with a 90-day expiration example.",
      "Auto-tagging of MSCLKID is enabled by default in Microsoft Advertising account options.",
      "Microsoft warns that redirects must preserve msclkid as a top-level query parameter where UET loads."
    ],
    exampleUrl: "https://www.example.com/demo?msclkid=cdd4afcccb1c9a4cad9544dd7e5006d5",
    exampleNote: "msclkid identifies the Microsoft Advertising click for UET conversion attribution.",
    safeToRemove: "Yes. Product and demo pages work without it; only Bing/Microsoft ad attribution is affected.",
    sources: [
      { title: "Auto-tagging of Microsoft Click ID — Microsoft Learn", url: "https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_proc_microsoftclickid" },
      { title: "UET parameters table — Microsoft Learn", url: "https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_parameters_table" }
    ]
  },

  ttclid: {
    what: "ttclid is the TikTok Click ID — a tracking parameter TikTok appends to a landing-page URL when someone clicks a TikTok ad. TikTok uses it to improve ad attribution and performance by associating the Click ID with a campaign.",
    who: "TikTok Ads advertisers and sites using TikTok Pixel and/or the Events API.",
    how: "TikTok appends ttclid on the ad landing URL. The Pixel can store it in a first-party ttclid cookie; advertisers should send it with website events for matching.",
    why: "Matched events that include Click IDs help TikTok with attribution, audience building, ad delivery optimization, and measurement.",
    privacy: "Advertising click identifier. TikTok’s cookie table lists ttclid as an advertising cookie used to measure and improve campaigns and personalize experiences on TikTok.",
    funFacts: [
      "TikTok’s docs show an example landing URL ending in ttclid=E.C.P.… before recommending you hold the value for the whole session.",
      "If the TikTok Pixel is installed, it can parse ttclid from the URL and store a first-party cookie also named ttclid.",
      "TikTok says Click ID auto-attachment does not replace your own custom tracking parameters.",
      "TikTok documents that each Click ID is unique and follows the CTA window configured in Attribution Manager."
    ],
    exampleUrl: "https://shop.example.com/viral-mug?ttclid=E.C.P.v3fQ2RHacdksKfofPmlyuStIIHJ4Af1tKYxF9zz2c2PLx1Oaw15oHpcfl5AH",
    exampleNote: "ttclid ties this store visit to a TikTok ad click for Pixel/Events API matching.",
    safeToRemove: "Yes. Checkout still works; TikTok simply may not credit that ad click.",
    sources: [
      { title: "About TikTok Click ID — TikTok Ads Manager Help", url: "https://ads.tiktok.com/help/article/tiktok-click-id" },
      { title: "Send TikTok Click ID — TikTok API for Business", url: "https://business-api.tiktok.com/portal/docs/send-tiktok-click-id-ttclid/v1.3" },
      { title: "Use Cookies with TikTok Pixel — TikTok For Business", url: "https://ads.tiktok.com/help/article/using-cookies-with-tiktok-pixel" }
    ]
  },

  twclid: {
    what: "twclid is X’s Click ID query parameter. X’s ads measurement docs recommend parsing twclid from the destination URL after a user navigates from an ad and including it when sending web conversions.",
    who: "Advertisers using X Ads web conversion measurement / Conversion API workflows.",
    how: "After an ad click, twclid may appear on the landing URL. Advertisers parse and store it, then send it as an identifier on conversion events.",
    why: "X needs at least one identifier to match conversions; Click ID (twclid) is the recommended identifier when available.",
    privacy: "Advertising click identifier used to match a conversion to an ad click. Safe to strip for ordinary browsing.",
    funFacts: [
      "X’s measurement docs say it is recommended to always include Click ID in the conversion request when available.",
      "twclid alone can be sufficient as an identifier in a conversion payload.",
      "If you send IP address or user agent, X’s docs require a second identifier for proper matching.",
      "The parameter name kept the historical “tw” prefix even after the product rebrand to X."
    ],
    exampleUrl: "https://www.example.com/launch?twclid=23opevjt88psuo13lu8d020qkn",
    exampleNote: "twclid is the X Click ID parsed from the landing URL for conversion matching.",
    safeToRemove: "Yes. The launch page loads normally without twclid.",
    sources: [
      { title: "Web conversions — X Ads API measurement docs", url: "https://docs.x.com/x-ads-api/measurement/web-conversions" }
    ]
  },

  epik: {
    what: "When someone clicks a Pinterest ad, Pinterest adds matching information to the destination URL. The Pinterest tag caches that information in a cookie named _epik.",
    who: "Pinterest Ads advertisers and sites running the Pinterest tag.",
    how: "Ad traffic arrives with URL-borne match data (commonly seen as epik). The tag stores it in _epik for later event matching on the advertiser’s site.",
    why: "Pinterest needs to match on-site conversions back to Pin ad clicks for reporting and optimization.",
    privacy: "Ad-click matching data. Useful to remove from shared URLs; the product page does not need it to display.",
    funFacts: [
      "Pinterest’s tag parameter docs say _epik is set when a person visits a page from a Pinterest ad.",
      "A related cookie, _derived_epik, is used when a match is identified without cookies, such as through Enhanced Match.",
      "Enhanced Match can send hashed emails so Pinterest can match events when cookies are missing.",
      "Pinterest describes _pin_unauth as a UUID used to group actions when it cannot match the user."
    ],
    exampleUrl: "https://shop.example.com/lamp?epik=dj0examplepinterestclick",
    exampleNote: "URL-borne epik-style match data helps the Pinterest tag populate _epik after an ad click.",
    safeToRemove: "Yes. Product pages do not require epik to display or sell items.",
    sources: [
      { title: "View tag parameters and cookies — Pinterest Business Help", url: "https://help.pinterest.com/en/business/article/pinterest-tag-parameters-and-cookies" },
      { title: "Enable optional enhanced match — Pinterest Business Help", url: "https://help.pinterest.com/en/business/article/enhanced-match" }
    ]
  },

  li_fat_id: {
    what: "li_fat_id is LinkedIn’s first-party ads click ID. LinkedIn and Microsoft Learn also refer to it as LINKEDIN_FIRST_PARTY_ADS_TRACKING_UUID. With enhanced conversion tracking enabled, LinkedIn appends it to ad landing-page URLs.",
    who: "LinkedIn Ads advertisers using the Insight Tag and/or Conversions API.",
    how: "An ad click adds li_fat_id to the landing URL. The Insight Tag can store a first-party cookie; Conversions API integrations send the value to improve match rates.",
    why: "First-party click IDs improve website audience and conversion capture as third-party cookies become less reliable.",
    privacy: "Advertising measurement ID. LinkedIn docs note the cookie can persist for 30 days from the most recent qualifying click.",
    funFacts: [
      "Microsoft Learn expands the identifier as LinkedIn First-Party Ad Tracking ID / LINKEDIN_FIRST_PARTY_ADS_TRACKING_UUID.",
      "LinkedIn documents that the first-party cookie persists for 30 days from the most recent click that redirected to the landing page.",
      "LinkedIn warns that some servers break if they reject unknown query parameters — li_fat_id must be allowed through.",
      "Insight Tag does not have to be installed for the click ID to be appended, but view-through Insight Tag conversions need the tag present."
    ],
    exampleUrl: "https://www.example.com/whitepaper?li_fat_id=a1b2c3examplelinkedin",
    exampleNote: "li_fat_id is LinkedIn’s first-party ads tracking UUID appended for enhanced conversion tracking.",
    safeToRemove: "Yes for reading public pages. Removing it drops LinkedIn’s click-id signal for that visit.",
    sources: [
      { title: "Enable first-party cookies on your LinkedIn Insight Tag — LinkedIn Help", url: "https://www.linkedin.com/help/lms/answer/a423304" },
      { title: "Enabling Click IDs — LinkedIn on Microsoft Learn", url: "https://learn.microsoft.com/en-us/linkedin/marketing/conversions/enabling-first-party-cookies?view=li-lms-2026-09" }
    ]
  },

  mc_eid: {
    what: "mc_eid is Mailchimp’s email ID tracking parameter. Mailchimp’s developer docs state it is a unique Mailchimp ID that identifies the recipient’s email address so orders and clicks can be associated with a contact.",
    who: "Senders using Mailchimp campaigns with e-commerce/link tracking enabled, and anyone clicking those tracked links.",
    how: "Tracked campaign links include mc_eid (often with mc_cid). Merchants can resolve the contact via Mailchimp’s Members API using unique_email_id=mc_eid.",
    why: "Email and e-commerce reporting need to know which subscriber clicked and which contact to attach a purchase to.",
    privacy: "More sensitive than a generic UTM. Official Mailchimp docs describe lookup paths from mc_eid to a contact email address via the API — clean before forwarding newsletter links.",
    funFacts: [
      "Mailchimp documents that mc_eid is distinct from the MD5 hash of the lowercase email used by some other Marketing API endpoints.",
      "Example docs use a Members lookup like /lists/{list_id}/members?unique_email_id=18d3c1adfe.",
      "mc_cid (campaign) and mc_eid (email/subscriber) often appear together on tracked links.",
      "Forwarding a raw tracked newsletter link can make someone else’s clicks look like the original recipient’s activity in ESP reporting."
    ],
    exampleUrl: "https://www.example.com/weekly-tips?mc_cid=a1b2c3&mc_eid=18d3c1adfe",
    exampleNote: "mc_eid identifies the subscriber; mc_cid identifies the Mailchimp campaign.",
    safeToRemove: "Generally yes for reading public content. Removing it stops Mailchimp from attributing the click to that subscriber.",
    sources: [
      { title: "E-Commerce tracking parameters — Mailchimp Developer", url: "https://mailchimp.com/developer/marketing/docs/e-commerce/" }
    ]
  },

  mc_cid: {
    what: "mc_cid is Mailchimp’s campaign ID tracking parameter — the Mailchimp ID for the campaign that generated the link.",
    who: "Mailchimp users sending tracked campaigns, especially with e-commerce tracking enabled.",
    how: "Mailchimp adds mc_cid on tracked links. E-commerce integrations can send it back as campaign_id on orders so purchases appear in campaign reports.",
    why: "Campaign-level reporting needs a stable campaign key on the click and on the order.",
    privacy: "Campaign ID alone is less sensitive than mc_eid, but together they identify which email went to which person.",
    funFacts: [
      "Mailchimp’s e-commerce docs say to use mc_cid as the campaign_id value when creating tracked orders.",
      "Google Analytics link tracking in Mailchimp is a separate feature that adds UTM parameters rather than replacing mc_cid/mc_eid.",
      "Seeing only mc_cid without mc_eid can mean a preview, a partially cleaned URL, or a non-personalized path.",
      "ESP tracking is why two “identical” newsletter buttons can have different query strings per recipient."
    ],
    exampleUrl: "https://news.example.com/update?mc_cid=ce9f1a2469",
    exampleNote: "mc_cid tells Mailchimp which campaign’s link generated the click or order.",
    safeToRemove: "Yes for consuming the content. The update page does not depend on Mailchimp’s campaign id.",
    sources: [
      { title: "E-Commerce tracking parameters — Mailchimp Developer", url: "https://mailchimp.com/developer/marketing/docs/e-commerce/" },
      { title: "Integrate Google Analytics with Mailchimp — Mailchimp Help", url: "https://mailchimp.com/help/integrate-google-analytics-with-mailchimp/" }
    ]
  },

  mkt_tok: {
    what: "mkt_tok is Adobe Marketo Engage’s per-person tracking token often added to email links. Marketo uses it so clicks can be associated with the correct person record and so Marketo landing-page forms can pre-fill.",
    who: "B2B teams on Adobe Marketo Engage sending tracked emails to Marketo landing pages and websites with Munchkin.",
    how: "Tracked Marketo email links carry mkt_tok. Adobe documents that form pre-fill on Marketo landing pages requires a valid mkt_tok in the URL after an email click.",
    why: "Marketing automation scores and personalizes from click activity. mkt_tok is how a click becomes a person-level activity and enables trusted form pre-fill.",
    privacy: "Person-linked email-click token. Clean before sharing externally. Note the functional caveat on Marketo landing pages below.",
    funFacts: [
      "Adobe distinguishes mktNoTrack (do not wrap/track the link) from mktNoTok (track the click but omit mkt_tok on the final URL).",
      "Since a 2019 change, Marketo form pre-fill relies on a valid mkt_tok from an email click rather than relying only on Munchkin cookies.",
      "Adobe’s “View as Web Page” admin text includes a critical ##MKT_TOK## placeholder for correct person tracking.",
      "mktNoTok is recommended when a destination breaks on query parameters (for example some mailto: or static file links) while still recording the click."
    ],
    exampleUrl: "https://www.example.com/ebook?mkt_tok=eyJ0eXBlIjoiZXhhbXBsZSJ9",
    exampleNote: "mkt_tok associates this click with a Marketo person record and can enable Marketo LP form pre-fill.",
    safeToRemove: "Usually yes for public third-party pages. On Marketo landing pages, removing mkt_tok can disable form pre-fill for that visit even though the page still loads.",
    sources: [
      { title: "Form Pre-Fill Feature Upgrade — Adobe Marketo Engage", url: "https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-28213" },
      { title: "Difference between mktNoTrack and mktNoTok — Adobe", url: "https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-29296" },
      { title: "Disable Tracking for an Email Link — Adobe Marketo Engage", url: "https://experienceleague.adobe.com/en/docs/marketo/using/product-docs/email-marketing/general/functions-in-the-editor/disable-tracking-for-an-email-link" }
    ]
  },

  _hsenc: {
    what: "_hsenc is HubSpot’s identity-tracking parameter on marketing email links. HubSpot documents it as recognizing contacts that have visited before so page views and site activity can be associated with the contact.",
    who: "Companies using HubSpot Marketing Email, and recipients clicking tracked HubSpot email links.",
    how: "With click/identity tracking on, HubSpot adds parameters such as _hsenc and _hsmi to links. Clicks can set a cookie linked to the original recipient’s contact record.",
    why: "CRM-tied email marketing wants clicks and later site activity on the correct contact timeline.",
    privacy: "Identity tracking for a contact. HubSpot notes that clicks from people who received a forwarded email can still be attributed to the original contact.",
    funFacts: [
      "HubSpot’s own troubleshooting docs list hsenc / _hsenc for identity tracking and _hsmi for email click tracking among parameters external systems may need to allow.",
      "HubSpot analytics guidance often recommends excluding _hsenc and _hsmi from Google Analytics page paths so each recipient does not create a unique URL.",
      "Turning off identity tracking means HubSpot cannot associate that activity with contacts the same way.",
      "Source-tracking settings can add HubSpot tags to all URLs, only untagged URLs, or none."
    ],
    exampleUrl: "https://www.example.com/case-study?_hsenc=p2ANqtz-example&_hsmi=123456789",
    exampleNote: "_hsenc carries HubSpot identity tracking; _hsmi is the email click-tracking id.",
    safeToRemove: "Yes for viewing public pages. Removing HubSpot params drops contact attribution for that click.",
    sources: [
      { title: "Links in emails lead to an error page — HubSpot Knowledge Base", url: "https://knowledge.hubspot.com/marketing-email/links-in-emails-or-ctas-lead-to-an-error-page" },
      { title: "Manage marketing email open and click tracking — HubSpot", url: "https://knowledge.hubspot.com/marketing-email/manage-marketing-email-open-and-click-tracking" }
    ]
  },

  _gl: {
    what: "_gl is Google Analytics’ cross-domain linker parameter. When cross-domain measurement is configured, Analytics appends _gl so cookies/IDs can be passed between related domains through a link or form.",
    who: "Sites using Google Analytics 4 (and Google tags) with multiple first-party hostnames — for example a store domain and a checkout domain.",
    how: "A click or form navigation to a linked domain gets a _gl query parameter (for example https://www.example.com/?_gl=1*abcde5*). The destination tag reads it and continues the user/session identity.",
    why: "Without linking, each domain would mint new IDs and one journey would look like multiple users/sessions.",
    privacy: "This is explicitly about stitching analytics identity across domains. Harmless to page function when removed; helpful to strip when sharing URLs.",
    funFacts: [
      "Google Analytics Help says cross-domain measurement works by appending parameters to URLs, and names _gl as the linker parameter.",
      "Google warns that redirects which drop unknown query params can remove _gl before you even notice it.",
      "Tag Platform docs show the linker parameter key is _gl and that it can optionally be placed in the URL fragment instead of the query string.",
      "Inside a _gl payload you may see embedded references to analytics cookie values; the public query key for GA4 linking is still _gl."
    ],
    exampleUrl: "https://www.example.com/welcome?_gl=1*abcde5*",
    exampleNote: "_gl carries Google’s cross-domain linker information between configured domains.",
    safeToRemove: "Yes. Site navigation and checkout should rely on their own sessions — not on you preserving analytics linker params.",
    sources: [
      { title: "Set up cross-domain measurement — Google Analytics Help", url: "https://support.google.com/analytics/answer/10071811" },
      { title: "Measure activity across multiple domains — Google Tag Platform", url: "https://developers.google.com/tag-platform/devguides/cross-domain" }
    ]
  },

  cjevent: {
    what: "cjevent is CJ Affiliate’s proprietary Click ID. CJ automatically appends a unique click event ID to affiliate landing URLs so a later sale or lead can be credited to the publisher who drove the click.",
    who: "Brands (advertisers) and publishers in the CJ Affiliate network.",
    how: "A publisher click redirects to the advertiser with ?cjevent=…. Advertisers capture it (often into a first-party cje cookie) and return it at conversion time.",
    why: "Without the click event ID, CJ cannot match the conversion to the publisher, so commissions go uncredited.",
    privacy: "Commercial click-event tracking for affiliate attribution. It can also indicate you arrived via a publisher/deal site.",
    funFacts: [
      "CJ’s developer docs describe storing the click ID for 13 months in a cookie named cje as a common integration pattern.",
      "CJ also documents a separate cjdata URL parameter used for GDPR consent information on landing pages.",
      "Capture rate — the share of clicks where cjevent was successfully saved — is a first-class CJ integration metric.",
      "CJ notes some loss is expected industry-wide, but advertisers should minimize loss they control."
    ],
    exampleUrl: "https://www.shop.example/product/123?cjevent=656e8fa049ec11ea8237023d0a240612",
    exampleNote: "cjevent is the CJ click event ID that must be stored and returned for publisher attribution.",
    safeToRemove: "Yes for viewing the product. Removing it typically does not change price or stock; it may prevent affiliate commission attribution.",
    sources: [
      { title: "CJ Click Event ID (cjevent) — CJ Developer Portal", url: "https://developers.cj.com/docs/advertiser-site-tracking/overview" },
      { title: "What is CJ's Click ID (CJEVENT) — CJ Developer docs", url: "https://lab-developers.d.cjpowered.com/docs/cj's-click-event-id-(cjevent)/click-events" }
    ]
  },

  irclickid: {
    what: "irclickid is impact.com’s click identifier (also documented as im_ref). Impact’s APIs describe it as a generated value representing the consumer journey for a click.",
    who: "Brands and partners on the impact.com partnership platform.",
    how: "Tracking templates append irclickid={clickid} (or equivalent) to landing pages. Later, APIs can look up click details by that id.",
    why: "Partnership and affiliate payouts depend on joining conversions to the partner click that earned credit.",
    privacy: "Commercial click tracking for partner attribution. Safe to remove for personal browsing if you do not care about commission credit.",
    funFacts: [
      "impact.com API reference notes that a single Id (im_ref / irclickid) can be associated with multiple click objects in a consumer journey.",
      "Brand help centers tell programs using Universal Tracking Tag to keep irclickid={clickid} on the program tracking template for ITP-oriented setups.",
      "Gateway tracking templates also expose other tokens such as {irpid} for the partner id alongside {clickid}.",
      "You may also see irgwc=1 style flags on some Impact landing URLs in API examples."
    ],
    exampleUrl: "https://www.brand.example/offer?irclickid=2uz3sQWFlxyJRcqwUx0Mo34VUkiyviUnPwZbQM0",
    exampleNote: "irclickid is Impact’s click id / im_ref used for partner attribution.",
    safeToRemove: "Yes for accessing the offer page. Commission attribution may be lost; page functionality generally is not.",
    sources: [
      { title: "Clicks API — impact.com Integrations Hub", url: "https://integrations.impact.com/brand-api-reference/reference/clicks/clicks" },
      { title: "Determine your Program's ITP Compliance — impact.com Help", url: "https://help.impact.com/brand/what-would-you-like-to-learn-about/platform-features/tracking/set-up-tracking/determine-your-programs-itp-compliance" }
    ]
  },

  srsltid: {
    what: "srsltid is Google Merchant Center’s auto-tagging “result id” parameter appended when shoppers click free product listings. Google Analytics docs show it on Merchant Center organic shopping links.",
    who: "Merchants using Google Merchant Center free listings with auto-tagging / key event tracking enabled.",
    how: "A free-listing click lands on a merchant URL with srsltid. Google uses it to attribute Shopping free-listings traffic and key events.",
    why: "Merchants need to see performance of free listings separately from plain organic web results and paid Shopping ads.",
    privacy: "Listing/click measurement for Merchant Center — not needed to browse the product page you already chose.",
    funFacts: [
      "Google Analytics Help says free-listings traffic with this tagging can appear with source platform Shopping Free Listings and medium Organic.",
      "Merchant Center docs say the result id is created at impression time and reused if the same free listing is clicked again.",
      "Google Searchliaison has stated these parameters are added dynamically for merchant analytics and are not meant as separately indexed URLs.",
      "A small percentage of sites error on arbitrary query params; Google tells those merchants to disable the feature until their servers allow it."
    ],
    exampleUrl: "https://www.merchant.example/item/sku-42?srsltid=AfmBOopexampleShoppingId",
    exampleNote: "srsltid is the Merchant Center result id used to attribute a free-listings click.",
    safeToRemove: "Yes. SKU pages should load from the path alone; srsltid is measurement overhead.",
    sources: [
      { title: "Connect Google Merchant Center to Google Analytics — Analytics Help", url: "https://support.google.com/analytics/answer/11479699" },
      { title: "Set up key event tracking in Merchant Center — Google Help", url: "https://support.google.com/merchants/answer/14166401" }
    ]
  },

  pk_campaign: {
    what: "pk_campaign is a Matomo campaign-name parameter from older Matomo/Piwik URL conventions. Matomo still accepts it for backwards compatibility, while newer setups recommend the mtm_ prefix.",
    who: "Teams running Matomo Analytics, including privacy-conscious organizations that self-host Matomo.",
    how: "Campaign links include pk_campaign (and often related pk_* fields). Matomo reads them and attributes the visit to that campaign.",
    why: "Same need as UTMs: channel and campaign reporting. Matomo kept its own prefixes so tagging can be explicit.",
    privacy: "Campaign labeling for analytics. Usually non-personal labels, though the visit is still being categorized for measurement.",
    funFacts: [
      "Matomo’s FAQ lists campaign name aliases including mtm_campaign, matomo_campaign, pk_campaign, piwik_campaign, and even utm_campaign.",
      "For Matomo 4+, Matomo recommends creating new links with the mtm_ prefix while still recognizing pk_ and piwik_ for older links.",
      "If both mtm_ and utm_ values are present for the same property, Matomo’s docs say the mtm_ value takes priority.",
      "Matomo can also read campaign parameters from the URL hash, not only the query string."
    ],
    exampleUrl: "https://www.example.org/donate?pk_campaign=spring_drive&pk_source=newsletter",
    exampleNote: "pk_campaign=spring_drive is a legacy-style Matomo campaign name tag on the donation link.",
    safeToRemove: "Yes. Donations and content pages do not need Matomo campaign tags to function.",
    sources: [
      { title: "How do I customise the Matomo Campaign parameters? — Matomo FAQ", url: "https://matomo.org/faq/how-to/faq_120/" },
      { title: "Manually build campaign tracking URLs — Matomo FAQ", url: "https://matomo.org/faq/reports/advanced-how-to-manually-build-campaign-tracking-urls/" }
    ]
  },

  dclid: {
    what: "dclid is a Display Click Identifier used in Google’s Campaign Manager 360 / Display & Video 360 enhanced attribution. When enabled, a DCLID is appended to landing-page URLs after display/video ad clicks.",
    who: "Advertisers using Campaign Manager 360 or Display & Video 360 with Floodlight / Google tag measurement.",
    how: "Enhanced attribution appends dclid to the landing URL. The Google tag reads it (similar to gclid). Offline conversion uploads can also send a dclid field.",
    why: "Display and video campaigns need stronger click-through attribution signals across Google Marketing Platform inventory.",
    privacy: "Ad-click measurement identifier for display/video attribution. Opaque to humans; safe to strip for sharing.",
    funFacts: [
      "Display & Video 360 Help shows example landing URLs that may include UTM parameters and dclid together.",
      "Campaign Manager 360 diagnostics explicitly describe Enhanced attribution as appending a DoubleClick Identifier (DCLID).",
      "Google’s CM360 conversion upload docs accept dclid as one of the identifier fields on a Conversion object.",
      "Google recommends delaying dclid-based offline uploads by about an hour and notes clicks older than 60 days are rejected."
    ],
    exampleUrl: "https://www.example.com/landing?utm_source=example&dclid=CJKu8LrQxd4CFQ1qwQodmJIElw",
    exampleNote: "dclid is the Display Click Identifier appended for CM360/DV360 enhanced attribution.",
    safeToRemove: "Yes. Landing-page content should not depend on dclid.",
    sources: [
      { title: "Enhanced attribution — Display & Video 360 Help", url: "https://support.google.com/displayvideo/answer/9188083" },
      { title: "Diagnostics in Campaign Manager 360 — Google Help", url: "https://support.google.com/campaignmanager/answer/15406375" },
      { title: "Upload conversions — Campaign Manager 360 API", url: "https://developers.google.com/doubleclick-advertisers/guides/conversions_upload" }
    ]
  },

  si: {
    what: "si appears on many YouTube share URLs as a query parameter. YouTube has not published a full public specification of the field; privacy engineers and browser vendors widely treat it as a share/tracking identifier that is unnecessary for playback.",
    who: "Anyone using YouTube’s Share → copy link flows, plus browsers and cleaners that strip known tracking parameters.",
    how: "Copying a share link from YouTube often adds si=…. The video still resolves from v= / youtu.be path data without si.",
    why: "Platforms measure how sharing drives views. Public reporting and browser bugs describe si as share attribution rather than a playback setting.",
    privacy: "Treat as share telemetry. Important distinction: keep functional YouTube params such as v, t, and list; si is the disposable one.",
    funFacts: [
      "Mozilla Bugzilla 1876908 describes YouTube share links with a 16-character base64 si parameter and calls out that it has no purpose other than tracking video shares.",
      "Firefox’s tracking-parameter stripping work specifically added si to the strip list after that bug.",
      "German technology outlet heise online reported that Share-generated YouTube links gained an unnecessary si parameter and still work without it.",
      "Because Google’s public docs do not fully define si, careful write-ups avoid claiming exactly which account fields are encoded in the value."
    ],
    exampleUrl: "https://www.youtube.com/watch?v=dQw4w9wgxcq&si=AbCdEfShareExample",
    exampleNote: "v= selects the video (keep); si= is the share parameter widely stripped as tracking.",
    safeToRemove: "Yes — keep v, t, list, and other playback parameters. Removing si does not change which video plays.",
    sources: [
      { title: "Bug 1876908 — Mozilla Bugzilla (YouTube si share id)", url: "https://bugzilla.mozilla.org/show_bug.cgi?id=1876908" },
      { title: "YouTube share links gain si parameter — heise online", url: "https://www.heise.de/news/Youtube-Video-teilen-Links-Seit-einiger-Zeit-mit-Tracking-Parameter-9615603.html" }
    ]
  },

  igshid: {
    what: "igshid is a share-link parameter Instagram has added to copied/shared URLs. Meta has not published a detailed public spec; browser vendors and researchers treat it as a share/tracking token that is optional for opening the destination.",
    who: "People copying links from Instagram, and browsers/extensions that strip Instagram share trackers (including later names like igsh).",
    how: "Share/copy flows append igshid (or newer aliases). The underlying Instagram path or external destination still works after the parameter is removed.",
    why: "Share tokens let the platform attribute how a link left Instagram. That is useful to Instagram; it is rarely useful to the person forwarding the link.",
    privacy: "Share attribution telemetry. Brave and Firefox-oriented tooling treat Instagram share parameters as trackers worth removing.",
    funFacts: [
      "Brave issue 35094 documents Instagram appending igsh on Share → Copy link flows and compares it to YouTube’s si parameter.",
      "Firefox add-ons and Brave’s cleaner work expanded from igshid to newer aliases such as igsh as Instagram renamed the token.",
      "There is no benefit to keeping igshid when embedding or publicly citing an Instagram URL.",
      "Because official public docs are thin, responsible explainers say “likely share tracking” rather than inventing decoded field layouts."
    ],
    exampleUrl: "https://www.example.com/recipe/pasta?igshid=YmMyMTA2M2Y=",
    exampleNote: "igshid is an Instagram share token on the copied link; the destination works without it.",
    safeToRemove: "Yes. The destination content does not need igshid.",
    sources: [
      { title: "Remove Instagram's igsh share tracker — Brave browser issue", url: "https://github.com/brave/brave-browser/issues/35094" },
      { title: "Instagram URL tracking parameters — Stack Overflow discussion", url: "https://stackoverflow.com/questions/62275124/instagram-url-tracking-parameters" }
    ]
  }
};
