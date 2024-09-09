import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];

export default async (request: Request, context: Context) => {


  const url = new URL(request.url);
  const path = url.pathname;

  const forceOverride = url.searchParams.get("forceOverride");
  const proxyCookie = context.cookies.get(PROXY_COOKIE);

  if(TRANSCODING_URL === undefined || validateLanguage(path) || forceOverride === 'ssc') {
    if(proxyCookie){
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "ssc",
      });
    }
    return context.next();
 }

  const proxyUrl =new URL(path, TRANSCODING_URL).toString();

  if(forceOverride === 'bb') {
     return redirect('bb', proxyUrl, context);
  }

  if(proxyCookie) {
      return redirect(proxyCookie, proxyUrl, context);
  }
  const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 1000*36000;


  context.cookies.set({
    name: PROXY_COOKIE,
    value: trafficRouting,
    domain : '.ssc-preview-edge.netlify.app',
    expires: expireTime
  });

  return redirect(trafficRouting, proxyUrl, context);
};

async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
   const headers = {
     'Content-Type' : 'text/html',
     'X-Replaced-Path' : 'test'
  };

  return isTranscoded === 'bb' ? await fetch(redirectUrl, {
    headers: headers,
  }): context.next();
 
}

function validateLanguage(path) {
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*"
};

