export const config = {
  matcher: ["/", "/index.html"]
};

export function isShareTargetPost(method, pathname) {
  if (method !== "POST") return false;
  return pathname === "/" || pathname === "/index.html" || pathname === "";
}

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
