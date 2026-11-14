import type { ReactNode } from "react";
import { formatDay } from "@/chronology/rules";
import type { TimelineEvent } from "@/chronology/store";

/**
 * A chronology as a line: newest on top, a light for every event, and a thread back to the event
 * it continues. `action` lets the owner's page add a control to each event.
 */
export function Timeline({
  events,
  action,
}: {
  events: TimelineEvent[];
  action?: (event: TimelineEvent) => ReactNode;
}) {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: "0 0 0 26px",
        borderLeft: "2px solid #3a342e",
      }}
    >
      {events.map((event) => (
        <li
          key={event.id}
          id={`e-${event.id}`}
          style={{ position: "relative", padding: "0 0 34px" }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -33,
              top: 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: event.visibility === "private" ? "#14110f" : "#ff4a1c",
              border: "2px solid #ff4a1c",
              boxShadow: event.visibility === "private" ? "none" : "0 0 14px #ff4a1c",
            }}
          />
          <p style={{ margin: 0, fontSize: 14, color: "#a39b8f", letterSpacing: "0.04em" }}>
            <time dateTime={event.happenedOn}>{formatDay(event.happenedOn)}</time>
            {event.visibility === "private" ? " · only you" : ""}
            {event.author ? (
              <>
                {" · "}
                <a href={`/${event.author.handle}`}>{event.author.name}</a>
              </>
            ) : null}
          </p>
          <h3
            style={{ margin: "4px 0 0", fontSize: 22, lineHeight: 1.25, overflowWrap: "anywhere" }}
          >
            {event.title}
          </h3>
          {event.continues ? (
            <p style={{ margin: "6px 0 0", fontSize: 15, color: "#a39b8f" }}>
              continues <a href={`#e-${event.continues.id}`}>{event.continues.title}</a>
            </p>
          ) : null}
          {event.body ? (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 18,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                maxWidth: 620,
              }}
            >
              {event.body}
            </p>
          ) : null}
          {action ? action(event) : null}
        </li>
      ))}
    </ol>
  );
}

export const sectionTitle = {
  fontFamily: "Unbounded, system-ui, sans-serif",
  fontWeight: 800,
  fontSize: 28,
  letterSpacing: "-0.02em",
  margin: "64px 0 26px",
} as const;
