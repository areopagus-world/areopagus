import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

/** Pages that are personal or only make sense after signing in stay out of search engines. */
export default function robots(): MetadataRoute.Robots {
  const origin = (process.env.APP_ORIGIN ?? "https://areopagus.world").replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/login",
        "/me",
        "/moderation",
        "/report",
        "/questions/new",
        "/communities/new",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
