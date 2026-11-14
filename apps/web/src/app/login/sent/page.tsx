import { Screen } from "../../ui";

export default function Sent() {
  return (
    <Screen title="Check your e-mail">
      <p>If the address can sign in, a link is on its way. It works once and for 15 minutes.</p>
      <p style={{ color: "#a39b8f" }}>
        Nothing arrived after a few minutes? Look in the spam folder, then ask again.
      </p>
    </Screen>
  );
}
