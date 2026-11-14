import type { CSSProperties, ReactNode } from "react";

export const field: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  margin: "10px 0 16px",
  font: "inherit",
  color: "#f3efe6",
  background: "transparent",
  border: "2px solid #f3efe6",
};

export const button: CSSProperties = {
  padding: "15px 22px",
  font: "inherit",
  fontWeight: 600,
  color: "#14110f",
  background: "#f3efe6",
  border: "2px solid #f3efe6",
  cursor: "pointer",
};

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "14vh 20px",
        fontSize: 18,
        lineHeight: 1.5,
      }}
    >
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
      <h1 style={{ fontSize: "clamp(32px, 7vw, 54px)", lineHeight: 1.05, margin: "14px 0 22px" }}>
        {title}
      </h1>
      {children}
    </main>
  );
}
