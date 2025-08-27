import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ClientHome from '@/app/pageClient';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wish = await prisma.wish.findUnique({ where: { slug: params.slug } });
  if (!wish) return { title: 'Wish not found' };
  const title = `Happy Birthday, ${wish.name}!`;
  return {
    title,
    description: wish.content.slice(0, 140),
    openGraph: {
      title,
      description: wish.content.slice(0, 200),
      url: `/wish/${wish.slug}`,
      images: [{ url: `/og.png?name=${encodeURIComponent(wish.name)}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: wish.content.slice(0, 200),
      images: [`/og.png?name=${encodeURIComponent(wish.name)}`],
    },
  };
}

export default async function WishPage({ params }: Props) {
  const w = await prisma.wish.findUnique({ where: { slug: params.slug } });
  if (!w) {
    return <div style={{ padding: 24 }}>Wish not found.</div>;
  }
  return (
    <ClientHome
      nameParam={w.name}
      toneParam={(w.tone as 'sweet' | 'fun' | 'poetic') || 'sweet'}
      emojiParam={w.emoji || undefined}
      fromParam={w.from || undefined}
      imageParam={w.imageUrl || undefined}
      notesParam={w.notes || undefined}
      wish={w.content}
    />
  );
}
