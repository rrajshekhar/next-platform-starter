import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRAFFIC_PERCENTAGE") ?? "0.1");
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const now = new Date();
  const expireTime = now.getTime() + 1000 * 36000;
  const proxyCookie = context.cookies.get(PROXY_COOKIE);
  const forceOverride = url.searchParams.get("forceOverride");

  console.log('request url is ', url);
  console.log('path is', path);

  if (validateLanguage(path) || forceOverride === 'ssc') {
    while (proxyCookie) {
      context.cookies.delete(PROXY_COOKIE);
      console.log('proxy cookie is', proxyCookie);
    }
    return context.next();
  }
  
  if(!proxyCookie) {
  const trafficRouting = forceOverride || (Math.random() <= TRAFFIC_PERCENTAGE ? "ssc" : "bb");
  if ((trafficRouting === 'bb' || forceOverride === 'bb')) {
    console.log('entered set');
    context.cookies.set({
      name: PROXY_COOKIE,
      value: trafficRouting,
      expires: new Date(expireTime),
    });
  }};
  return context.next();
};

function validateLanguage(path) {
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*",
  excludedPath: ["/_next/*","/*.css", "/*.js","/*.svg"]
};