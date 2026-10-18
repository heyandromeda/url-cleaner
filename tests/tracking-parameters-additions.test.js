import test from "node:test";
import assert from "node:assert/strict";
import { cleanUrl } from "../cleaner.js";

const NEW_TRACKERS = [
  { name: "adobe_mc", source: "Adobe Experience Cloud MID parameter (Adobe docs)" },
  { name: "adobe_mc_sdid", source: "Adobe Experience Cloud SDID (Adobe docs)" },
  { name: "icid", source: "Adobe Analytics ICID campaign id (Adobe Analytics)" },
  { name: "tt_medium", source: "TikTok marketing URL tags (TikTok Business / ClearURLs-style tt_ params)" },
  { name: "tt_content", source: "TikTok marketing URL tags (TikTok Business)" },
  { name: "clickref", source: "Partnerize affiliate clickref (Partnerize docs)" },
  { name: "iterable_campaign_id", source: "Iterable link tracking (Iterable API/docs)" },
  { name: "iterable_template_id", source: "Iterable link tracking (Iterable API/docs)" },
  { name: "iterable_link_id", source: "Iterable link tracking (Iterable API/docs)" },
  { name: "braze_c_id", source: "Braze campaign id on links (Braze docs)" },
  { name: "twcamp", source: "X web intent share parameters (X developer docs)" },
  { name: "twsrc", source: "X web intent share parameters (X developer docs)" },
  { name: "adj_t", source: "Adjust attribution parameters (Adjust help center)" },
  { name: "adj_campaign", source: "Adjust attribution parameters (Adjust help center)" },
  { name: "adj_adgroup", source: "Adjust attribution parameters (Adjust help center)" },
  { name: "adj_creative", source: "Adjust attribution parameters (Adjust help center)" },
  { name: "zanpid", source: "AdGuard URL Tracking filter / Zanox affiliate (zanpid)" },
  { name: "_hsq", source: "HubSpot _hsq tracking (HubSpot / AdGuard lists)" }
];

for (const { name } of NEW_TRACKERS) {
  test(`removes new tracking parameter ${name}`, () => {
    const url = `https://example.com/page?id=42&${name}=track123`;
    const result = cleanUrl(url);
    assert.equal(result.url, "https://example.com/page?id=42");
    assert.ok(result.removedParameters.includes(name));
    assert.equal(result.changed, true);
  });
}

test("functional query params stay without aggressive mode", () => {
  const cases = [
    "https://example.com/search?q=hello&lang=en&page=2&id=9",
    "https://shop.example/item?ref=homepage",
    "https://app.example/auth?session=abc123&token=def456",
    "https://wiki.example/wiki/Topic?action=edit"
  ];
  for (const input of cases) {
    const result = cleanUrl(input);
    assert.equal(result.url, input, input);
    assert.equal(result.changed, false, input);
    assert.deepEqual(result.removedParameters, [], input);
  }
});
