import type { Context, Config } from "@netlify/edge-functions";
import { cookies } from "next/headers";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];

export default async (request: Request, context: Context) => {


  const url = new URL(request.url);
  const path = url.pathname;

  const forceOverride = url.searchParams.get("forceOverride");
  const proxyCookie = context.cookies.get(PROXY_COOKIE);

  if(forceOverride === 'ssc') {
    if(proxyCookie){
      context.cookies.delete(PROXY_COOKIE);
    }
    return context.next();
 }

  if(proxyCookie) {
      return context.next();
  }

  console.log('this is messed up');

  const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 1000*36000;


  if(forceOverride === 'bb' || trafficRouting === 'bb') {
    context.cookies.set({
      name: PROXY_COOKIE,
      value: trafficRouting,
      domain : 'ssc-preview-edge.netlify.app',
      expires: expireTime
    });
  }
};

function validateLanguage(path) {
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*",
  excludedPath: ["/_next*"]
};

