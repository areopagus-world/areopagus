/* global console, process */
// Structural check of every translation against English. Runs in `pnpm check` and before each build.
import { checkLocale, DEFAULT_LANG, loadLocales } from "./site-locales.mjs";

const { langs, locales } = loadLocales();
let bad = 0;
for (const code of langs) {
  const problems = checkLocale(code, locales[code], locales[DEFAULT_LANG]);
  bad += problems.length;
  console.log(problems.length === 0 ? `${code}: ok` : `${code}:\n  ${problems.join("\n  ")}`);
}
process.exit(bad === 0 ? 0 : 1);
