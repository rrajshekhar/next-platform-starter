import type { Context, Config } from "@netlify/edge-functions";
const BUCKET_COOKIE_NAME = "test_redirect";
const REDIRECT_URL = "https://www-silversea.uat.bbhosted.com";
const BUCKET_WEIGHTING = Netlify.env.get("BUCKET_WEIGHTING");
export default async (request: Request, context: Context) => {
  let url = new URL(request.url);
  const forceOverride = url.searchParams.get("forceOverride");
  if(forceOverride === 'bb') {
     return Response.redirect(REDIRECT_URL, 301)
  }
  if(forceOverride === 'ssc') {
     return context.next();
  }
  const existingBucket = context.cookies.get(BUCKET_COOKIE_NAME);
  if (existingBucket) {
    return existingBucket === 'bb'
      ? Response.redirect(REDIRECT_URL, 301)
      : context.next();
  }
  const newBucket = Math.random() <= BUCKET_WEIGHTING ? "ssc" : "bb";
  context.cookies.set({
    name: BUCKET_COOKIE_NAME,
    value: newBucket,
  });
  return newBucket === 'bb'
    ? Response.redirect(REDIRECT_URL, 301)
    : context.next();
};
export const config: Config = {
  path: "/*",
};
