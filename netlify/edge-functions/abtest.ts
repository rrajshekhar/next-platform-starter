import type { Context, Config } from "@netlify/edge-functions";

const CURRENT_COOKIE = "edge_ssc";
const NEW_COOKIE = "edge_bb";
const TRANSCODING_TRAFFIC_PERCENTAGE = parseFloat(Netlify.env.get("TRANSCODING_TRAFFIC_PERCENTAGE") ?? 1);
const UNSUPPORTED_LANGUAGES = ['/de/', '/pt-br/', '/es/', '/fr/'];

const newSite = 'bb';
const oldSite = 'ssc';

export default async (request: Request, context: Context) => {


    const url = new URL(request.url);
    const path = url.pathname;

    const forceOverride = url.searchParams.get("forceOverride");
    const newCookieValue = context.cookies.get(NEW_COOKIE);
    const oldCookieValue = context.cookies.get(CURRENT_COOKIE);

    const now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    const expireTime = now.getTime();

    if (validateLanguage(path) || forceOverride === oldSite) {
        //console.log('entered override for ssc',request.url, proxyCookie, edgeCookie);
        if (!oldCookieValue) {
            setCookies(context, CURRENT_COOKIE, oldSite, expireTime);
        }
        if (newCookieValue) {
            setCookies(context, NEW_COOKIE, newSite, new Date(0));
        }
    }

    if (forceOverride === newSite) {
        //console.log('entered override for bb',request.url, proxyCookie, edgeCookie);
        if (!newCookieValue) {
            setCookies(context, NEW_COOKIE, newSite, expireTime);
        }
        if (oldCookieValue) {
            setCookies(context, CURRENT_COOKIE, oldSite, new Date(0));
        }
    }

    if (newCookieValue || oldCookieValue) {
        return context.next();
    }

    //console.log('entered the routing logic',request.url,proxyCookie,edgeCookie);

    const trafficRouting = Math.random() <= TRANSCODING_TRAFFIC_PERCENTAGE ? oldSite : newSite;

    if (trafficRouting === newSite) {
        setCookies(context, NEW_COOKIE, trafficRouting, expireTime);
    }
    else {
        setCookies(context, CURRENT_COOKIE, trafficRouting, expireTime);

    }

    return;
};

function setCookies(context: Context, cookieName: string, cookieValue: string, expireTime: number | Date) {
    context.cookies.set({
        name: cookieName,
        value: cookieValue,
        expires: expireTime,
        path: '/',
    });
}

function validateLanguage(path) {
    return UNSUPPORTED_LANGUAGES.some(languages => path.startsWith(languages))
}

export const config: Config = {
    path: "/*",
    excludedPath: ["/*.css", "/*.js", "/*png", "*.webmanifest"]
};