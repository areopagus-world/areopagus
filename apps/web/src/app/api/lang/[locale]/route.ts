import { NextResponse } from "next/server";
import { authEnabled, publicOrigin } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { rememberLocale } from "@/identity/settings";
import { isLocale, LOCALE_COOKIE, safeNext } from "@/i18n/locales";

/**
 * Switches the language of the interface: /api/lang/fr?next=/map.
 * Without ?next it goes back to the page the person came from, if it is on this site.
 */
export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const origin = publicOrigin(request);
  const url = new URL(request.url);
  let back = safeNext(url.searchParams.get("next"));
  if (!back) {
    const referer = request.headers.get("referer");
    try {
      const from = referer ? new URL(referer) : undefined;
      if (from && from.origin === new URL(origin).origin)
        back = safeNext(from.pathname + from.search);
    } catch {
      // A broken Referer is ignored.
    }
  }
  const response = NextResponse.redirect(new URL(back ?? "/", origin), 303);
  if (!isLocale(locale)) return response;
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  if (authEnabled()) {
    const user = await currentUser();
    if (user) await rememberLocale(user.id, locale);
  }
  return response;
}
