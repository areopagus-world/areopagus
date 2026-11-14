import { notFound, redirect } from "next/navigation";
import { authEnabled } from "@/identity/config";
import { currentUser } from "@/identity/session";
import { PasskeySignIn } from "../passkey-buttons";
import { button, field, Screen } from "../ui";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (!authEnabled()) notFound();
  if (await currentUser()) redirect("/me");
  return (
    <Screen title="Sign in">
      <p>Enter your e-mail address. We send you a link that signs you in. There is no password.</p>
      <form method="post" action="/api/auth/request">
        <label>
          E-mail
          <input style={field} type="email" name="email" autoComplete="email" required />
        </label>
        <button style={button} type="submit">
          Send me the link
        </button>
      </form>
      <PasskeySignIn />
    </Screen>
  );
}
