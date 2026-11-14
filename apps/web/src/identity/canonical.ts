/**
 * Where a request should be sent when it arrives on a side host of the main one.
 * With the app at https://areopagus.world, www.areopagus.world and beta.areopagus.world are side hosts.
 * While the app still lives on a subdomain, nothing is redirected.
 */
export function canonicalRedirect(
  host: string,
  pathAndQuery: string,
  appOrigin: string | undefined,
): string | undefined {
  if (!appOrigin) return undefined;
  let main: URL;
  try {
    main = new URL(appOrigin);
  } catch {
    return undefined;
  }
  const requested = host.toLowerCase().replace(/:\d+$/, "");
  if (requested === main.hostname || !requested.endsWith(`.${main.hostname}`)) return undefined;
  return `${main.origin}${pathAndQuery}`;
}
