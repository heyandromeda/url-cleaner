import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startDistServer } from "./playwright-static-server.mjs";

const SHARED = "https://secret.example/reset?token=super-secret-handoff&utm_source=share";

async function waitForServiceWorker(page) {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("serviceWorker unavailable");
    }
    if (!(await navigator.serviceWorker.getRegistration())) {
      await navigator.serviceWorker.register("./sw.js");
    }
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("service worker did not claim the page")), 8000);
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });
    }
  });
}

const serverPosts = [];
const server = await startDistServer({
  onRequest(request) {
    if (request.method === "POST") {
      serverPosts.push(request.url);
    }
  }
});
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch();

try {
  const context = await browser.newContext();
  const setupPage = await context.newPage();
  await setupPage.goto(baseUrl, { waitUntil: "networkidle" });
  await waitForServiceWorker(setupPage);

  const sharePage = await context.newPage();
  const redirect = sharePage.waitForResponse((response) => (
    response.request().method() === "POST" && [301, 302, 303, 307, 308].includes(response.status())
  ));

  await sharePage.setContent(`<!DOCTYPE html>
<form id="share" method="POST" action="${baseUrl}" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="url" value="${SHARED}">
</form>
<script>document.getElementById("share").submit();</script>`);

  const response = await redirect;
  const location = response.headers().location || "";
  assert.match(location, /#/, `share redirect Location was ${location || "(empty)"}`);
  const redirected = new URL(location, baseUrl);
  assert.equal(new URLSearchParams(redirected.hash.slice(1)).get("url"), SHARED);

  await sharePage.waitForFunction((expected) => {
    const input = document.querySelector("#url-input");
    return Boolean(input && input.value.includes(expected));
  }, "secret.example");

  const inputValue = await sharePage.locator("#url-input").inputValue();
  assert.equal(inputValue, SHARED);

  const fallbackPage = await context.newPage();
  const fallbackRedirect = fallbackPage.waitForResponse((response) => (
    response.request().method() === "POST" && [301, 302, 303, 307, 308].includes(response.status())
  ));
  await fallbackPage.setContent(`<!DOCTYPE html>
<form id="share" method="POST" action="${baseUrl}" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="url" value="not-a-url">
  <input type="hidden" name="text" value="Check this https://from-text.example/a?fbclid=1 please">
</form>
<script>document.getElementById("share").submit();</script>`);
  const fallbackResponse = await fallbackRedirect;
  const fallbackLocation = new URL(fallbackResponse.headers().location || "", baseUrl);
  const fallbackParams = new URLSearchParams(fallbackLocation.hash.slice(1));
  assert.equal(fallbackParams.get("url"), "not-a-url");
  assert.match(fallbackParams.get("text") || "", /from-text\.example/);
  await fallbackPage.waitForFunction((expected) => {
    const input = document.querySelector("#url-input");
    return Boolean(input && input.value.includes(expected));
  }, "from-text.example");

  assert.deepEqual(serverPosts, [], "share POST must be answered by the service worker, not the static server");

  console.log("share-target playwright checks passed (POST intercepted, hash handoff, no server POST)");
} finally {
  await browser.close();
  server.close();
}
