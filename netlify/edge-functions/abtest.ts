import type { Context, Config } from "@netlify/edge-functions";
const BUCKET_COOKIE_NAME = "test_bucket";
const REDIRECT_URL = "https://www-silversea.uat.bbhosted.com";
const BUCKET_WEIGHTING = 0.5;
export default async (request: Request, context: Context) => {
  const existingBucket = context.cookies.get(BUCKET_COOKIE_NAME);
  if (existingBucket) {
    return existingBucket === 'b'
      ? Response.redirect(REDIRECT_URL, 301)
      : context.next();
  }
  const newBucket = Math.random() <= BUCKET_WEIGHTING ? "a" : "b";
  context.cookies.set({
    name: BUCKET_COOKIE_NAME,
    value: newBucket,
  });
  return newBucket === 'b'
    ? Response.redirect(REDIRECT_URL, 301)
    : context.next();
};
export const config: Config = {
  path: "/*",
};
