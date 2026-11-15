import { cookies, headers } from "next/headers";
import { type Locale, LOCALE_COOKIE, pickLocale } from "./locales";
import { type Messages, messagesFor } from "./messages";

/** The language of the current request: the person's choice, else their browser's, else English. */
export async function getLocale(): Promise<Locale> {
  const [jar, head] = await Promise.all([cookies(), headers()]);
  return pickLocale(jar.get(LOCALE_COOKIE)?.value, head.get("accept-language"));
}

/** The texts of the interface in the current request's language. */
export async function getT(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: messagesFor(locale) };
}
