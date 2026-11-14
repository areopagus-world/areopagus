import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOST, publisher } from "@/legal/details";
import { Screen } from "../ui";
import { Language, Links, Part, Updated } from "./text";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mentions légales · Areopagus" };

export default function Legal() {
  const p = publisher();
  if (!p) notFound();
  return (
    <Screen title="Mentions légales">
      <Updated label="Mise à jour :" />
      <Part title="Éditeur du site">
        <p>
          {p.name}, entrepreneur individuel.
          <br />
          SIRET : {p.siret}
          <br />
          Adresse : {p.address}
          <br />
          Courriel : <a href={`mailto:${p.email}`}>{p.email}</a>
          <br />
          Téléphone : {p.phone}
        </p>
        <p>Directeur de la publication : {p.name}.</p>
      </Part>
      <Part title="Hébergeur">
        <p>
          {HOST.name}, {HOST.address}
          <br />
          {HOST.register}
          <br />
          Téléphone : {HOST.phone}
        </p>
      </Part>
      <Part title="Code et contenus">
        <p>
          Le code du site est publié sous licence AGPL-3.0 sur{" "}
          <a href="https://github.com/areopagus-world/areopagus">
            github.com/areopagus-world/areopagus
          </a>
          . Le nom Areopagus et les textes du site appartiennent à l’éditeur. Chaque personne reste
          l’auteur de ce qu’elle publie dans son espace.
        </p>
        <p>
          Lieux : GeoNames, licence CC BY 4.0. Contour de la carte : Natural Earth, domaine public.
          Polices : Unbounded et Golos Text, licence SIL Open Font.
        </p>
      </Part>
      <Part title="Signaler un contenu">
        <p>
          Pour signaler un contenu illicite ou une erreur, écrivez à{" "}
          <a href={`mailto:${p.email}`}>{p.email}</a> en indiquant l’adresse de la page et le motif.
        </p>
      </Part>

      <Language lang="en">
        <h2 style={{ fontSize: 28, margin: "24px 0 0" }}>Legal notice</h2>
        <Updated label="Updated:" />
        <Part title="Publisher">
          <p>
            {p.name}, sole proprietor registered in France (entrepreneur individuel).
            <br />
            SIRET: {p.siret}
            <br />
            Address: {p.address}
            <br />
            E-mail: <a href={`mailto:${p.email}`}>{p.email}</a>
            <br />
            Phone: {p.phone}
          </p>
        </Part>
        <Part title="Hosting">
          <p>
            {HOST.name}, {HOST.address}, {HOST.register}, phone {HOST.phone}.
          </p>
        </Part>
        <Part title="Code and content">
          <p>
            The code is published under AGPL-3.0. The name Areopagus and the texts of the site
            belong to the publisher. Everyone remains the author of what they publish in their
            space. Places: GeoNames, CC BY 4.0. Map outline: Natural Earth, public domain.
          </p>
        </Part>
        <Part title="Report content">
          <p>
            To report unlawful content or a mistake, write to{" "}
            <a href={`mailto:${p.email}`}>{p.email}</a> with the address of the page and the reason.
          </p>
        </Part>
      </Language>
      <Links />
    </Screen>
  );
}
