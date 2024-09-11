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
            if(!edgeCookie){
                context.cookies.set({
                    name: 'edge_ssc',
                    value: oldSite,
                    expires: expireTime,
                    path: '/',
                });
                context.cookies.delete(PROXY_COOKIE);
                return;
            }   
        return;
    }

    if (forceOverride === newSite) {
        if(!proxyCookie){
            context.cookies.set({
                name: PROXY_COOKIE,
                value: newSite,
                expires: expireTime,
                path: '/',
            });
            context.cookies.delete('edge_ssc')
            return;
        }
       
        return;
    } 

    const proxyUrl = new URL(path, TRANSCODING_URL).toString();

    if (proxyCookie || edgeCookie) {
        return redirect(proxyCookie, proxyUrl, context);
    }

    const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? oldSite : newSite;

    if (trafficRouting === 'bb') {
        context.cookies.set({
            name: PROXY_COOKIE,
            value: trafficRouting,
            expires: expireTime,
            path: '/',
        });
    }
    else {
        context.cookies.set({
            name: 'edge_ssc',
            value: trafficRouting,
            expires: expireTime,
            path: '/',
        });

    }
    

    return redirect(trafficRouting, proxyUrl, context);
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
    path: "/*"
};