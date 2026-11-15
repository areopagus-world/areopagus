import type { ReactNode } from "react";
import { getT } from "@/i18n/server";

export { button, field } from "./styles";

export async function Screen({ title, children }: { title: string; children: ReactNode }) {
  const { t } = await getT();
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
        {t.beta}
      </p>
      <h1 style={{ fontSize: "clamp(32px, 7vw, 54px)", lineHeight: 1.05, margin: "14px 0 22px" }}>
        {title}
      </h1>
      {children}
    </main>
  );
}
