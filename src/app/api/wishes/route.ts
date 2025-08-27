import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWish, normalizeTone } from '@/lib/wish';

type Payload = {
  name?: string;
  tone?: string;
  emoji?: string;
  from?: string;
  notes?: string;
  image?: string; // data URL only when not using multipart
  slug?: string;
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: Payload = {};
    let file: File | undefined;
    if (contentType.includes('application/json')) {
      payload = await req.json();
  } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const mapped: Payload = {
        name: (form.get('name') as string | null) || undefined,
        tone: (form.get('tone') as string | null) || undefined,
        emoji: (form.get('emoji') as string | null) || undefined,
        from: (form.get('from') as string | null) || undefined,
        notes: (form.get('notes') as string | null) || undefined,
    image: (form.get('image') as string | null) || undefined,
        slug: (form.get('slug') as string | null) || undefined,
      };
      payload = mapped;
      const maybeFile = form.get('image');
      if (maybeFile instanceof File) file = maybeFile;
    } else {
      return Response.json({ error: 'Unsupported content type' }, { status: 415 });
    }

    const name = (payload.name || '').toString().trim();
    if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });
    const tone = normalizeTone((payload.tone || 'sweet').toString());
    const emoji = (payload.emoji || '🎉').toString();
    const from = (payload.from || '').toString().trim() || undefined;
    const notes = (payload.notes || '').toString().trim() || undefined;

    let imageUrl: string | undefined;
    // If file provided, validate and convert to data URL. Else accept data URL string.
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return Response.json({ error: 'Image too large (max 5MB)' }, { status: 413 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const mime = file.type || 'image/png';
      const base64 = buf.toString('base64');
      imageUrl = `data:${mime};base64,${base64}`;
    } else {
      const image = payload.image?.toString() || '';
      if (image) {
        if (!image.startsWith('data:')) {
          return Response.json({ error: 'Only data URLs supported when not using multipart' }, { status: 400 });
        }
        const size = Math.ceil((image.length * 3) / 4) - (image.endsWith('==') ? 2 : image.endsWith('=') ? 1 : 0);
        if (size > 5 * 1024 * 1024) {
          return Response.json({ error: 'Image too large (max 5MB)' }, { status: 413 });
        }
        imageUrl = image;
      }
    }

    // Generate content
    const content = generateWish(name, { tone, emoji, from });

    // Create a slug unique id
    // desired slug if provided
  const desired = (payload.slug || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48);
    const base = desired || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'wish';
    let slug = base;
    let suffix = 0;
    while (true) {
      const exists = await prisma.wish.findUnique({ where: { slug } });
      if (!exists) break;
      suffix += 1;
      slug = `${base}-${suffix}`;
      if (suffix > 1000) break; // safety
    }

    const saved = await prisma.wish.create({
      data: { name, tone, emoji, from, notes, imageUrl, content, slug },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/wish/${saved.slug}`;
    return Response.json({ slug: saved.slug, url }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 500 });
  }
}
