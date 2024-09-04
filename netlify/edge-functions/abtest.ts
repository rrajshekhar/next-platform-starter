import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['de','pt-br','es','fr'];

export default async (request: Request, context: Context) => {


  const url = new URL(request.url);
  const path = url.pathname;

  console.log("Path is");
 
   const forceOverride = url.searchParams.get("forceOverride");
   const redirectCookie = context.cookies.get(PROXY_COOKIE);

  if(TRANSCODING_URL === undefined || forceOverride === 'ssc' || isValidLanguagePath(path)) {
    console.log('entered path logic', path);
    if(redirectCookie){
      context.cookies.set({
        name: PROXY_COOKIE,
        value: "ssc",
      });
    }
    return context.next();
 }

  const redirectUrl =new URL(path, TRANSCODING_URL).toString();

  if(forceOverride === 'bb') {
     return redirect('bb', redirectUrl, context);
  }

  if(redirectCookie) {
      return redirect(redirectCookie, redirectUrl, context);
  }
  const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

  context.cookies.set({
    name: PROXY_COOKIE,
    value: trafficRouting,
    domain : 'ssc-preview-edge.netlify.app'
  });

  return redirect(trafficRouting, redirectUrl, context);
};

async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
  const headers = {
    'Content-Type' : 'text/html'
  };

  return isTranscoded === 'bb' ? await fetch(redirectUrl, {
    headers: headers,
  }): context.next();
 
}

function isValidLanguagePath(path) {
  console.log('enter valid language');
  return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
  path: "/*",
};

