self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function isShareTargetPost(request) {
  if (request.method !== "POST") return false;
  let path;
  try {
    path = new URL(request.url).pathname;
  } catch {
    return false;
  }
  return path === "/" || path === "/index.html";
}

async function shareTargetRedirect(request) {
  const origin = new URL(request.url).origin;
  let shared = "";
  try {
    const formData = await request.formData();
    shared = String(formData.get("url") || formData.get("text") || formData.get("title") || "");
  } catch {
    shared = "";
  }
  return Response.redirect(`${origin}/#url=${encodeURIComponent(shared)}`, 303);
}

self.addEventListener("fetch", (event) => {
  if (!isShareTargetPost(event.request)) return;
  event.respondWith(shareTargetRedirect(event.request));
});
