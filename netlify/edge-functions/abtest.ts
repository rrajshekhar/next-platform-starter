import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRAFFIC_PERCENTAGE") ?? "0.1");
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;
  const proxyCookie = context.cookies.get(PROXY_COOKIE);
  const override = url.searchParams.get("override");
  // Handle override for 'test1'
  if (override === 'Test1') {
    if (proxyCookie) {
      // Delete cookie in a way compatible with Next.js
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "",
        expires: new Date(0),
        path: '/',
      });
    }
    return context.next();
  }
  // If cookie exists and no override, continue
  if (proxyCookie && !override) {
    return context.next();
  }
  // Determine traffic routing
  const trafficRouting = override || (Math.random() <= TRAFFIC_PERCENTAGE ? "Test1" : "Test2");
  // Set cookie for Test2 or when explicitly overridden
  if (trafficRouting === 'Test2' || override === 'Test2') {
    context.cookies.set({
      name: PROXY_COOKIE,
      value: trafficRouting,
      expires: new Date(expireTime),
      path: '/',
    });
  }
  return context.next();
};
export const config: Config = {
  path: "/*",
  excludedPath: ["/_next/*"]
};