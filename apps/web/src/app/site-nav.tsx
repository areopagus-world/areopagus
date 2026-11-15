const link = { color: "#a39b8f", textDecoration: "none" } as const;

/** The thin bar on top of every page of the app: home, then the places a person goes to. */
export function SiteNav() {
  return (
    <nav
      aria-label="Areopagus"
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
        Areopagus
      </a>
      <a href="/map" style={link}>
        Map
      </a>
      <a href="/search" style={link}>
        Search
      </a>
      <a href="/questions" style={link}>
        Questions
      </a>
      <a href="/communities" style={link}>
        Communities
      </a>
      <a href="/me" style={{ ...link, color: "#f3efe6" }}>
        Me
      </a>
    </nav>
  );
}
