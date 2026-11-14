import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./config";
import { findSessionUser, type User } from "./store";

/** The signed-in person for the current request, if any. */
export async function currentUser(): Promise<User | undefined> {
  const secret = (await cookies()).get(SESSION_COOKIE)?.value;
  return secret ? findSessionUser(secret) : undefined;
}
