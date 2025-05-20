import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new Response('Missing `url` parameter', { status: 400 });
  }

  try {
    const res = await fetch(url);
    const icsText = await res.text();

    return new Response(icsText, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error fetching iCal file:', err);
    return new Response('Failed to fetch iCal file', { status: 500 });
  }
}
