/**
 * The domain passkeys are bound to. WEBAUTHN_RP_ID lets the beta host register passkeys for the
 * parent domain, so they keep working when the network moves to it.
 */
export function relyingPartyId(
  origin: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const host = new URL(origin).hostname;
  const wanted = env.WEBAUTHN_RP_ID?.trim().toLowerCase();
  if (wanted && (host === wanted || host.endsWith(`.${wanted}`))) return wanted;
  return host;
}
