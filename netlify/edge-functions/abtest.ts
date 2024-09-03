import type { Context, Config } from "@netlify/edge-functions";

const REDIRECT_COOKIE = "edge_redirect";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);

export default async (request: Request, context: Context) => {


  const url = new URL(request.url);
  const path = url.pathname;
 
   const forceOverride = url.searchParams.get("forceOverride");
   const redirectCookie = context.cookies.get(REDIRECT_COOKIE);

  if(TRANSCODING_URL === undefined || forceOverride === 'ssc' || path.startsWith('de')|| path.startsWith('pt-br') || path.startsWith('es') || path.startsWith('fr')) {
    console.log('entered path logic', path)
    if(redirectCookie){
      context.cookies.set({
        name: REDIRECT_COOKIE,
        value: 'ssc',
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
  const isTrancoded = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

  context.cookies.set({
    name: REDIRECT_COOKIE,
    value: isTrancoded,
  });

  return redirect(isTrancoded, redirectUrl, context);
};

async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
  const headers = {
    'Content-Type' : 'text/html'
  };

  return isTranscoded === 'bb' ? await fetch(redirectUrl, {
    headers: headers,
  }): context.next();
 
}

export const config: Config = {
  path: "/*",
};

