import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de','/pt-br','/es','/fr'];

export default async (request: Request, context: Context) => {


//   const url = new URL(request.url);
//   const path = url.pathname;

//   const forceOverride = url.searchParams.get("forceOverride");
//   const proxyCookie = context.cookies.get(PROXY_COOKIE);

//    // Sample for expiry
//    const now = new Date();
//    const time = now.getTime();
//    const expireTime = time + 1000*36000;

//   if(TRANSCODING_URL === undefined || validateLanguage(path) || forceOverride === 'ssc') {
//     if(proxyCookie){
//       context.cookies.set({
//         name: PROXY_COOKIE,
//         value: "ssc",
//         expires: expireTime
//       });
//     }
//     return;
//  }

//   const proxyUrl =new URL(path, TRANSCODING_URL).toString();

//   if(forceOverride === 'bb') {
//     context.cookies.set({
//       name: PROXY_COOKIE,
//       value: "bb",
//       expires: expireTime
//     });
//     return context.next();
//   }

//   if(proxyCookie) {
//       return context.next();
//   }
//   const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? "ssc" : "bb";

//   context.cookies.set({
//     name: PROXY_COOKIE,
//     value: trafficRouting,
//     expires: expireTime
//   });

//   return context.next();
// };

// // async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
// //   return isTranscoded === 'bb' ? 
// //   context.redirect(redirectUrl, 200): context.next();
 
// //}

// function validateLanguage(path) {
//   return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
// }

}

export const config: Config = {
  path: "/*"
};

