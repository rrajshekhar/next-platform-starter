import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de', '/pt-br', '/es', '/fr'];

const newSite = 'bb';
const oldSite = 'ssc';

export default async (request: Request, context: Context) => {


    const url = new URL(request.url);
    const path = url.pathname;

    const forceOverride = url.searchParams.get("forceOverride");
    const proxyCookie = context.cookies.get(PROXY_COOKIE);
    const edgeCookie = context.cookies.get('edge_ssc');

    const now = new Date();
    now.setFullYear(now.getFullYear()+1);
    const expireTime = now.getTime();

    if (TRANSCODING_URL === undefined || validateLanguage(path) || forceOverride === oldSite) {
        console.log('entered override for ssc',request.url, proxyCookie, edgeCookie);
            if(!edgeCookie){
                context.cookies.set({
                    name: 'edge_ssc',
                    value: oldSite,
                    expires: expireTime,
                    path: '/',
                });
            }
                if(proxyCookie){
                    context.cookies.set({
                        name: PROXY_COOKIE,
                        value: newSite,
                        expires: new Date(0),
                        path: '/',
                    });
                }
    }

    if (forceOverride === newSite) {
        console.log('entered override for bb',request.url, proxyCookie, edgeCookie);
        if (!proxyCookie) {
            context.cookies.set({
                name: PROXY_COOKIE,
                value: newSite,
                expires: expireTime,
                path: '/',
            });
        }
            if (edgeCookie) {
                context.cookies.set({
                    name: 'edge_ssc',
                    value: oldSite,
                    expires: new Date(0),
                    path: '/',
                });
            }
    } 

    const proxyUrl = new URL(path, TRANSCODING_URL).toString();

    if (proxyCookie || edgeCookie) {
        return context.next();
    }

    console.log('entered the routing logic',request.url,proxyCookie,edgeCookie);

    //const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? oldSite : newSite;

    //if (trafficRouting === 'bb') {
        context.cookies.set({
            name: PROXY_COOKIE,
            value: 'bb',
            expires: expireTime,
            path: '/',
        });
    //}
    // else {
    //     context.cookies.set({
    //         name: 'edge_ssc',
    //         value: trafficRouting,
    //         expires: expireTime,
    //         path: '/',
    //     });

    // }

    return redirect('bb', proxyUrl, context);
};

async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
    const headers = {
        'Content-Type': 'text/html'
    };

    return isTranscoded === newSite ? await fetch(redirectUrl, {
        headers: headers,
    }) : context.next();

}

function validateLanguage(path) {
    return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
    path: "/*",
    excludedPath: ["/*.css", "/*.js","/*png","*.webmanifest"]
};