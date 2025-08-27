export type WishTone = 'sweet' | 'fun' | 'poetic';

export function generateWish(
  name: string,
  opts?: { tone?: WishTone; emoji?: string; from?: string }
): string {
  const tone = opts?.tone ?? 'sweet';
  const e = opts?.emoji ?? '🎉';
  const from = opts?.from?.trim();

  const intro = {
    sweet: `Happy Birthday, ${name}! ${e} Today is all about you—may your heart feel full and your smile shine bright.`,
    fun: `Hey ${name}! ${e} Another lap around the sun—queue the cake, laughs, and zero responsibilities!`,
    poetic: `Dearest ${name}, ${e} on this day, the sky hums softly and time pauses to celebrate you.`,
  }[tone];

  const middle = {
    sweet: `Wishing you cuddly moments, sweet surprises, and memories that wrap you up like a warm hug.`,
    fun: `May your day be packed with confetti moments, inside jokes, and happy chaos that makes the best stories.`,
    poetic: `May joy fall like petals at your feet, and may gentle light follow every step you take this year.`,
  }[tone];

  const close = {
    sweet: `You’re loved more than you know—here’s to a beautiful year ahead! ${e}`,
    fun: `Level up unlocked—go be awesome and save me some cake! ${e}`,
    poetic: `Here’s to your radiant journey ahead—soft, bright, and wonderfully you. ${e}`,
  }[tone];

  const signature = from ? `\n\nWith love,\n${from}` : '';
  return `${intro}\n\n${middle}\n\n${close}${signature}`;
}

const tones = ['sweet', 'fun', 'poetic'] as const;
type ToneLiteral = typeof tones[number];
export function normalizeTone(val?: string | null): WishTone {
  const t = (val || '').toLowerCase();
  return (tones as readonly string[]).includes(t) ? (t as ToneLiteral) : 'sweet';
}
