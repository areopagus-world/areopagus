/**
 * Who publishes the site. Kept in the environment, not in the open repository.
 * Only the name has a default; every other line appears on the legal pages once it is set.
 */
export interface Publisher {
  name: string;
  /** Where to reach the publisher: a mailto: link when an e-mail is set, the publisher's site otherwise. */
  contactHref: string;
  contactLabel: string;
  address: string | undefined;
  siret: string | undefined;
  phone: string | undefined;
}

type Env = Record<string, string | undefined>;

const DEFAULT_NAME = "donnee.dev";
const DEFAULT_SITE = "https://donnee.dev";

export function publisher(env: Env = process.env): Publisher {
  const read = (key: string) => env[key]?.trim() || undefined;
  const email = read("LEGAL_EMAIL");
  const site = read("LEGAL_SITE") ?? DEFAULT_SITE;
  return {
    name: read("LEGAL_NAME") ?? DEFAULT_NAME,
    contactHref: email ? `mailto:${email}` : site,
    contactLabel: email ?? site.replace(/^https?:\/\//, ""),
    address: read("LEGAL_ADDRESS"),
    siret: read("LEGAL_SIRET"),
    phone: read("LEGAL_PHONE"),
  };
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
