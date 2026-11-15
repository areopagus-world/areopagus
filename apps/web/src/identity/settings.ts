import { getPool } from "@/db/pool";
import { isLocale, type Locale } from "@/i18n/locales";

export interface Recipient {
  email: string;
  lang: Locale;
  notify: boolean;
}

/** What is needed to write to a person: address, language, and whether they want such e-mails. */
export async function recipient(userId: string): Promise<Recipient | undefined> {
  const { rows } = await getPool().query<{ email: string; lang: string; notify: boolean }>(
    "select email::text, lang, notify from users where id = $1",
    [userId],
  );
  const row = rows[0];
  return row
    ? { email: row.email, lang: isLocale(row.lang) ? row.lang : "en", notify: row.notify }
    : undefined;
}

/** Remembers the language the person reads in, so e-mails to them use it too. */
export async function rememberLocale(userId: string, locale: Locale): Promise<void> {
  await getPool().query("update users set lang = $2 where id = $1 and lang <> $2", [
    userId,
    locale,
  ]);
}

export async function setNotify(userId: string, notify: boolean): Promise<void> {
  await getPool().query("update users set notify = $2 where id = $1", [userId, notify]);
}
