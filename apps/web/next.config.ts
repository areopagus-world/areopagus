import type { NextConfig } from "next";

// Languages of the public page other than English, which lives at the root.
const LANGS = "fr|de|es|it|pt|nl|pl|ru";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The public page links to /fr/ and so on; keep those addresses as they are.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      // The public page is built as static files into public/site and answers at the root.
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: `/:lang(${LANGS})`, destination: "/site/:lang/index.html" },
        { source: `/:lang(${LANGS})/`, destination: "/site/:lang/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
