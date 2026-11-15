import type { Metadata } from "next";
import { LOGIN_TOKEN_MINUTES, SESSION_DAYS } from "@/identity/tokens";
import { HOST, publisher } from "@/legal/details";
import { Language, Links, Part, Updated } from "../legal/text";
import { Screen } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Données personnelles · Areopagus" };

export default function Privacy() {
  const p = publisher();
  const mail = <a href={p.contactHref}>{p.contactLabel}</a>;
  const who = p.address ? `${p.name}, ${p.address}` : p.name;
  return (
    <Screen title="Données personnelles">
      <Updated label="Mise à jour :" />
      <p>
        Areopagus est en version bêta. Cette page dit ce que le site enregistre, pourquoi, et
        comment le faire effacer. Responsable du traitement : {who}, {mail}.
      </p>
      <Part title="Ce que le site enregistre">
        <ul>
          <li>
            Votre adresse e-mail, pour vous connecter. Elle n’est jamais affichée sur votre page.
          </li>
          <li>
            Ce que vous écrivez dans votre espace : adresse de la page, nom, lieu, savoir-faire,
            présentation. Ces informations sont publiques dès que vous les enregistrez.
          </li>
          <li>
            Si vous ajoutez une clé d’accès (passkey) : sa clé publique. L’empreinte ou le visage ne
            quittent jamais votre appareil.
          </li>
          <li>
            Pour la sécurité : une empreinte chiffrée de votre adresse IP lors d’une demande de lien
            de connexion, et les journaux techniques de l’hébergeur.
          </li>
          <li>
            Vos questions et réponses : publiques, avec le nom de votre espace. Quand quelqu’un vous
            pose une question ou répond à la vôtre, un e-mail vous prévient. Vous pouvez couper ces
            e-mails sur votre page.
          </li>
          <li>
            Si vous signalez un contenu : votre message, une empreinte chiffrée de votre adresse IP
            et, si vous la donnez, votre adresse e-mail pour la réponse.
          </li>
        </ul>
        <p>
          N’écrivez dans votre espace rien que vous ne voulez pas rendre public, en particulier sur
          votre santé, vos convictions ou votre vie privée.
        </p>
      </Part>
      <Part title="Pourquoi et sur quelle base">
        <p>
          Créer votre compte et afficher votre espace : exécution du service que vous demandez
          (article 6.1.b du RGPD). Limiter les abus et protéger les comptes : intérêt légitime
          (article 6.1.f). Il n’y a ni publicité, ni mesure d’audience, ni revente de données.
        </p>
      </Part>
      <Part title="Cookies">
        <p>
          Deux cookies strictement nécessaires : un cookie de session après connexion (
          {SESSION_DAYS} jours) et un cookie de quelques minutes pendant l’utilisation d’une clé
          d’accès. Aucun cookie de suivi, donc aucune bannière.
        </p>
      </Part>
      <Part title="Qui traite les données">
        <ul>
          <li>
            {HOST.name} (Nantes, France) : hébergement de l’application et de la base de données.
          </li>
          <li>Scaleway SAS (Paris, France) : envoi des e-mails de connexion.</li>
          <li>OVH SAS (Roubaix, France) : nom de domaine.</li>
          <li>
            BunnyWay d.o.o. (Slovénie) : les polices sont chargées depuis fonts.bunny.net, qui
            reçoit votre adresse IP le temps de la requête.
          </li>
        </ul>
        <p>Les données sont hébergées dans l’Union européenne.</p>
      </Part>
      <Part title="Durées de conservation">
        <p>
          Lien de connexion : valable {LOGIN_TOKEN_MINUTES} minutes, effacé au bout d’un jour.
          Session : {SESSION_DAYS} jours. Compte et espace : jusqu’à votre demande de suppression.
        </p>
      </Part>
      <Part title="Vos droits">
        <p>
          Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, leur
          portabilité, ou vous opposer à un traitement, en écrivant à {mail}. Réponse sous un mois.
          Vous pouvez aussi saisir la CNIL :{" "}
          <a href="https://www.cnil.fr/fr/plaintes">cnil.fr/fr/plaintes</a>.
        </p>
      </Part>
      <Part title="Âge">
        <p>Le site s’adresse aux personnes de 15 ans et plus.</p>
      </Part>

      <Language lang="en">
        <h2 style={{ fontSize: 28, margin: "24px 0 0" }}>Privacy</h2>
        <Updated label="Updated:" />
        <p>
          Areopagus is in beta. This page says what the site stores, why, and how to have it erased.
          Controller: {who}, {mail}.
        </p>
        <Part title="What the site stores">
          <ul>
            <li>Your e-mail address, to sign you in. It is never shown on your page.</li>
            <li>
              What you write in your space: page address, name, place, skills, description. It is
              public as soon as you save it.
            </li>
            <li>
              If you add a passkey: its public key. Your fingerprint or face never leave your
              device.
            </li>
            <li>
              For security: a hashed form of your IP address when a sign-in link is requested, and
              the technical logs of the hosting company.
            </li>
            <li>
              Your questions and answers: public, with the name of your space. When someone asks you
              a question or answers yours, an e-mail tells you. You can turn these e-mails off on
              your page.
            </li>
            <li>
              If you report content: your message, a hashed form of your IP address and, if you give
              it, your e-mail address for the answer.
            </li>
          </ul>
          <p>
            Do not write in your space anything you do not want to be public, in particular about
            your health, your beliefs or your private life.
          </p>
        </Part>
        <Part title="Why, and on what legal basis">
          <p>
            Creating your account and showing your space: performing the service you ask for (GDPR
            article 6.1.b). Limiting abuse and protecting accounts: legitimate interest (article
            6.1.f). There is no advertising, no audience measurement and no resale of data.
          </p>
        </Part>
        <Part title="Cookies">
          <p>
            Two strictly necessary cookies: a session cookie after sign-in ({SESSION_DAYS} days) and
            a cookie that lives a few minutes while a passkey is used. No tracking cookies, hence no
            banner.
          </p>
        </Part>
        <Part title="Who processes the data">
          <p>
            {HOST.name} (Nantes, France): hosting of the application and database. Scaleway SAS
            (Paris, France): sign-in e-mails. OVH SAS (Roubaix, France): domain name. BunnyWay
            d.o.o. (Slovenia): fonts are loaded from fonts.bunny.net, which receives your IP address
            for the time of the request. Data is hosted in the European Union.
          </p>
        </Part>
        <Part title="How long">
          <p>
            Sign-in link: valid {LOGIN_TOKEN_MINUTES} minutes, erased after one day. Session:{" "}
            {SESSION_DAYS} days. Account and space: until you ask for deletion.
          </p>
        </Part>
        <Part title="Your rights">
          <p>
            You can ask for access, correction, erasure or portability of your data, or object to a
            processing, by writing to {mail}. Answer within one month. You can also complain to the
            French authority, the CNIL: <a href="https://www.cnil.fr/en/complaints">cnil.fr</a>.
          </p>
        </Part>
        <Part title="Age">
          <p>The site is meant for people aged 15 and over.</p>
        </Part>
      </Language>
      <Links />
    </Screen>
  );
}
