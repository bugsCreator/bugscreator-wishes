export const dynamic = 'force-static';

export function GET(req: Request) {
  const url = new URL(req.url);
  const name = (url.searchParams.get('name') || '').trim().slice(0, 40);
  const title = name ? `Happy Birthday, ${name}!` : 'Birthday Wish';
  const sub = name ? 'A sweet wish made just for you' : 'Create and share personalized birthday wishes';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="100%" stop-color="#a78bfa"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <g fill="#fff">
      <text x="60" y="220" font-size="88" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
      <text x="60" y="310" font-size="42" font-family="Segoe UI, Arial, sans-serif" opacity="0.95">${escapeXml(sub)}</text>
    </g>
    <g opacity="0.15">
      ${Array.from({length: 40}).map(() => {
        const x = Math.floor(Math.random()*1200);
        const y = Math.floor(Math.random()*630);
        const r = Math.floor(Math.random()*5)+2;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff"/>`;
      }).join('')}
    </g>
  </svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
