import type { Context, Config } from "@netlify/edge-functions";
const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? "1");
const UNSUPPORTED_LANGUAGES = ['/de', '/pt-br', '/es', '/fr'];
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const forceOverride = url.searchParams.get("forceOverride");
  const proxyCookie = context.cookies.get(PROXY_COOKIE);
  // Sample for expiry
  const now = new Date();
  const time = now.getTime();
  const expireTime = time + 1000 * 36000;
  if (URL === undefined || validateLanguage(path) || forceOverride === 'ssc') {
    context.cookies.set({
      name: PROXY_COOKIE,
      value: "ssc",
      expires: new Date(expireTime)
    });
    return context.next();
  }
  const proxyUrl = new URL(path, TRANSCODING_URL).toString();
  if (forceOverride === 'bb') {
    return silentRedirect('bb', proxyUrl, context);
  }
  if (proxyCookie) {
    return silentRedirect(proxyCookie, proxyUrl, context);
  }
  const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";
  context.cookies.set({
    name: PROXY_COOKIE,
    value: trafficRouting,
    expires: new Date(expireTime)
  });
  return silentRedirect(trafficRouting, proxyUrl, context);
};
async function silentRedirect(isTranscoded: string, redirectUrl: string, context: Context) {
  if (isTranscoded === 'bb') {
    try {
      const response = await fetch(redirectUrl,{mode: 'no-cors'});
      const contentType = response.headers.get('content-type');
      const body = await response.text();
      return new Response(body, {
        headers: { 'content-type': contentType ?? 'text/html' },
        status: response.status,
      });
    } catch (error) {
      console.error('Error fetching redirect URL:', error);
      return context.next();
    }
  } else {
    return context.next();
  }
}
function validateLanguage(path: string) {
  return UNSUPPORTED_LANGUAGES.some(language => path.startsWith(language));
}
export const config: Config = {
  path: "/*"
};