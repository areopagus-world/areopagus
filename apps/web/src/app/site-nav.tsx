import { LOCALES } from "@/i18n/locales";
import { getT } from "@/i18n/server";

const link = { color: "#a39b8f", textDecoration: "none" } as const;

/** The thin bar on top of every page of the app: home, the places a person goes to, the language. */
export async function SiteNav() {
  const { locale, t } = await getT();
  return (
    <nav
      aria-label={t.brand}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "18px 20px 0",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "6px 22px",
        fontSize: 15,
      }}
    >
      <a
        href="/"
        style={{
          fontFamily: "Unbounded, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: "-0.02em",
          color: "#f3efe6",
          textDecoration: "none",
          marginRight: "auto",
        }}
      >
        {t.brand}
      </a>
      <a href="/map" style={link}>
        {t.nav.map}
      </a>
      <a href="/search" style={link}>
        {t.nav.search}
      </a>
      <a href="/questions" style={link}>
        {t.nav.questions}
      </a>
      <a href="/communities" style={link}>
        {t.nav.communities}
      </a>
      <a href="/me" style={{ ...link, color: "#f3efe6" }}>
        {t.nav.me}
      </a>
      <span
        aria-label={t.nav.language}
        style={{ display: "inline-flex", gap: 8, fontSize: 13, letterSpacing: "0.06em" }}
      >
        {LOCALES.map((code) =>
          code === locale ? (
            <span key={code} style={{ color: "#ff4a1c" }} aria-current="true">
              {code.toUpperCase()}
            </span>
          ) : (
            <a key={code} href={`/api/lang/${code}`} lang={code} style={link} rel="nofollow">
              {code.toUpperCase()}
            </a>
          ),
        )}
      </span>
    </nav>
  );
}
