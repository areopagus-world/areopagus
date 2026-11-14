/** A migration file is named `NNNN_description.sql`; NNNN orders it. */
const PATTERN = /^(\d{4})_[a-z0-9_]+\.sql$/;

export interface Migration {
  id: string;
  file: string;
}

/**
 * Returns the migrations still to run, in order.
 * Throws on a badly named file, a duplicate number, or an applied migration that has disappeared:
 * each of those means the history was edited, and running anything on top would be unsafe.
 */
export function pendingMigrations(
  files: readonly string[],
  applied: readonly string[],
): Migration[] {
  const all: Migration[] = [];
  for (const file of [...files].sort()) {
    const match = PATTERN.exec(file);
    if (!match?.[1]) throw new Error(`Bad migration file name: ${file}`);
    if (all.some((m) => m.id === match[1]))
      throw new Error(`Duplicate migration number: ${match[1]}`);
    all.push({ id: match[1], file });
  }
  for (const id of applied) {
    if (!all.some((m) => m.id === id))
      throw new Error(`Applied migration ${id} is missing from the repository`);
  }
  return all.filter((m) => !applied.includes(m.id));
}
