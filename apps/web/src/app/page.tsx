export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "18vh 20px" }}>
      <p
        style={{
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontSize: 13,
          color: "#a39b8f",
        }}
      >
        Areopagus beta
      </p>
      <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", lineHeight: 1, margin: "16px 0" }}>
        The network is <span style={{ color: "#ff4a1c" }}>being built.</span>
      </h1>
      <p style={{ fontSize: 19, lineHeight: 1.5 }}>
        Nothing to sign up for yet. Follow the path and take part at{" "}
        <a href="https://areopagus.world" style={{ color: "inherit" }}>
          areopagus.world
        </a>
        .
      </p>
    </main>
  );
}
