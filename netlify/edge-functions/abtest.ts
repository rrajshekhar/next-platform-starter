import type { Context, Config } from "@netlify/edge-functions";

const REDIRECT_COOKIE = "edge_redirect";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);

export default async (request: Request, context: Context) => {

  const url = new URL(request.url);
  const path = url.pathname;

  const forceOverride = url.searchParams.get("forceOverride");

  if(TRANSCODING_URL === undefined || forceOverride === 'ssc') {
    return context.next();
 }

  const redirectUrl =new URL(path, TRANSCODING_URL).toString();

  if(forceOverride === 'bb') {
     return Response.redirect(redirectUrl, 301);
  }

  const redirectCookie = context.cookies.get(REDIRECT_COOKIE);

  if(redirectCookie) {
      return redirect(redirectCookie, redirectUrl, context);
  }
  const isTrancoded = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

  context.cookies.set({
    name: REDIRECT_COOKIE,
    value: isTrancoded,
  });

  return redirect(isTrancoded, redirectUrl, context);
};

function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
  return isTranscoded === 'bb' ? Response.redirect(redirectUrl, 301) : context.next();
 }

export const config: Config = {
  path: "/*",
};

