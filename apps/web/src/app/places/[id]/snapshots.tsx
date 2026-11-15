import type { CSSProperties } from "react";
import type { Messages } from "@/i18n/messages";
import {
  BALANCE_BAND,
  lean,
  MAX_SNAPSHOTS_PER_DAY,
  position,
  REPLACE_DAYS,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  signed,
  SUMMARY_MIN,
  type Level,
  type Summary,
} from "@/snapshots/rules";
import type { LevelView } from "@/snapshots/store";
import { button } from "../../ui";

/** What the reader of the page can do with the sliders. */
export type SnapshotAccess = "record" | "sign-in" | "need-space" | "off";

const mute: CSSProperties = { color: "#a39b8f", fontSize: 15, margin: "4px 0" };
const ember = "#ff4a1c";

function Bar({ summary }: { summary: Summary }) {
  const width = Math.max(position(summary.high) - position(summary.low), 1);
  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", height: 14, margin: "8px 0 6px", background: "#3a342e" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position(-BALANCE_BAND)}%`,
          width: `${position(BALANCE_BAND) - position(-BALANCE_BAND)}%`,
          background: "#4d453d",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: `${position(summary.low)}%`,
          width: `${width}%`,
          background: "rgba(243, 239, 230, 0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -3,
          bottom: -3,
          left: `calc(${position(summary.median)}% - 2px)`,
          width: 4,
          background: ember,
        }}
      />
    </div>
  );
}

function Group({
  label,
  data,
  t,
}: {
  label: string;
  data: Summary | { count: number };
  t: Messages;
}) {
  return (
    <div style={{ margin: "10px 0" }}>
      <p style={{ ...mute, color: "#f3efe6" }}>{label}</p>
      {"median" in data ? (
        <>
          <Bar summary={data} />
          <p style={mute}>
            {t.snapshots.lean[lean(data.median)]}.{" "}
            {t.snapshots.summary(
              signed(data.median),
              signed(data.low),
              signed(data.high),
              data.count,
            )}
          </p>
        </>
      ) : (
        <p style={mute}>{t.snapshots.waiting(data.count, SUMMARY_MIN)}</p>
      )}
    </div>
  );
}

/** The levels of a place: what its people and its visitors see, and a slider for each. */
export function Snapshots({
  placeId,
  views,
  own,
  access,
  saved,
  problem,
  t,
}: {
  placeId: string;
  views: LevelView[];
  own: Map<Level, { value: number; day: string }>;
  access: SnapshotAccess;
  saved: Level | undefined;
  problem: string | undefined;
  t: Messages;
}) {
  const problems: Record<string, string> = {
    value: t.snapshots.problemValue,
    limit: t.snapshots.problemLimit(MAX_SNAPSHOTS_PER_DAY),
    "no-space": t.snapshots.problemNoSpace,
    "no-target": t.snapshots.problemNoTarget,
  };
  return (
    <section id="snapshots" style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>{t.snapshots.title}</h2>
      <p style={mute}>{t.snapshots.lead}</p>
      <p style={mute}>{t.snapshots.privacy(SUMMARY_MIN)}</p>
      {problem && problems[problem] ? <p style={{ color: ember }}>{problems[problem]}</p> : null}
      {views.map((view) => {
        const text = t.snapshots.levels[view.level - 1];
        if (!text) return null;
        const mine = own.get(view.level);
        return (
          <div
            key={view.level}
            id={`level-${view.level}`}
            style={{ padding: "18px 0", borderBottom: "1px solid #3a342e" }}
          >
            <h3 style={{ fontSize: 20, margin: 0 }}>
              {view.level}. {text.name}
            </h3>
            <p style={mute}>{text.hint}</p>
            <p
              style={{
                ...mute,
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 13,
              }}
            >
              <span>{text.short}</span>
              <span style={{ textAlign: "center" }}>{text.balance}</span>
              <span style={{ textAlign: "right" }}>{text.excess}</span>
            </p>
            <Group label={t.snapshots.residents} data={view.residents} t={t} />
            <Group label={t.snapshots.visitors} data={view.visitors} t={t} />
            {mine ? <p style={mute}>{t.snapshots.yours(signed(mine.value), mine.day)}</p> : null}
            {saved === view.level ? (
              <p style={{ color: ember, margin: "4px 0" }}>{t.snapshots.saved(REPLACE_DAYS)}</p>
            ) : null}
            {access === "record" ? (
              <form
                method="post"
                action="/api/snapshots"
                style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}
              >
                <input type="hidden" name="place_id" value={placeId} />
                <input type="hidden" name="level" value={view.level} />
                <input
                  type="range"
                  name="value"
                  min={SCALE_MIN}
                  max={SCALE_MAX}
                  step={SCALE_STEP}
                  defaultValue={mine?.value ?? 0}
                  list="snapshot-scale"
                  aria-label={t.snapshots.slider(text.name)}
                  style={{ flex: 1, accentColor: ember }}
                />
                <button type="submit" style={{ ...button, padding: "8px 14px", fontSize: 15 }}>
                  {t.snapshots.save}
                </button>
              </form>
            ) : null}
          </div>
        );
      })}
      {access === "sign-in" ? (
        <p style={{ marginTop: 16 }}>
          <a href="/login" style={{ color: ember }}>
            {t.snapshots.signIn}
          </a>
        </p>
      ) : access === "need-space" ? (
        <p style={{ marginTop: 16 }}>
          <a href="/me" style={{ color: ember }}>
            {t.snapshots.needSpace}
          </a>
        </p>
      ) : null}
      <datalist id="snapshot-scale">
        <option value={SCALE_MIN} />
        <option value={0} />
        <option value={SCALE_MAX} />
      </datalist>
    </section>
  );
}
