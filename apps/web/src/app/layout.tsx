import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Areopagus",
  description: "A European network of real people.",
  robots: { index: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#14110f",
          color: "#f3efe6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
