import type { Context, Config } from "@netlify/edge-functions";

const PROXY_COOKIE = "edge_proxy";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de', '/pt-br', '/es', '/fr'];

const newSite = "bb";
const oldSite = "ssc";
export default async (request: Request, context: Context) => {


    const url = new URL(request.url);
    const path = url.pathname;
    const proxyCookie = context.cookies.get(PROXY_COOKIE);

    const proxyUrl = new URL(path, TRANSCODING_URL).toString();

    // Sample for expiry
    const now = new Date();
    const time = now.getTime();
    const expireTime = time + 1000 * 36000;

    const forceOverride = url.searchParams.get("forceOverride");

    if (!proxyCookie) {
        if (TRANSCODING_URL === undefined || validateLanguage(path) || forceOverride === oldSite) {
            return context.next();
        }
        const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? oldSite : newSite;
        setCookie(context, trafficRouting, expireTime);
        return redirect(trafficRouting, proxyUrl, context);
    }

    if (proxyCookie === newSite) {
        if (validateLanguage(path) || forceOverride === 'ssc') {
            setCookie(context, 'ssc', new Date(0));
        }
        return;
    } else {
        if (forceOverride === 'bb') {
            setCookie(context, 'bb', expireTime);
        }
        return;
    }
};


function setCookie(context: Context, trafficRouting: string, expireTime: number | string | Date) {
    context.cookies.set({
        name: PROXY_COOKIE,
        value: trafficRouting,
        expires: expireTime,
        path: '/',
    });
}

async function redirect(isTranscoded: string, redirectUrl: string, context: Context) {
    const headers = {
        'Content-Type': 'text/html'
    };

    return isTranscoded === 'bb' ? await fetch(redirectUrl, {
        headers: headers,
    }) : context.next();

}

function validateLanguage(path) {
    return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
    path: "/*"
};

