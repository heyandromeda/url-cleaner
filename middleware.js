export const config = {
  matcher: ["/", "/index.html"]
};

export function isShareTargetPost(method, pathname) {
  if (method !== "POST") return false;
  return pathname === "/" || pathname === "/index.html" || pathname === "";
}

// First-launch share POSTs must not be parsed here: reading the body would
// put the shared link on the server. Drop it and 303 to `/` instead.
export function shareTargetFallbackResponse() {
  return new Response(null, {
    status: 303,
    headers: { Location: "/" }
  });
}

export default function middleware(request) {
  const pathname = new URL(request.url).pathname;
  if (!isShareTargetPost(request.method, pathname)) return;
  return shareTargetFallbackResponse();
}
