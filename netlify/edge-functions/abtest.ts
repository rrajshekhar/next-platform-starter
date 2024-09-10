import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];

export default async (request: Request, context: Context) => {


  const url = new URL(request.url);
  const path = url.pathname;
  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 1000*36000;
  const pastExpiryTime = time - 1000*36000;

  const forceOverride = url.searchParams.get("forceOverride");
  const proxyCookie = context.cookies.get(PROXY_COOKIE);

  if(forceOverride === 'ssc') {
    if(proxyCookie){
      context.cookies.set({
        name: PROXY_COOKIE,
        expiry : pastExpiryTime
      });
    }
    console.log(proxyCookie);
    console.log(context.cookies.get(PROXY_COOKIE));
    return context.next();
 }

  if(proxyCookie) {
      return context.next();
  }

  const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";


  if(forceOverride === 'bb' || trafficRouting === 'bb') {
    context.cookies.set({
      name: PROXY_COOKIE,
      value: trafficRouting,
      expires: expireTime
    });
  }
  return context.next();
};



function validateLanguage(path) {
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*",
  excludedPath: ["/_next*"]
};

