"use client"

import { useState } from "react"

type Lang = "en" | "fr"

export default function MentionsLegales() {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white mb-0">
          {lang === "en" ? "Legal Notice" : "Mentions légales"}
        </h1>
        <button
          onClick={() => setLang(l => l === "en" ? "fr" : "en")}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all">
          {lang === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
        </button>
      </div>
      <p className="text-neutral-500 text-sm mb-12">
        {lang === "en"
          ? "In accordance with applicable European legislation"
          : "Conformément à la législation européenne en vigueur"}
      </p>

      {lang === "en" ? (
        <>
          <Section title="1. Website Publisher">
            <Row label="Legal name"           value="CODShipEurope Lda" />
            <Row label="Legal form"           value="Sociedade por Quotas (Lda) — equivalent to a limited liability company" />
            <Row label="Registered office"    value="Lisbon, Portugal" />
            <Row label="Share capital"        value="€5,000" />
            <Row label="Tax ID"               value="PT 516 XXX XXX" />
            <Row label="Publication director" value="CODShipEurope — General Management" />
            <Row label="Email"                value="contact@codshipeurope.com" />
            <Row label="Phone"                value="+351 912 000 000" />
          </Section>
          <Section title="2. Hosting">
            <Row label="Company" value="Vercel Inc." />
            <Row label="Address" value="440 N Barranca Ave #4133, Covina, CA 91723, United States" />
            <Row label="Website" value="vercel.com" />
            <p className="mt-3">
              Data is hosted on servers located in the European Union (Frankfurt, Germany) and governed by
              GDPR-compliant contractual guarantees.
            </p>
          </Section>
          <Section title="3. Intellectual Property">
            <p>
              All content on the CODShipEurope website (texts, images, logos, icons, source code, platform architecture) is
              protected by intellectual property rights and is the exclusive property of CODShipEurope Lda or its partners.
            </p>
            <p>
              Any reproduction, distribution, modification, adaptation, retransmission, or publication of these elements
              is strictly prohibited without prior written consent from CODShipEurope. Any violation may be subject to legal
              proceedings.
            </p>
          </Section>
          <Section title="4. Trademarks">
            <p>
              The trademark "CODShipEurope" and the associated logo are registered or pending registration. Any unauthorized
              use constitutes infringement subject to penalties.
            </p>
            <p>
              Shopify® is a registered trademark of Shopify Inc. CODShipEurope is not affiliated with Shopify Inc. but
              provides a technical integration with the Shopify platform via its official API.
            </p>
          </Section>
          <Section title="5. Hyperlinks">
            <p>
              CODShipEurope may contain links to third-party websites. These links are provided for informational purposes only.
              CODShipEurope is not responsible for the content of third-party websites and cannot be held responsible for their
              privacy policies or practices.
            </p>
            <p>
              Creating links to the CODShipEurope website is permitted provided that such links are not used for commercial
              purposes without prior authorization.
            </p>
          </Section>
          <Section title="6. Cookies">
            <p>
              The CODShipEurope website uses only functional cookies strictly necessary for its proper operation (session
              maintenance, language preferences). No advertising or profiling cookies are set without explicit consent.
            </p>
            <p>
              You may configure your browser to refuse cookies, but this may affect your experience on the platform.
            </p>
          </Section>
          <Section title="7. Governing Law">
            <p>
              These legal notices are subject to Portuguese law and European Union law. Any dispute relating to their
              interpretation shall be subject to the exclusive jurisdiction of the courts of Lisbon, Portugal.
            </p>
          </Section>
          <Section title="8. Contact">
            <p>For any questions, complaints, or information requests:</p>
            <Row label="General email"     value="contact@codshipeurope.com" />
            <Row label="Technical support" value="support@codshipeurope.com" />
            <Row label="Data protection"   value="privacy@codshipeurope.com" />
            <Row label="Legal notices"     value="legal@codshipeurope.com" />
          </Section>
        </>
      ) : (
        <>
          <Section title="1. Éditeur du site">
            <Row label="Raison sociale"                   value="CODShipEurope Lda" />
            <Row label="Forme juridique"                  value="Sociedade por Quotas (Lda) — équivalent SARL" />
            <Row label="Siège social"                     value="Lisbonne, Portugal" />
            <Row label="Capital social"                   value="5 000 EUR" />
            <Row label="Numéro d'identification fiscale"  value="PT 516 XXX XXX" />
            <Row label="Directeur de la publication"      value="CODShipEurope — Direction générale" />
            <Row label="E-mail"                           value="contact@codshipeurope.com" />
            <Row label="Téléphone"                        value="+351 912 000 000" />
          </Section>
          <Section title="2. Hébergeur">
            <Row label="Société"   value="Vercel Inc." />
            <Row label="Adresse"   value="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
            <Row label="Site web"  value="vercel.com" />
            <p className="mt-3">
              Les données sont hébergées sur des serveurs situés dans l'Union Européenne (Frankfurt, Allemagne) et
              encadrées par des garanties contractuelles conformes au RGPD.
            </p>
          </Section>
          <Section title="3. Propriété intellectuelle">
            <p>
              L'ensemble du contenu du site CODShipEurope (textes, images, logos, icônes, code source, architecture de la
              plateforme) est protégé par les droits de propriété intellectuelle et est la propriété exclusive de CODShipEurope
              Lda ou de ses partenaires.
            </p>
            <p>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces éléments
              est strictement interdite sans accord écrit préalable de CODShipEurope. Toute violation pourra faire l'objet de
              poursuites judiciaires.
            </p>
          </Section>
          <Section title="4. Marques">
            <p>
              La marque « CODShipEurope » ainsi que le logo associé sont des marques déposées ou en cours de dépôt.
              Toute utilisation non autorisée constitue une contrefaçon passible de sanctions.
            </p>
            <p>
              Shopify® est une marque déposée de Shopify Inc. CODShipEurope n'est pas affilié à Shopify Inc. mais propose
              une intégration technique avec la plateforme Shopify via son API officielle.
            </p>
          </Section>
          <Section title="5. Liens hypertextes">
            <p>
              CODShipEurope peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif uniquement.
              CODShipEurope n'est pas responsable du contenu des sites tiers et ne saurait être tenu responsable de leur
              politique de confidentialité ou de leurs pratiques.
            </p>
            <p>
              La création de liens vers le site CODShipEurope est autorisée sous réserve que ces liens ne soient pas utilisés
              à des fins commerciales sans autorisation préalable.
            </p>
          </Section>
          <Section title="6. Cookies">
            <p>
              Le site CODShipEurope utilise uniquement des cookies fonctionnels strictement nécessaires à son bon
              fonctionnement (maintien de session, préférences de langue). Aucun cookie publicitaire ou de profilage
              n'est déposé sans consentement explicite.
            </p>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter votre expérience
              sur la plateforme.
            </p>
          </Section>
          <Section title="7. Droit applicable">
            <p>
              Les présentes mentions légales sont soumises au droit portugais et au droit de l'Union Européenne. Tout
              litige relatif à leur interprétation sera soumis à la compétence exclusive des tribunaux de Lisbonne,
              Portugal.
            </p>
          </Section>
          <Section title="8. Contact">
            <p>Pour toute question, réclamation ou demande d'information :</p>
            <Row label="E-mail général"       value="contact@codshipeurope.com" />
            <Row label="Support technique"    value="support@codshipeurope.com" />
            <Row label="Protection des données" value="privacy@codshipeurope.com" />
            <Row label="Mentions légales"     value="legal@codshipeurope.com" />
          </Section>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-neutral-600 min-w-[180px] flex-shrink-0">{label}</span>
      <span className="text-neutral-300">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/[0.06]">{title}</h2>
      <div className="space-y-3 text-neutral-400 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
