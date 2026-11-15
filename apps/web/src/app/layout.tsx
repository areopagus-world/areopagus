import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/i18n/server";
import { SiteNav } from "./site-nav";

export const metadata: Metadata = {
  title: "Areopagus",
  description: "A European network of real people.",
  robots: { index: false },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=unbounded:800|golos-text:400,600"
          rel="stylesheet"
        />
        <style>{"a{color:inherit}"}</style>
      </head>
      <body
        style={{
          margin: 0,
          background: "#14110f",
          color: "#f3efe6",
          fontFamily: "'Golos Text', system-ui, sans-serif",
        }}
      >
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
