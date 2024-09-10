
import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRAFFIC_PERCENTAGE") ?? "0.1");
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;
  const override = url.searchParams.get("forceOverride");
  const currentCookie = context.cookies.get(PROXY_COOKIE);
  // Handle overrides
  if (override) {
    console.log('path is', path);
    if (override === 'ssc') {
      context.cookies.delete(PROXY_COOKIE);
      console.log('proxy cookie is', context.cookies.get(PROXY_COOKIE));
    } else if (override === 'bb') {
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "bb",
        expires: new Date(expireTime),
      });
    }
    // After handling the override, we'll let the request continue
    return context.next();
  }
  // Normal traffic routing (only if no override and no existing cookie)
  if (!currentCookie) {
    const trafficRouting = Math.random() <= TRAFFIC_PERCENTAGE ? "ssc" : "bb";
    if (trafficRouting === 'bb') {
      context.cookies.set({
        name: PROXY_COOKIE,
        value: trafficRouting,
        expires: new Date(expireTime)
      });
    }
  }
  // Continue with the request
  return context.next();
};
export const config: Config = {
  path: "/*",
  excludedPath: ["/_next/*"]
};
