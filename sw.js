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

function shareTargetHash(formData) {
  const params = new URLSearchParams();
  for (const name of ["url", "text", "title"]) {
    const value = formData.get(name);
    if (value == null) continue;
    const text = String(value);
    if (!text) continue;
    params.set(name, text);
  }
  return params.toString();
}

async function shareTargetRedirect(request) {
  const origin = new URL(request.url).origin;
  let hash = "";
  try {
    hash = shareTargetHash(await request.formData());
  } catch {
    hash = "";
  }
  return Response.redirect(hash ? `${origin}/#${hash}` : `${origin}/`, 303);
}

self.addEventListener("fetch", (event) => {
  if (!isShareTargetPost(event.request)) return;
  event.respondWith(shareTargetRedirect(event.request));
});
