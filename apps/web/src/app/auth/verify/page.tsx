import { notFound } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { button, Screen } from "../../ui";

export const dynamic = "force-dynamic";

/**
 * The link from the e-mail lands here. Signing in takes one more press of a button:
 * mail scanners that open links in advance then cannot use the link up.
 */
export default async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; failed?: string }>;
}) {
  if (!authEnabled()) notFound();
  const { token, failed } = await searchParams;
  if (failed || !token) {
    return (
      <Screen title="This link no longer works">
        <p>It was already used, or it is older than 15 minutes.</p>
        <p>
          <a href="/login" style={{ color: "inherit" }}>
            Ask for a new link
          </a>
        </p>
      </Screen>
    );
  }
  return (
    <Screen title="Almost there">
      <form method="post" action="/api/auth/verify">
        <input type="hidden" name="token" value={token} />
        <button style={button} type="submit">
          Sign in to Areopagus
        </button>
      </form>
    </Screen>
  );
}
