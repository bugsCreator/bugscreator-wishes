import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { generateWish, normalizeTone } from "@/lib/wish";
import styles from "./page.module.css";
import ClientHome from "./pageClient";

export const generateMetadata = async ({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }): Promise<Metadata> => {
  const sp = await searchParams;
  const name = (typeof sp?.name === 'string' ? sp.name : '').trim();
  const image = (typeof sp?.image === 'string' ? sp.image : '').trim();
  const baseTitle = siteConfig.name;
  const title = name ? `Happy Birthday, ${name}!` : baseTitle;
  const description = name ? generateWish(name, { tone: 'sweet' }).split("\n")[0] : siteConfig.description;
  const url = new URL(siteConfig.baseUrl);
  if (name) url.searchParams.set('name', name);
  return {
    title,
    description,
    alternates: { canonical: name ? `/` : `/` },
    openGraph: {
      title,
      description,
      url: name ? `/?name=${encodeURIComponent(name)}` : `/`,
      images: [
        {
          url: image || (name ? `/og.png?name=${encodeURIComponent(name)}` : "/og.png"),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || (name ? `/og.png?name=${encodeURIComponent(name)}` : "/og.png")],
    },
  };
};

export default function Home({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const nameParam = (typeof searchParams?.name === 'string' ? searchParams.name : '').trim();
  const toneParam = normalizeTone(typeof searchParams?.tone === 'string' ? searchParams.tone : 'sweet');
  const emojiParam = typeof searchParams?.emoji === 'string' ? searchParams.emoji : undefined;
  const fromParam = typeof searchParams?.from === 'string' ? searchParams.from : undefined;
  const imageParam = typeof searchParams?.image === 'string' ? searchParams.image : undefined;
  const notesParam = typeof searchParams?.notes === 'string' ? searchParams.notes : undefined;

  const wish = nameParam ? generateWish(nameParam, { tone: toneParam, emoji: emojiParam, from: fromParam }) : undefined;
  return (
    <ClientHome
      nameParam={nameParam}
      toneParam={toneParam}
      emojiParam={emojiParam}
      fromParam={fromParam}
      imageParam={imageParam}
      notesParam={notesParam}
      wish={wish}
    />
  );
}
 

function Balloons() {
  return (
    <div className={styles.balloons} aria-hidden>
      {new Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          className={styles.balloon}
          style={{ '--d': `${i * 0.45}s`, '--x': `${(i % 6) * 14}%` } as unknown as React.CSSProperties}
        >
          <div className={styles.string} />
        </div>
      ))}
    </div>
  );
}
