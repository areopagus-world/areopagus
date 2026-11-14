import type { CSSProperties, ReactNode } from "react";
import { LEGAL_UPDATED } from "@/legal/details";

const h2: CSSProperties = { fontSize: 22, margin: "34px 0 8px" };
const mute: CSSProperties = { color: "#a39b8f", fontSize: 15 };

export function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h2 style={h2}>{title}</h2>
      {children}
    </>
  );
}

/** One language of a legal page. */
export function Language({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <section lang={lang} style={{ borderTop: "1px solid #3a342e", marginTop: 44, paddingTop: 10 }}>
      {children}
    </section>
  );
}

export function Updated({ label }: { label: string }) {
  return (
    <p style={mute}>
      {label} {LEGAL_UPDATED}
    </p>
  );
}

export function Links() {
  return (
    <p style={{ ...mute, marginTop: 44 }}>
      <a href="/" style={{ color: "inherit" }}>
        Areopagus
      </a>
      {" · "}
      <a href="/legal" style={{ color: "inherit" }}>
        Mentions légales
      </a>
      {" · "}
      <a href="/privacy" style={{ color: "inherit" }}>
        Données personnelles
      </a>
    </p>
  );
}
