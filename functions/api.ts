import { photoPaths } from './_shared/photos';

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

  if (photoPaths.length === 0) {
    return Response.json({ error: 'No images found. Add images to public/photos/.' }, { status: 404 });
  }

  const photo = photoPaths[Math.floor(Math.random() * photoPaths.length)];
  const location = new URL(photo, request.url).toString();

  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store',
      Location: location,
    },
  });
}
