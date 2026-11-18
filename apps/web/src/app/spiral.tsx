import type { CSSProperties } from "react";
import type { Messages } from "@/i18n/messages";
import type { Level } from "@/snapshots/rules";
import { LEVEL_COLORS } from "@/spiral/rules";
import type { Spiral } from "@/spiral/store";

const mono: CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 14,
  color: "#a39b8f",
};

/**
 * A capsule's spiral, laid out like a table of contents: the eight levels, each with the owner's
 * own name for it and how many entries it holds. A level opens the entries filed under it.
 */
export function SpiralView({
  spiral,
  t,
  href,
  current,
}: {
  spiral: Spiral;
  t: Messages;
  href: (level: Level | undefined) => string;
  current: Level | undefined;
}) {
  return (
    <div>
      <ol
        style={{
          listStyle: "none",
          margin: "18px 0 0",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          columnGap: 44,
        }}
      >
        {spiral.levels.map(({ level, title, count }) => {
          const name = t.snapshots.levels[level - 1]?.name ?? "";
          const active = current === level;
          return (
            <li key={level} style={{ borderTop: "1px solid #2b2621" }}>
              <a
                href={href(active ? undefined : level)}
                aria-current={active ? "true" : undefined}
                style={{
                  display: "grid",
                  gridTemplateColumns: "30px 26px 1fr auto",
                  alignItems: "center",
                  gap: 10,
                  padding: "15px 0",
                  textDecoration: "none",
                  color: "#f3efe6",
                  opacity: current && !active ? 0.6 : 1,
                }}
              >
                <span style={mono}>{String(level).padStart(2, "0")}</span>
                <span
                  aria-hidden="true"
                  style={{
                    height: 3,
                    width: active ? 26 : 18,
                    background: LEVEL_COLORS[level],
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{ fontSize: 19, fontWeight: active ? 700 : 500, overflowWrap: "anywhere" }}
                >
                  {title ?? name}
                  {title ? (
                    <span
                      style={{ display: "block", fontSize: 13, fontWeight: 400, color: "#a39b8f" }}
                    >
                      {name}
                    </span>
                  ) : null}
                </span>
                <span style={mono}>{count > 0 ? count : ""}</span>
              </a>
            </li>
          );
        })}
      </ol>
      {current ? (
        <p style={{ margin: "14px 0 0" }}>
          <a href={href(undefined)}>{t.spiral.all}</a>
        </p>
      ) : null}
    </div>
  );
}
