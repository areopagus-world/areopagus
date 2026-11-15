import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const LANGS = ["fr", "de", "es", "it", "pt", "nl", "pl", "ru"];

/**
 * The public page in its nine languages. People's spaces are not listed: being found by a search
 * engine will be each person's choice, not the network's default.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = (process.env.APP_ORIGIN ?? "https://areopagus.world").replace(/\/$/, "");
  const languages = Object.fromEntries([
    ["en", `${origin}/`],
    ...LANGS.map((lang) => [lang, `${origin}/${lang}/`]),
  ]);
  return [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1, alternates: { languages } },
    ...LANGS.map((lang) => ({
      url: `${origin}/${lang}/`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages },
    })),
  ];
}
