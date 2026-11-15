import type { CSSProperties } from "react";

/** Shared looks, safe to use in components that run in the browser. */
export const field: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  margin: "10px 0 16px",
  font: "inherit",
  color: "#f3efe6",
  background: "transparent",
  border: "2px solid #f3efe6",
};

export const button: CSSProperties = {
  padding: "15px 22px",
  font: "inherit",
  fontWeight: 600,
  color: "#14110f",
  background: "#f3efe6",
  border: "2px solid #f3efe6",
  cursor: "pointer",
};
