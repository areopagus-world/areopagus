import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { HANDLE_PATTERN, MAX_SKILLS } from "@/spaces/rules";
import { findSpaceByUser } from "@/spaces/store";
import { button, field, Screen } from "../ui";
import { PlaceField } from "./place-field";

export const dynamic = "force-dynamic";

const PROBLEMS: Record<string, string> = {
  format: "The address needs 3 to 30 characters: Latin letters, digits and hyphens.",
  reserved: "That address is kept for the network itself. Choose another one.",
  taken: "Someone already has that address. Choose another one.",
  name: "Enter the name people should see.",
};

const hint = { color: "#a39b8f", fontSize: 15, margin: "-8px 0 16px" } as const;

export default async function Me({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string; saved?: string }>;
}) {
  if (!authEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login");
  const [space, { problem, saved }] = await Promise.all([findSpaceByUser(user.id), searchParams]);

  return (
    <Screen title={space ? "Your space" : "Make your space"}>
      {problem && PROBLEMS[problem] ? (
        <p style={{ color: "#ff4a1c" }}>{PROBLEMS[problem]}</p>
      ) : null}
      {saved && space ? (
        <p>
          Saved. Your page:{" "}
          <a
            href={`/${space.handle}`}
            style={{ color: "#ff4a1c" }}
          >{`areopagus.world/${space.handle}`}</a>
        </p>
      ) : null}
      <form method="post" action="/api/space">
        <label>
          Address
          <input
            style={field}
            name="handle"
            defaultValue={space?.handle ?? ""}
            pattern={HANDLE_PATTERN}
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <p style={hint}>areopagus.world/your-address. Latin letters, digits and hyphens.</p>
        <label>
          Name
          <input
            style={field}
            name="name"
            defaultValue={space?.name ?? ""}
            maxLength={80}
            required
          />
        </label>
        <label>
          Place
          <PlaceField initialLabel={space?.place ?? ""} initialId={space?.placeId ?? ""} />
        </label>
        <p style={hint}>
          Start typing your town or village and pick it from the list: it lights up on the map.
        </p>
        <label>
          Skills
          <textarea
            style={{ ...field, minHeight: 90 }}
            name="skills"
            defaultValue={space?.skills.join(", ") ?? ""}
          />
        </label>
        <p style={hint}>What you can do, separated by commas. Up to {MAX_SKILLS}.</p>
        <label>
          About
          <textarea
            style={{ ...field, minHeight: 150 }}
            name="about"
            defaultValue={space?.about ?? ""}
            maxLength={1000}
          />
        </label>
        <button style={button} type="submit">
          {space ? "Save" : "Create my space"}
        </button>
      </form>
      <p style={{ ...hint, margin: "34px 0 10px" }}>
        Signed in as {user.email}. Your e-mail is never shown on your page.
      </p>
      <form method="post" action="/api/auth/logout">
        <button style={{ ...button, background: "transparent", color: "#f3efe6" }} type="submit">
          Sign out
        </button>
      </form>
    </Screen>
  );
}
