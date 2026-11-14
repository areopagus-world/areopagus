"use client";

import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useEffect, useState } from "react";
import { button } from "./ui";

const quiet = { ...button, background: "transparent", color: "#f3efe6" } as const;
const note = { color: "#a39b8f", fontSize: 15, margin: "10px 0 0" } as const;

async function post(path: string, body?: unknown): Promise<Response> {
  const init: RequestInit = { method: "POST" };
  if (body !== undefined) {
    init.headers = { "content-type": "application/json" };
    init.body = JSON.stringify(body);
  }
  return fetch(path, init);
}

/** True once the page runs in a browser that can use passkeys. The buttons stay hidden until then. */
function useSupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(browserSupportsWebAuthn()), []);
  return supported;
}

export function PasskeySignIn() {
  const supported = useSupported();
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");
  if (!supported) return null;
  const signIn = async () => {
    setState("busy");
    try {
      const options = await post("/api/passkey/login/options");
      if (!options.ok) throw new Error("options");
      const answer = await startAuthentication({ optionsJSON: await options.json() });
      const verified = await post("/api/passkey/login/verify", answer);
      if (!verified.ok) throw new Error("verify");
      window.location.assign("/me");
    } catch {
      setState("failed");
    }
  };
  return (
    <div style={{ marginTop: 34 }}>
      <button style={quiet} type="button" onClick={signIn} disabled={state === "busy"}>
        Sign in with a passkey
      </button>
      {state === "failed" ? (
        <p style={note}>That did not work. Try again, or use the link by e-mail.</p>
      ) : (
        <p style={note}>
          For those who already added one: fingerprint, face or device PIN, no e-mail needed.
        </p>
      )}
    </div>
  );
}

export function PasskeyAdd({ count }: { count: number }) {
  const supported = useSupported();
  const [state, setState] = useState<"idle" | "busy" | "added" | "failed">("idle");
  const [total, setTotal] = useState(count);
  if (!supported) return null;
  const add = async () => {
    setState("busy");
    try {
      const options = await post("/api/passkey/register/options");
      if (!options.ok) throw new Error("options");
      const answer = await startRegistration({ optionsJSON: await options.json() });
      const verified = await post("/api/passkey/register/verify", answer);
      if (!verified.ok) throw new Error("verify");
      setTotal((n) => n + 1);
      setState("added");
    } catch {
      setState("failed");
    }
  };
  return (
    <div style={{ margin: "34px 0 0" }}>
      <button style={quiet} type="button" onClick={add} disabled={state === "busy"}>
        {total > 0 ? "Add another passkey" : "Add a passkey"}
      </button>
      <p style={note}>
        {state === "added"
          ? "Passkey added. Next time you can sign in without the e-mail link."
          : state === "failed"
            ? "The passkey was not added. Try again."
            : total > 0
              ? `Passkeys on this account: ${total}. The e-mail link keeps working too.`
              : "Sign in next time with a fingerprint, face or device PIN instead of waiting for an e-mail."}
      </p>
    </div>
  );
}
