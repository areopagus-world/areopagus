import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { button, Screen } from "../ui";

export const dynamic = "force-dynamic";

export default async function Me() {
  if (!authEnabled()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <Screen title="You are in">
      <p>
        Signed in as <strong>{user.email}</strong>.
      </p>
      <p style={{ color: "#a39b8f" }}>
        Your space comes next. For now this page only shows that sign-in works.
      </p>
      <form method="post" action="/api/auth/logout">
        <button style={button} type="submit">
          Sign out
        </button>
      </form>
    </Screen>
  );
}
