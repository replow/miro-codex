import { photoEntries } from './_shared/photos';

interface PagesRequestContext {
  request: Request;
}

export function onRequest({ request }: PagesRequestContext): Response {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  if (photoEntries.length === 0) {
    return Response.json({ error: 'No images found. Add images to public/photos/.' }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const orientationParam = searchParams.get('orientation')?.trim().toLowerCase();
  const orientationAliases = { landscape: 'landscape', portrait: 'portrait', square: 'square', long: 'landscape', short: 'portrait' };
  const requestedOrientation = orientationParam
    ? orientationAliases[orientationParam as keyof typeof orientationAliases] || null
    : searchParams.has('long') || searchParams.has('landscape')
      ? 'landscape'
      : searchParams.has('short') || searchParams.has('portrait')
        ? 'portrait'
        : searchParams.has('square')
          ? 'square'
          : null;

  if (orientationParam && !requestedOrientation) {
    return Response.json({ error: 'Invalid orientation. Use landscape, portrait, or square.' }, { status: 400 });
  }
  const requestedName = searchParams.get('name')?.trim().toLowerCase();

  let candidates = requestedOrientation
    ? photoEntries.filter(({ orientation }) => orientation === requestedOrientation)
    : [...photoEntries];

  if (requestedName) {
    candidates = candidates.filter(({ path }) => decodeURIComponent(path.split('/').pop() || '').toLowerCase() === requestedName);
  }

  if (candidates.length === 0) {
    return Response.json({ error: 'No images match the requested filter.' }, { status: 404 });
  }

  const photo = candidates[Math.floor(Math.random() * candidates.length)].path;
  const location = new URL(photo, request.url).toString();

  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store',
      Location: location,
    },
  });
}
