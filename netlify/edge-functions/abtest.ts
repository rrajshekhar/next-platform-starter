import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRAFFIC_PERCENTAGE") ?? "0.1");
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;
  const proxyCookie = context.cookies.get(PROXY_COOKIE);
  const forceOverride = url.searchParams.get("forceOverride");

  console.log('path is',url.pathname);
  // Handle override for 'test1'
  if (forceOverride === 'ssc') {
    if (proxyCookie) {
      // Delete cookie in a way compatible with Next.js
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "",
        expires: new Date(0),
        path: '/',
      });
      console.log('proxy cookie is', proxyCookie);
    }
    return context.next();
  }
  // If cookie exists and no override, continue
  if (proxyCookie && !forceOverride) {
    return context.next();
  }
  // Determine traffic routing
  const trafficRouting = forceOverride || (Math.random() <= TRAFFIC_PERCENTAGE ? "ssc" : "bb");
  // Set cookie for Test2 or when explicitly overridden
  if (trafficRouting === 'bb' || forceOverride === 'bb') {
    console.log('entered set');
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