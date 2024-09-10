import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRAFFIC_PERCENTAGE") ?? "0.1");

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;

  const override = url.searchParams.get("override");
  const currentCookie = context.cookies.get(PROXY_COOKIE);

  // Function to create a response with no-cache headers
  const createNoCacheResponse = (status: number, location?: string) => {
    const headers = new Headers({
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    if (location) {
      headers.set("Location", location);
    }
    return new Response(null, { status, headers });
  };

  // Handle overrides
  if (override) {
    if (override === 'Test1') {
      context.cookies.delete(PROXY_COOKIE);
    } else if (override === 'Test2') {
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "Test2",
        expires: new Date(expireTime),
        path: '/',
      });
    }
    
    // Force a refresh by redirecting to the same page without the override parameter
    const redirectUrl = new URL(request.url);
    redirectUrl.searchParams.delete("override");
    return createNoCacheResponse(302, redirectUrl.toString());
  }

  // Normal traffic routing (only if no override and no existing cookie)
  if (!currentCookie) {
    const trafficRouting = Math.random() <= TRAFFIC_PERCENTAGE ? "Test1" : "Test2";
    if (trafficRouting === 'Test2') {
      context.cookies.set({
        name: PROXY_COOKIE,
        value: trafficRouting,
        expires: new Date(expireTime),
        path: '/',
      });
    }
  }

  // Always return a no-cache response
  return createNoCacheResponse(200);
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/_next/*"]
};
