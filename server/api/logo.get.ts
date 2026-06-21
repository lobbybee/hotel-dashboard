// Proxies a hotel logo from S3 so the browser can fetch it same-origin (S3 sends no CORS headers).
// Locked to the media bucket to avoid an open proxy / SSRF.
const ALLOWED_HOST = 'lobbybee-media.s3.amazonaws.com';

export default defineEventHandler(async (event) => {
  const url = getQuery(event).url as string;
  if (!url || new URL(url).host !== ALLOWED_HOST) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid logo url' });
  }
  const res = await fetch(url);
  if (!res.ok) throw createError({ statusCode: res.status, statusMessage: 'Logo fetch failed' });

  setHeader(event, 'Content-Type', res.headers.get('content-type') || 'image/jpeg');
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  return Buffer.from(await res.arrayBuffer());
});
