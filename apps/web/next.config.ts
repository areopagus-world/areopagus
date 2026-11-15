import type { NextConfig } from "next";

// Languages of the public page other than English, which lives at the root.
const LANGS = "fr|de|es|it|pt|nl|pl|ru";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The public page links to /fr/ and so on; keep those addresses as they are.
  skipTrailingSlashRedirect: true,
  // The station files and the legend pictures carry their version in the name, so browsers may keep them for a year.
  async headers() {
    return [
      {
        source: "/site/hero/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async rewrites() {
    return {
      // The public page is built as static files into public/site and answers at the root.
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: `/:lang(${LANGS})`, destination: "/site/:lang/index.html" },
        { source: `/:lang(${LANGS})/`, destination: "/site/:lang/index.html" },
        // The legend of the station, next to the public page in every language.
        { source: "/legend", destination: "/site/legend/index.html" },
        { source: "/legend/", destination: "/site/legend/index.html" },
        { source: `/:lang(${LANGS})/legend`, destination: "/site/:lang/legend/index.html" },
        { source: `/:lang(${LANGS})/legend/`, destination: "/site/:lang/legend/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
