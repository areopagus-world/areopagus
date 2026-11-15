import type { Messages } from "@/i18n/messages";
import { LEVELS, type Level } from "@/snapshots/rules";
import { field } from "./styles";

/** The optional level of a deed in a chronology form. Empty means the deed names no level. */
export function LevelSelect({ t, selected }: { t: Messages; selected?: Level | undefined }) {
  return (
    <label>
      {t.common.level}
      <select
        style={{ ...field, background: "#14110f", colorScheme: "dark" }}
        name="level"
        defaultValue={selected ? String(selected) : ""}
        aria-describedby="level-hint"
      >
        <option value="">{t.common.levelNone}</option>
        {LEVELS.map((level) => {
          const text = t.snapshots.levels[level - 1];
          return text ? (
            <option key={level} value={level}>
              {`${level}. ${text.name}. ${text.hint}`}
            </option>
          ) : null;
        })}
      </select>
      <span
        id="level-hint"
        style={{ display: "block", color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" }}
      >
        {t.common.levelHint}
      </span>
    </label>
  );
}
