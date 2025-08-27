
export const dynamic = 'force-static';

export function GET() {
  const manifest = {
    name: 'Birthday Wish',
    short_name: 'BdayWish',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
