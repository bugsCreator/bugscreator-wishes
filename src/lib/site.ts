// Central site/SEO config to keep metadata consistent
export const siteConfig = {
  name: "Birthday Wish",
  shortName: "BdayWish",
  description:
    "Create and share personalized birthday wishes instantly with beautiful messages.",
  keywords: [
    "birthday",
    "wish",
    "greetings",
    "cards",
    "messages",
    "celebration",
  ],
  author: {
    name: "Birthday Wish",
    url: "https://example.com",
  },
  // Prefer setting NEXT_PUBLIC_SITE_URL in .env* files (no trailing slash)
  get baseUrl() {
    const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    return url || "http://localhost:3000";
  },
  social: {
    twitterHandle: "@yourhandle",
    twitterSite: "@yourhandle",
  },
};

export type SiteConfig = typeof siteConfig;
