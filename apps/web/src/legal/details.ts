/** Who publishes the site. Kept in the environment, not in the open repository. */
export interface Publisher {
  name: string;
  address: string;
  siret: string;
  email: string;
  phone: string;
}

type Env = Record<string, string | undefined>;

/**
 * The publisher's details, or undefined while any of them is missing: the legal pages
 * stay unpublished rather than appear half empty.
 */
export function publisher(env: Env = process.env): Publisher | undefined {
  const read = (key: string) => env[key]?.trim() ?? "";
  const details = {
    name: read("LEGAL_NAME"),
    address: read("LEGAL_ADDRESS"),
    siret: read("LEGAL_SIRET"),
    email: read("LEGAL_EMAIL"),
    phone: read("LEGAL_PHONE"),
  };
  return Object.values(details).every(Boolean) ? details : undefined;
}

/** The company that runs the servers, as stated in its own legal notice. */
export const HOST = {
  name: "Clever Cloud SAS",
  address: "4 rue Voltaire, 44000 Nantes, France",
  register: "RCS Nantes B 524 172 699",
  phone: "+33 2 85 52 07 69",
} as const;

/** Date of the last change to the legal texts, shown on both pages. */
export const LEGAL_UPDATED = "2026-11-14";
