import test from "node:test";
import assert from "node:assert/strict";
import { cleanUrl } from "../cleaner.js";
import { PARAMETER_EXPLANATIONS } from "../explanations.js";

const NEW_GLOBAL_TRACKERS = [
  "adobe_mc",
  "adobe_mc_sdid",
  "icid",
  "tt_medium",
  "tt_content",
  "adj_campaign",
  "adj_adgroup",
  "adj_creative",
  "__hssrc",
  "iterable_campaign",
  "iterable_template",
  "__iterable_campaign_id",
  "__iterable_template_id",
  "_iterable_campaign_id",
  "_iterable_template_id"
];

const AGGRESSIVE_AFFILIATE = ["clickref", "zanpid"];

const REALISTIC = [
  {
    name: "adobe_mc",
    input: "https://www.adobe.com/products/photoshop.html?adobe_mc=TS%7C123&promoid=ABC",
    expected: "https://www.adobe.com/products/photoshop.html?promoid=ABC"
  },
  {
    name: "icid",
    input: "https://www.adobe.com/creativecloud.html?icid=cc_teams_banner&promoid=XYZ",
    expected: "https://www.adobe.com/creativecloud.html?promoid=XYZ"
  },
  {
    name: "HubSpot __hssrc",
    input: "https://www.example.com/pricing?__hssrc=1&plan=pro",
    expected: "https://www.example.com/pricing?plan=pro"
  },
  {
    name: "Iterable Shopify params",
    input: "https://shop.example/products/hat?iterable_campaign=12345&iterable_template=67890&color=blue",
    expected: "https://shop.example/products/hat?color=blue"
  },
  {
    name: "Adjust destination labels",
    input: "https://landing.example/app?adj_campaign=launch&adj_adgroup=search&adj_creative=hero&id=1",
    expected: "https://landing.example/app?id=1"
  },
  {
    name: "TikTok tt_ tags",
    input: "https://www.tiktok.com/@user/video/1?tt_medium=share&tt_content=cta&lang=en",
    expected: "https://www.tiktok.com/@user/video/1?lang=en"
  }
];

for (const { name, input, expected } of REALISTIC) {
  test(`realistic URL: strips ${name}`, () => {
    const result = cleanUrl(input);
    assert.equal(result.url, expected);
    assert.equal(result.changed, true);
  });
}

test("Adjust universal link keeps adj_t (tracker token on *.adj.st)", () => {
  const input = "https://abc.adj.st/path?adj_t=xyz&adj_campaign=ignored-on-link";
  const result = cleanUrl(input);
  assert.equal(result.url, "https://abc.adj.st/path?adj_t=xyz");
  assert.ok(result.removedParameters.includes("adj_campaign"));
  assert.ok(!result.removedParameters.includes("adj_t"));
});

test("Iterable camelCase campaignId is not stripped (custom key, not Iterable integration name)", () => {
  const input = "https://shop.example/p?iterableCampaignId=12345&sku=hat";
  const result = cleanUrl(input);
  assert.equal(result.url, input);
  assert.equal(result.changed, false);
});

for (const name of NEW_GLOBAL_TRACKERS) {
  test(`removes ${name} on generic site`, () => {
    const url = `https://example.com/page?id=42&${name}=track123`;
    const result = cleanUrl(url);
    assert.equal(result.url, "https://example.com/page?id=42");
    assert.ok(result.removedParameters.map((p) => p.toLowerCase()).includes(name));
  });
}

for (const name of AGGRESSIVE_AFFILIATE) {
  test(`${name} stays unless aggressive mode`, () => {
    const url = `https://example.com/deals?${name}=abc&id=1`;
    const plain = cleanUrl(url);
    assert.equal(plain.url, url);
    const aggressive = cleanUrl(url, { aggressive: true });
    assert.equal(aggressive.url, "https://example.com/deals?id=1");
    assert.ok(aggressive.removedParameters.includes(name));
  });
}

test("every new global tracker has a PARAMETER_EXPLANATIONS entry", () => {
  for (const name of NEW_GLOBAL_TRACKERS) {
    assert.ok(Object.hasOwn(PARAMETER_EXPLANATIONS, name), `missing explanation for ${name}`);
  }
  for (const name of AGGRESSIVE_AFFILIATE) {
    assert.ok(Object.hasOwn(PARAMETER_EXPLANATIONS, name), `missing explanation for ${name}`);
  }
});

test("functional params stay (ref, adj_t, and params owned by PR #23 stay on this branch)", () => {
  const cases = [
    "https://example.com/search?q=hello&lang=en&page=2&id=9",
    "https://shop.example/item?ref=homepage",
    "https://app.example/auth?session=abc123&token=def456",
    "https://wiki.example/wiki/Topic?action=edit",
    "https://docs.example.com/guide?ref=navigation",
    "https://abc.adj.st/deeplink?adj_t=token123",
    "https://x.com/jack/status/20?ref_src=twsrc%5Etfw&ref_url=https%3A%2F%2Fexample.com",
    "https://www.example.com/pricing?__hstc=1.abc&__hssc=1.abc&__hsfp=999&plan=pro"
  ];
  for (const input of cases) {
    const result = cleanUrl(input);
    assert.equal(result.url, input, input);
    assert.equal(result.changed, false, input);
    assert.deepEqual(result.removedParameters, [], input);
  }
});
