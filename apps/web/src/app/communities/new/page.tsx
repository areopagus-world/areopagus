import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MAX_FOUNDED } from "@/communities/store";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { HANDLE_FIELD_PATTERN } from "@/spaces/rules";
import { PlaceField } from "../../me/place-field";
import { button, field, Screen } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Start a community · Areopagus" };

const PROBLEMS: Record<string, string> = {
  format: "The address needs 3 to 30 characters: Latin letters, digits and hyphens.",
  reserved: "That address is kept for the network itself. Choose another one.",
  taken: "A space or a community already has that address. Choose another one.",
  name: "Enter the name people should see.",
  "no-space": "Create your space first: members of a community are shown by their spaces.",
  limit: `One person can start up to ${MAX_FOUNDED} communities.`,
};
const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

export default async function NewCommunity({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  if (!authEnabled()) notFound();
  if (!(await currentUser())) redirect("/login");
  const { problem } = await searchParams;
  return (
    <Screen title="Start a community">
      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}
      <form method="post" action="/api/communities">
        <label>
          Address
          <input
            style={field}
            name="handle"
            pattern={HANDLE_FIELD_PATTERN}
            title="3 to 30 characters: Latin letters, digits and hyphens."
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <p style={hint}>areopagus.world/your-community. It cannot be changed later, for now.</p>
        <label>
          Name
          <input style={field} name="name" maxLength={80} required />
        </label>
        <label>
          Place
          <PlaceField initialLabel="" initialId="" />
        </label>
        <p style={hint}>Where the community lives or meets, if it has a place.</p>
        <label>
          What it is for
          <textarea style={{ ...field, minHeight: 150 }} name="about" maxLength={1000} />
        </label>
        <button style={button} type="submit">
          Start
        </button>
      </form>
    </Screen>
  );
}
