"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import type { WishTone } from "@/lib/wish";

export default function ClientHome({
  nameParam,
  toneParam,
  emojiParam,
  fromParam,
  imageParam,
  notesParam,
  wish,
}: {
  nameParam: string;
  toneParam: WishTone;
  emojiParam?: string;
  fromParam?: string;
  imageParam?: string;
  notesParam?: string;
  wish?: string;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [tone, setTone] = useState<WishTone>(toneParam || "sweet");
  const [emoji, setEmoji] = useState<string>(emojiParam || "🎉");
  const [from, setFrom] = useState<string>(fromParam || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState<string>(notesParam || "");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Confetti burst only on landing (not on share page)
  useEffect(() => {
    if (nameParam) return; // no confetti on pure wish page
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      c: string;
      s: number;
      r: number;
    }[] = [];
    const colors = ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      for (let i = 0; i < 130; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 3,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * -6 - 2,
          c: colors[Math.floor(Math.random() * colors.length)],
          s: Math.random() * 6 + 4,
          r: Math.random() * Math.PI,
        });
      }
    };

    const step = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.vy += 0.15; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.r += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      });
      particles = particles.filter((p) => p.y < canvas.height + 40);
      raf = requestAnimationFrame(step);
    };

    spawn();
    step();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [nameParam]);

  const greeting = useMemo(() => {
    const n = nameParam || name;
    return n ? `Happy Birthday, ${n}!` : "Happy Birthday!";
  }, [name, nameParam]);

  const wishText = useMemo(() => wish, [wish]);

  // Typewriter animation for wish page
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (!nameParam || !wishText) {
      setTyped("");
      setIsTyping(false);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(wishText);
      setIsTyping(false);
      return;
    }
    setTyped("");
    setIsTyping(true);
    const chars = Array.from(wishText);
    let i = 0;
    let t: number | null = null;
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      i++;
      setTyped(chars.slice(0, i).join(""));
      if (i >= chars.length) {
        setIsTyping(false);
        return;
      }
      const ch = chars[i - 1];
      let delay = 36; // base pace
      if (ch === " ") delay = 18;
      if (",;:".includes(ch)) delay = 140;
      if (".!?".includes(ch)) delay = 220;
      t = window.setTimeout(step, delay);
    };
    t = window.setTimeout(step, 220); // small initial delay
    return () => {
      cancelled = true;
      if (t) window.clearTimeout(t);
    };
  }, [nameParam, wishText]);

  const onCreateCustom = useCallback(async () => {
    const trimmed = (name || nameParam).trim();
    if (!trimmed) return;
    try {
      setCreating(true);
      let res: Response;
      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("Image too large (max 5MB)");
          setCreating(false);
          return;
        }
        const form = new FormData();
        form.append("name", trimmed);
        form.append("tone", tone);
        form.append("emoji", emoji);
        if (from) form.append("from", from);
        if (notes) form.append("notes", notes);
        if (slug) form.append("slug", slug);
        form.append("image", imageFile);
        res = await fetch("/api/wishes", { method: "POST", body: form });
      } else {
        // No image provided; create wish without image
        res = await fetch("/api/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmed,
            tone,
            emoji,
            from,
            notes,
            slug: slug || undefined,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create wish");
      setShareUrl(data.url);
      setCopied(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create wish");
    } finally {
      setCreating(false);
    }
  }, [emoji, from, imageFile, name, nameParam, notes, slug, tone]);

  // cleanup preview object URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const onOpen = useCallback(() => {
    if (shareUrl) router.push(shareUrl);
  }, [router, shareUrl]);

  return (
    <div className={styles.wrapper}>
      {!nameParam && (
        <canvas ref={canvasRef} className={styles.confetti} aria-hidden />
      )}
      <div className={styles.hero}>
        <div
          className={`${styles.heroCard} ${
            nameParam ? styles.isWish : styles.isBuilder
          } card`}
        >
          <p className="sr-only">Birthday Wish</p>
          <h1 className={`${styles.title} ${nameParam ? styles.shimmer : ""}`}>
            {greeting}
          </h1>
          {nameParam ? (
            <div className={styles.previewArea}>
              {imageParam && (
                <Image
                  src={imageParam}
                  alt="Wish image"
                  width={800}
                  height={600}
                  className={styles.previewImage}
                />
              )}
              <p
                className={`${styles.subtitle} ${styles.typing} ${styles.wishText}`}
                style={{ whiteSpace: "pre-line" }}
                aria-live="polite"
              >
                {typed || "\u00A0"}
                <span className={`${styles.caret} ${!isTyping ? styles.caretDone : ""}`} aria-hidden />
              </p>
              {notesParam && (
                <div className={styles.notes}>
                  <strong>Notes:</strong> {notesParam}
                </div>
              )}
              <div className={styles.actionsRow}>
                <button className="btn" type="button" onClick={() => router.push('/')}>Craft New Wish</button>
              </div>
            </div>
          ) : (
            <p className={styles.subtitle} style={{ whiteSpace: "pre-line" }}>
              {wishText ||
                "Type a name and create a sweet birthday wish to share."}
            </p>
          )}

          {!nameParam ? (
            <>
              <form
                className={styles.form}
                onSubmit={(e) => e.preventDefault()}
              >
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  placeholder="Type a name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />

                <select
                  aria-label="Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as WishTone)}
                  className={styles.input}
                  style={{ width: "auto" }}
                >
                  <option value="sweet">Sweet</option>
                  <option value="fun">Fun</option>
                  <option value="poetic">Poetic</option>
                </select>

                <input
                  aria-label="Emoji"
                  placeholder="Emoji"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className={styles.input}
                  style={{ width: 90, textAlign: "center" }}
                />
                <input
                  aria-label="From"
                  placeholder="From (optional)"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={styles.input}
                  style={{ width: 180 }}
                />
                <div className={styles.uploadRow}>
                  <input
                    id="imageUpload"
                    aria-label="Upload image"
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setImageFile(f);
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                  <label htmlFor="imageUpload" className={styles.uploadButton}>
                    <span aria-hidden>📷</span> Upload image (max 5MB)
                  </label>
                  {imageFile && (
                    <div className={styles.uploadInfo} title={imageFile.name}>
                      {imageFile.name} • {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <div className={styles.uploadPreviewWrap}>
                    <Image src={imagePreview} alt="Preview" width={320} height={200} className={styles.uploadPreview} />
                  </div>
                )}
                <input
                  aria-label="Custom URL (slug)"
                  placeholder="Custom URL (optional)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={styles.input}
                  style={{ width: 220 }}
                />
                <input
                  aria-label="Notes"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.input}
                  style={{ width: 320 }}
                />
                <button
                  className="btn secondary"
                  onClick={onCreateCustom}
                  type="button"
                  disabled={creating}
                >
                  {creating ? "Crafting…" : "Craft My Wish"}
                </button>
              </form>
              {shareUrl && (
                <div className={styles.shareBar}>
                  <input
                    className={styles.shareInput}
                    value={shareUrl}
                    readOnly
                    aria-label="Shareable link"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <div className={styles.shareActions}>
                    <button className="btn" type="button" onClick={onCopy}>
                      {copied ? "✅ Copied" : "Copy link"}
                    </button>
                    <button className="btn secondary" type="button" onClick={onOpen}>
                      Open wish
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
        {/* {nameParam && <Balloons />} */}
      </div>
      {!nameParam && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>A little sprinkle of love</h2>
          <div className={styles.grid}>
            {[
              {
                title: "Sweet Colors",
                text: "Soft pastels to warm the heart.",
              },
              {
                title: "Gentle Motion",
                text: "Floating balloons and cozy sparkle.",
              },
              { title: "Shareable", text: "Personalize a name and celebrate!" },
            ].map((c, i) => (
              <article key={i} className={`card ${styles.card}`}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Balloons() {
  return (
    <div className={styles.balloons} aria-hidden>
      {new Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          className={styles.balloon}
          style={
            {
              "--d": `${i * 0.45}s`,
              "--x": `${(i % 6) * 14}%`,
            } as unknown as React.CSSProperties
          }
        >
          <div className={styles.string} />
        </div>
      ))}
    </div>
  );
}

// EmojiRain removed for now; can be added back when styles are ready
