import type { Context, Config } from "@netlify/edge-functions";

const BB_PROXY_COOKIE = "edge_bb";
const SSC_PROXY_COOKIE = "edge_ssc";
const TRANSCODING_URL = Netlify.env.get("TRANSCODING_URL");
const TRAFFIC_PERCENTAGE_VALUE = Netlify.env.get("SSC_TRAFFIC_PERCENTAGE");

const SSC_TRAFFIC_PERCENTAGE = TRAFFIC_PERCENTAGE_VALUE
  ? parseFloat(TRAFFIC_PERCENTAGE_VALUE)
  : undefined;

const BLOCKED_PATHS = [
  "/de/",
  "/pt-br/",
  "/es/",
  "/fr/",
  "/de.html",
  "/pt-br.html",
  "/es.html",
  "/fr.html"
];

type UserSegment = "bb" | "ssc";
const isActive = stringPresent(TRANSCODING_URL) && SSC_TRAFFIC_PERCENTAGE;

// eslint-disable-next-line import/no-unused-modules
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const userAgent = request.headers.get("user-agent");

  if (isAgentBrandingBrand(userAgent) || !isActive || isExcludedPath(path)) {
    console.info("Not active or excluded path", { isActive, path });
    cleanupProxyCookie(context);
    return context.next();
  }

  const forcedValue = url.searchParams.get(
    "forceOverride"
  ) as UserSegment | null;
  const segmentFromCookie = getSegmentFromCookie(context);

  const requestSegment =
    forcedValue || segmentFromCookie || computeRandomSegment();

  if (requestSegment === "bb") {
    const transcodedUrl = new URL(path, TRANSCODING_URL).toString();

    setSegmentCookie(context, "bb");

    try {
      console.info("Fetching transcoded URL", transcodedUrl);
      return await fetch(transcodedUrl, {
        headers: {
          "Content-Type": "text/html"
        }
      });
    } catch (error) {
      console.error("Error fetching transcoded URL", error);

      setSegmentCookie(context, "ssc");
      return context.next();
    }
  }

  // render the default website
  setSegmentCookie(context, "ssc");
  return context.next();
};

function isExcludedPath(path) {
  return BLOCKED_PATHS.some((languages) => path.startsWith(languages));
}

const computeRandomSegment = () => {
  if (!SSC_TRAFFIC_PERCENTAGE) {
    return "ssc";
  }

  return Math.random() <= SSC_TRAFFIC_PERCENTAGE ? "ssc" : "bb";
};

const cleanupProxyCookie = (context: Context) => {
  setSegmentCookie(context, "ssc");
};

function isAgentBrandingBrand(userAgent: string | null | undefined): boolean {
  return userAgent?.includes("BrandingBrand") ?? false;
}

const getSegmentFromCookie = (context: Context): UserSegment | undefined => {
  const proxyCookie = context.cookies.get(BB_PROXY_COOKIE);
  const edgeCookie = context.cookies.get(SSC_PROXY_COOKIE);

  if (edgeCookie) {
    return "ssc";
  }

  if (proxyCookie) {
    return "bb";
  }

  return undefined;
};

const setSegmentCookie = (context: Context, segment: UserSegment) => {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 1);
  const expireTime = now.getTime();

  const cookieNameToSet = segment === "bb" ? BB_PROXY_COOKIE : SSC_PROXY_COOKIE;
  const cookieNameToDelete =
    segment === "bb" ? SSC_PROXY_COOKIE : BB_PROXY_COOKIE;

  context.cookies.delete({
    name: cookieNameToDelete,
    path: "/",
    domain: ".silversea.com"
  });
  context.cookies.set({
    name: cookieNameToSet,
    value: segment,
    expires: expireTime,
    path: "/",
    domain: ".silversea.com"
  });
};

function stringPresent(content: string | null | undefined): content is string {
  if (content == null || content == undefined) return false;

  return content.trim() != "";
}

// eslint-disable-next-line import/no-unused-modules
export const config: Config = {
  path: isActive ? "/*" : undefined,
  excludedPath: [
    "/*.css",
    "/*.js",
    "/*.map",
    "/*.json",
    "/*.webmanifest",
    "/*.png",
    "/*.svg",
    "/*.php",
    "/static/*"
  ]
};