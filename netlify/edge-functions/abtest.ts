


import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? “0.5”);
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;
  const proxyCookie = context.cookies.get(PROXY_COOKIE);
  const forceOverride = url.searchParams.get("forceOverride");

  if (validateLanguage(path) || forceOverride === 'ssc') {
    if (proxyCookie) {
      context.cookies.delete(PROXY_COOKIE);
    }
    const response = await context.next({ sendConditionalRequest: true })
    return response;
  }
  
  if(!proxyCookie) {
  const trafficRouting = forceOverride || (Math.random() <= TRAFFIC_PERCENTAGE ? "ssc" : "bb");
  if ((trafficRouting === 'bb' || forceOverride === 'bb')) {
    context.cookies.set({
      name: PROXY_COOKIE,
      value: trafficRouting,
      expires: new Date(expireTime),
    });
  }};
  const response = await context.next({ sendConditionalRequest: true })
  return response;
};

function validateLanguage(path) {
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*",
  excludedPath: ["/*.css", "/*.js","/*.svg"]
};
