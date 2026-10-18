import test from "node:test";
import assert from "node:assert/strict";
import { cleanBatch, cleanUrl, inspectUrl, isOpaqueShortener } from "../dist/cleaner.js";

const GLOBAL_TRACKERS = [
  "_gcl_aw", "_gcl_dc", "_gcl_gs", "_gcl_gb", "usqp", "ef_id",
  "action_object_map", "action_ref_map", "action_type_map",
  "sccid", "rdt_cid", "yadclid", "ocid", "wt.mc_id",
  "__hstc", "__hssc", "__hsfp", "__s", "_bhlid", "_kx",
  "ml_subscriber", "ml_subscriber_hash",
  "et_cid", "et_lid", "et_rid", "sfmc_id", "sfmc_activityid",
  "vgo_ee", "wickedid", "sscid", "awc", "irgwc",
  "ranmid", "raneaid", "ransiteid",
  "pk_keyword", "pk_group", "pk_placement",
  "itsct", "itscg", "bsft_clkid", "bsft_uid"
];

test("removes newly recognized global tracking parameters and keeps the page id", () => {
  for (const name of GLOBAL_TRACKERS) {
    const result = cleanUrl(`https://example.com/page?${encodeURIComponent(name)}=tracked&id=9`);
    assert.equal(result.url, "https://example.com/page?id=9", name);
    assert.deepEqual(result.removedParameters, [name], name);
  }
});

test("matches new tracker names case-insensitively, including Snap's ScCid", () => {
  const result = cleanUrl("https://shop.example/item?ScCid=abc&RDT_CID=123&_KX=klaviyo&id=5");

  assert.equal(result.url, "https://shop.example/item?id=5");
  assert.deepEqual(result.removedParameters, ["ScCid", "RDT_CID", "_KX"]);
});

test("cleans an X share link but does not treat s as tracking everywhere", () => {
  const profile = cleanUrl("https://x.com/spacexsi?s=11");
  const status = cleanUrl("https://twitter.com/spacex/status/123?s=20&t=AbCdEf&cxt=1");
  const mobile = cleanUrl("https://mobile.twitter.com/spacex/status/123?ref_src=twsrc&ref_url=https%3A%2F%2Fx.com&q=keep");
  const elsewhere = cleanUrl("https://example.com/search?s=11&q=rockets");
  const redirect = cleanUrl("https://x.com/i/redirect?t=required&s=11&url=https%3A%2F%2Fexample.com");

  assert.equal(profile.url, "https://x.com/spacexsi");
  assert.deepEqual(profile.removedParameters, ["s"]);
  assert.equal(status.url, "https://twitter.com/spacex/status/123");
  assert.deepEqual(status.removedParameters, ["s", "t", "cxt"]);
  assert.equal(mobile.url, "https://mobile.twitter.com/spacex/status/123?q=keep");
  assert.equal(elsewhere.url, "https://example.com/search?s=11&q=rockets");
  assert.deepEqual(elsewhere.removedParameters, []);
  assert.equal(redirect.url, "https://x.com/i/redirect?t=required&s=11&url=https%3A%2F%2Fexample.com");
  assert.equal(inspectUrl("https://x.com/spacexsi?s=11").parameters[0].category, "tracking");
  assert.equal(inspectUrl("https://example.com/search?s=11").parameters[0].category, "unknown");
});

test("keeps YouTube playback parameters and strips share trackers", () => {
  const watch = cleanUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc&index=3&t=42s&start=10&end=70&si=SHARE&pp=ygU&feature=share&utm_source=share#comments");
  const shorts = cleanUrl("https://www.youtube.com/shorts/SXPOmuGspYE?si=6cy15&feature=share");
  const embed = cleanUrl("https://www.youtube-nocookie.com/embed/abc?start=10&autoplay=1&si=SHARE&embeds_referring_euri=https%3A%2F%2Fevil.example&source_ve_path=1");
  const signin = cleanUrl("https://www.youtube.com/signin?feature=consent&next=%2F");
  const genericFeature = cleanUrl("https://shop.example/item?feature=blue&id=4");

  assert.equal(watch.url, "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc&index=3&t=42s&start=10&end=70#comments");
  assert.deepEqual(watch.removedParameters, ["si", "pp", "feature", "utm_source"]);
  assert.equal(shorts.url, "https://www.youtube.com/shorts/SXPOmuGspYE");
  assert.equal(embed.url, "https://www.youtube-nocookie.com/embed/abc?start=10&autoplay=1");
  assert.equal(signin.url, "https://www.youtube.com/signin?feature=consent&next=%2F");
  assert.equal(genericFeature.url, "https://shop.example/item?feature=blue&id=4");
});

test("strips shopping attribution and keeps variant, sort, and seller parameters", () => {
  const product = cleanUrl("https://www.amazon.com/dp/B00TEST?th=1&psc=1&smid=SELLER&tag=mytag-20&pd_rd_w=abc&pd_rd_r=def&pf_rd_p=ghi&keywords=shoes&s=price-asc-rank&ref=sr_1_1");
  const uk = cleanUrl("https://www.amazon.co.uk/dp/B00TEST?th=1&tag=mytag-21&linkCode=as2&creativeASIN=B00TEST");
  const search = cleanUrl("https://www.amazon.com/s?k=shoes&s=price-asc-rank&keywords=shoes&crid=ABC&qid=123&sprefix=sho&ref=nb_sb_noss");
  const ebay = cleanUrl("https://www.ebay.com/itm/123?var=456&_trkparms=abc&_trksid=p1&hash=xyz&campid=9");
  const etsy = cleanUrl("https://www.etsy.com/listing/999/mug?variation0=blue&ga_search_query=mug&click_key=abc&ref=sr");
  const otherRef = cleanUrl("https://shop.example/item?ref=partner&th=1&id=3");

  assert.equal(product.url, "https://www.amazon.com/dp/B00TEST?th=1&psc=1&smid=SELLER&keywords=shoes&s=price-asc-rank");
  assert.equal(uk.url, "https://www.amazon.co.uk/dp/B00TEST?th=1");
  assert.equal(search.url, "https://www.amazon.com/s?k=shoes&s=price-asc-rank&keywords=shoes");
  assert.equal(ebay.url, "https://www.ebay.com/itm/123?var=456&hash=xyz");
  assert.equal(etsy.url, "https://www.etsy.com/listing/999/mug?variation0=blue");
  assert.equal(otherRef.url, "https://shop.example/item?ref=partner&th=1&id=3");
});

test("cleans social and search links without dropping content or locale parameters", () => {
  const tiktok = cleanUrl("https://www.tiktok.com/@user/video/7312345678?refer=copy&tt_from=copy&_t=8W9&_r=1&is_from_webapp=1&sender_device=pc&sender_web_id=123&is_copy_url=1&share_item_id=9&u_code=abc&sharer_language=en&language=en");
  const reddit = cleanUrl("https://www.reddit.com/r/spacex/comments/abc/title/?share_id=zzz&correlation_id=1&ref_source=share&ref_campaign=share&utm_source=share&context=3");
  const threads = cleanUrl("https://www.threads.net/@user/post/ABC?xmt=token");
  const threadsDotCom = cleanUrl("https://www.threads.com/@user/post/ABC?xmt=token&igsh=share");
  const linkedin = cleanUrl("https://www.linkedin.com/in/someone?trk=public_profile&lipi=xyz&trackingId=abc&miniProfileUrn=keep");
  const facebook = cleanUrl("https://www.facebook.com/story.php?story_fbid=1&id=2&comment_id=3&fb_comment_id=4&__tn__=5");
  const commentPlugin = cleanUrl("https://blog.example/post?fb_comment_id=4&utm_source=fb");
  const instagram = cleanUrl("https://www.instagram.com/p/AbC/?ig_rid=1&igsh=2");
  const google = cleanUrl("https://www.google.com/search?q=rockets&hl=en&ved=abc&ei=def&oq=rock&uact=1&sca_esv=1&gs_lp=x&sei=y");
  const maps = cleanUrl("https://www.google.com/maps?q=space&ved=abc");
  const bing = cleanUrl("https://www.bing.com/search?q=rockets&cvid=abc&form=QBLH");
  const cvidElsewhere = cleanUrl("https://example.com/page?cvid=abc&id=1");
  const apple = cleanUrl("https://music.apple.com/us/album/name/123?i=456&at=1001&ct=share&itsct=wrap&itscg=group");

  assert.equal(tiktok.url, "https://www.tiktok.com/@user/video/7312345678?language=en");
  assert.equal(reddit.url, "https://www.reddit.com/r/spacex/comments/abc/title/?context=3");
  assert.equal(threads.url, "https://www.threads.net/@user/post/ABC");
  assert.equal(threadsDotCom.url, "https://www.threads.com/@user/post/ABC");
  assert.equal(linkedin.url, "https://www.linkedin.com/in/someone?miniProfileUrn=keep");
  assert.equal(facebook.url, "https://www.facebook.com/story.php?story_fbid=1&id=2&comment_id=3&fb_comment_id=4");
  assert.equal(commentPlugin.url, "https://blog.example/post?fb_comment_id=4");
  assert.equal(instagram.url, "https://www.instagram.com/p/AbC/");
  assert.equal(google.url, "https://www.google.com/search?q=rockets&hl=en");
  assert.equal(maps.url, "https://www.google.com/maps?q=space&ved=abc");
  assert.equal(bing.url, "https://www.bing.com/search?q=rockets&form=QBLH");
  assert.equal(cvidElsewhere.url, "https://example.com/page?cvid=abc&id=1");
  assert.equal(apple.url, "https://music.apple.com/us/album/name/123?i=456");
});

test("preserves signed URLs, encoded kept values, fragments, and nested non-wrapper URLs", () => {
  const signed = cleanUrl("https://bucket.s3.amazonaws.com/file?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=abc&X-Amz-Signature=sig&X-Amz-Date=20260101T000000Z&utm_source=mail");
  const encoded = cleanUrl("https://x.com/spacexsi?%73=11&v=keep%20this#part");
  const doubleEncoded = cleanUrl("https://x.com/spacexsi?%2573=11");
  const nested = cleanUrl("https://example.com/redirect?url=https%3A%2F%2Fx.com%2Fspacexsi%3Fs%3D11&utm_source=mail&id=1");
  const duplicates = cleanUrl("https://x.com/spacexsi?s=11&s=11&id=1");
  const wrapped = cleanUrl(`https://www.google.com/url?q=${encodeURIComponent("https://x.com/spacexsi?s=11&utm_source=share")}`);

  assert.equal(signed.url, "https://bucket.s3.amazonaws.com/file?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=abc&X-Amz-Signature=sig&X-Amz-Date=20260101T000000Z");
  assert.equal(encoded.url, "https://x.com/spacexsi?v=keep%20this#part");
  assert.deepEqual(encoded.removedParameters, ["s"]);
  assert.equal(doubleEncoded.url, "https://x.com/spacexsi?%2573=11");
  assert.equal(nested.url, "https://example.com/redirect?url=https%3A%2F%2Fx.com%2Fspacexsi%3Fs%3D11&id=1");
  assert.equal(duplicates.url, "https://x.com/spacexsi?id=1");
  assert.deepEqual(duplicates.removedParameters, ["s", "s"]);
  assert.equal(wrapped.url, "https://x.com/spacexsi");
  assert.deepEqual(wrapped.removedParameters, ["s", "utm_source"]);
  assert.deepEqual(wrapped.unwrappedFrom, ["www.google.com"]);
});

test("batch cleaning and single cleaning share the expanded rules", () => {
  const text = [
    "https://x.com/spacexsi?s=11",
    "https://www.youtube.com/watch?v=abc123&list=PL1&t=30s&pp=1",
    "https://www.amazon.com/dp/B00?th=1&psc=1&tag=aff-20"
  ].join("\n");
  const results = cleanBatch(text);

  assert.equal(results.length, 3);
  for (const entry of results) {
    assert.equal(entry.ok, true);
    assert.equal(entry.result.url, cleanUrl(entry.input).url);
  }
  assert.equal(results[0].result.url, "https://x.com/spacexsi");
  assert.equal(results[1].result.url, "https://www.youtube.com/watch?v=abc123&list=PL1&t=30s");
  assert.equal(results[2].result.url, "https://www.amazon.com/dp/B00?th=1&psc=1");
});

test("recognizes additional opaque shorteners without following them", () => {
  for (const host of ["t.ly", "rb.gy", "amzn.to", "a.co", "lnkd.in", "pin.it", "spoti.fi", "vm.tiktok.com", "vt.tiktok.com"]) {
    assert.equal(isOpaqueShortener(`https://${host}/abc`), true, host);
    const result = cleanUrl(`https://${host}/abc?utm_source=x`);
    assert.equal(result.url, `https://${host}/abc`, host);
    assert.deepEqual(result.unwrappedFrom, [], host);
  }
  assert.equal(isOpaqueShortener("https://youtu.be/abc"), false);
  assert.equal(isOpaqueShortener("https://www.amazon.com/dp/B00"), false);
});
