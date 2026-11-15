"use client";

import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useEffect, useState } from "react";
import type { Messages } from "@/i18n/messages";
import { button } from "./styles";

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

/** A short code for what went wrong: where it failed and, for the browser's own refusal, its error name. */
async function reasonOf(error: unknown): Promise<string> {
  if (error instanceof Response) {
    try {
      const body = (await error.json()) as { reason?: string };
      return `server ${error.status}${body.reason ? ` ${body.reason}` : ""}`;
    } catch {
      return `server ${error.status}`;
    }
  }
  if (error instanceof Error) {
    // The library wraps the browser's own error; its message says what actually happened.
    const cause = error.cause instanceof Error ? error.cause.message : "";
    return cause ? `${error.name}: ${cause}` : error.name;
  }
  return "unknown";
}

/** The passkey texts, passed from the server in the reader's language. */
type Text = Messages["passkey"];

/** True once the page runs in a browser that can use passkeys. The buttons stay hidden until then. */
function useSupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(browserSupportsWebAuthn()), []);
  return supported;
}

export function PasskeySignIn({ text }: { text: Text }) {
  const supported = useSupported();
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");
  const [reason, setReason] = useState("");
  if (!supported) return null;
  const signIn = async () => {
    setState("busy");
    try {
      const options = await post("/api/passkey/login/options");
      if (!options.ok) throw options;
      const answer = await startAuthentication({ optionsJSON: await options.json() });
      const verified = await post("/api/passkey/login/verify", answer);
      if (!verified.ok) throw verified;
      window.location.assign("/me");
    } catch (error) {
      setReason(await reasonOf(error));
      setState("failed");
    }
  };
  return (
    <div style={{ marginTop: 34 }}>
      <button style={quiet} type="button" onClick={signIn} disabled={state === "busy"}>
        {text.signIn}
      </button>
      {state === "failed" ? (
        <p style={note}>
          {text.signInFailed} ({reason})
        </p>
      ) : (
        <p style={note}>{text.signInNote}</p>
      )}
    </div>
  );
}

export function PasskeyAdd({ count, text }: { count: number; text: Text }) {
  const supported = useSupported();
  const [state, setState] = useState<"idle" | "busy" | "added" | "failed">("idle");
  const [total, setTotal] = useState(count);
  const [reason, setReason] = useState("");
  if (!supported) return null;
  const add = async () => {
    setState("busy");
    try {
      const options = await post("/api/passkey/register/options");
      if (!options.ok) throw options;
      const answer = await startRegistration({ optionsJSON: await options.json() });
      const verified = await post("/api/passkey/register/verify", answer);
      if (!verified.ok) throw verified;
      setTotal((n) => n + 1);
      setState("added");
    } catch (error) {
      setReason(await reasonOf(error));
      setState("failed");
    }
  };
  return (
    <div style={{ margin: "34px 0 0" }}>
      <button style={quiet} type="button" onClick={add} disabled={state === "busy"}>
        {total > 0 ? text.addAnother : text.add}
      </button>
      <p style={note}>
        {state === "added"
          ? text.added
          : state === "failed"
            ? `${text.addFailed} (${reason})`
            : total > 0
              ? text.count.replace("{n}", String(total))
              : text.addNote}
      </p>
    </div>
  );
}
