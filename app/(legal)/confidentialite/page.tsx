"use client"

import { useState } from "react"

type Lang = "en" | "fr"

const C = {
  en: {
    meta_title: "Privacy Policy",
    h1: "Privacy Policy",
    updated: "Last updated: January 1, 2025",
    sections: [
      {
        title: "1. Data Controller",
        content: (
          <>
            <p>
              CODShipEurope Lda, a company incorporated under Portuguese law, with its registered office in Lisbon, Portugal,
              is responsible for processing personal data collected through the CODShipEurope platform. Contact:{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span>
            </p>
          </>
        ),
      },
    ],
  },
  fr: {
    meta_title: "Politique de confidentialité",
    h1: "Politique de confidentialité",
    updated: "Dernière mise à jour : 1er janvier 2025",
  },
}

export default function Confidentialite() {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white mb-0">
          {lang === "en" ? "Privacy Policy" : "Politique de confidentialité"}
        </h1>
        <button
          onClick={() => setLang(l => l === "en" ? "fr" : "en")}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all">
          {lang === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
        </button>
      </div>
      <p className="text-neutral-500 text-sm mb-12">
        {lang === "en" ? "Last updated: January 1, 2025" : "Dernière mise à jour : 1er janvier 2025"}
      </p>

      {lang === "en" ? (
        <>
          <Section title="1. Data Controller">
            <p>
              CODShipEurope Lda, a company incorporated under Portuguese law, with its registered office in Lisbon, Portugal,
              is responsible for processing personal data collected through the CODShipEurope platform. Contact:{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span>
            </p>
          </Section>
          <Section title="2. Data Collected">
            <p>When you register and use the platform, we collect:</p>
            <ul>
              <li><strong className="text-white">Identity data:</strong> first name, last name, email address, phone number</li>
              <li><strong className="text-white">Professional data:</strong> your store name, country of activity, URLs of your Shopify stores</li>
              <li><strong className="text-white">Financial data:</strong> bank account details for transfers (IBAN/BIC), transaction history</li>
              <li><strong className="text-white">Browsing data:</strong> IP address, browser type, pages visited, session duration</li>
              <li><strong className="text-white">Order data:</strong> your end customers' information (name, address, phone) in the context of the COD delivery service</li>
            </ul>
          </Section>
          <Section title="3. Purposes and Legal Bases">
            <table>
              <thead>
                <tr>
                  <th className="text-white text-left pr-6 pb-2">Purpose</th>
                  <th className="text-white text-left pb-2">Legal basis</th>
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                <tr><td className="pr-6 py-1.5">Account creation and management</td><td>Contract performance</td></tr>
                <tr><td className="pr-6 py-1.5">Order processing and deliveries</td><td>Contract performance</td></tr>
                <tr><td className="pr-6 py-1.5">Bank transfers</td><td>Contract performance</td></tr>
                <tr><td className="pr-6 py-1.5">Transactional emails</td><td>Contract performance</td></tr>
                <tr><td className="pr-6 py-1.5">Marketing communications</td><td>Consent</td></tr>
                <tr><td className="pr-6 py-1.5">Service improvement and analytics</td><td>Legitimate interest</td></tr>
                <tr><td className="pr-6 py-1.5">Legal and accounting compliance</td><td>Legal obligation</td></tr>
              </tbody>
            </table>
          </Section>
          <Section title="4. Data Sharing">
            <p>Your data is never sold to third parties. It may be shared with:</p>
            <ul>
              <li><strong className="text-white">Technical providers:</strong> cloud infrastructure, database (Supabase), transactional emails</li>
              <li><strong className="text-white">Logistics partners:</strong> carriers in Europe for package delivery</li>
              <li><strong className="text-white">Banking institutions:</strong> for transfer processing</li>
              <li><strong className="text-white">Competent authorities:</strong> upon judicial or legal request</li>
            </ul>
            <p>All our sub-processors are bound by a GDPR-compliant data processing agreement.</p>
          </Section>
          <Section title="5. Retention Periods">
            <ul>
              <li>Account data: duration of contractual relationship + 3 years</li>
              <li>Financial and billing data: 10 years (legal obligation)</li>
              <li>Browsing data and logs: 13 months</li>
              <li>Order data: 5 years after the last order</li>
            </ul>
          </Section>
          <Section title="6. Cookies">
            <p>CODShipEurope uses only strictly necessary cookies for the service to function:</p>
            <ul>
              <li>Authentication session cookie (duration: session)</li>
              <li>Language preference cookie (duration: 1 year)</li>
            </ul>
            <p>No advertising or third-party tracking cookies are used without your explicit consent.</p>
          </Section>
          <Section title="7. Your Rights">
            <p>Under the GDPR, you have the following rights over your personal data:</p>
            <ul>
              <li><strong className="text-white">Right of access:</strong> obtain a copy of your data</li>
              <li><strong className="text-white">Right to rectification:</strong> correct inaccurate data</li>
              <li><strong className="text-white">Right to erasure:</strong> request deletion of your data</li>
              <li><strong className="text-white">Right to data portability:</strong> receive your data in a structured format</li>
              <li><strong className="text-white">Right to object:</strong> object to certain processing operations</li>
              <li><strong className="text-white">Right to restriction:</strong> limit the processing of your data</li>
            </ul>
            <p>
              To exercise your rights, send an email to{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span> with a copy of your ID. We will respond within 30 days.
            </p>
          </Section>
          <Section title="8. Security">
            <p>
              CODShipEurope implements appropriate technical and organizational measures to protect your data: TLS encryption in
              transit, encryption at rest, restricted access on a least-privilege basis, secure authentication, and access logging.
            </p>
          </Section>
          <Section title="9. Contact and Complaints">
            <p>For any questions regarding the protection of your data: <span className="text-orange-400">contact@codshipeurope.com</span></p>
            <p>
              You also have the right to lodge a complaint with the CNPD (National Data Protection Commission), the
              competent supervisory authority in Portugal.
            </p>
          </Section>
        </>
      ) : (
        <>
          <Section title="1. Responsable du traitement">
            <p>
              CODShipEurope Lda, société de droit portugais, dont le siège social est situé à Lisbonne, Portugal, est responsable
              du traitement des données personnelles collectées via la plateforme CODShipEurope. Contact :{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span>
            </p>
          </Section>
          <Section title="2. Données collectées">
            <p>Lors de votre inscription et utilisation de la plateforme, nous collectons :</p>
            <ul>
              <li><strong className="text-white">Données d'identité :</strong> prénom, nom, adresse e-mail, numéro de téléphone</li>
              <li><strong className="text-white">Données professionnelles :</strong> nom de votre boutique, pays d'activité, URL de vos boutiques Shopify</li>
              <li><strong className="text-white">Données financières :</strong> coordonnées bancaires pour les virements (IBAN/BIC), historique des transactions</li>
              <li><strong className="text-white">Données de navigation :</strong> adresse IP, type de navigateur, pages consultées, durée des sessions</li>
              <li><strong className="text-white">Données de commandes :</strong> informations sur vos clients finaux (nom, adresse, téléphone) dans le cadre du service de livraison COD</li>
            </ul>
          </Section>
          <Section title="3. Finalités et bases légales du traitement">
            <table>
              <thead>
                <tr>
                  <th className="text-white text-left pr-6 pb-2">Finalité</th>
                  <th className="text-white text-left pb-2">Base légale</th>
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                <tr><td className="pr-6 py-1.5">Création et gestion du compte</td><td>Exécution du contrat</td></tr>
                <tr><td className="pr-6 py-1.5">Traitement des commandes et livraisons</td><td>Exécution du contrat</td></tr>
                <tr><td className="pr-6 py-1.5">Virements bancaires</td><td>Exécution du contrat</td></tr>
                <tr><td className="pr-6 py-1.5">Envoi d'e-mails transactionnels</td><td>Exécution du contrat</td></tr>
                <tr><td className="pr-6 py-1.5">Communications marketing</td><td>Consentement</td></tr>
                <tr><td className="pr-6 py-1.5">Amélioration du service et analytics</td><td>Intérêt légitime</td></tr>
                <tr><td className="pr-6 py-1.5">Conformité légale et comptable</td><td>Obligation légale</td></tr>
              </tbody>
            </table>
          </Section>
          <Section title="4. Partage des données">
            <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
            <ul>
              <li><strong className="text-white">Prestataires techniques :</strong> infrastructure cloud, base de données (Supabase), e-mails transactionnels</li>
              <li><strong className="text-white">Partenaires logistiques :</strong> transporteurs en Europe pour l'acheminement des colis</li>
              <li><strong className="text-white">Établissements bancaires :</strong> pour le traitement des virements</li>
              <li><strong className="text-white">Autorités compétentes :</strong> sur réquisition judiciaire ou légale</li>
            </ul>
            <p>Tous nos sous-traitants sont liés par un accord de traitement des données conforme au RGPD.</p>
          </Section>
          <Section title="5. Durée de conservation">
            <ul>
              <li>Données de compte : durée de la relation contractuelle + 3 ans</li>
              <li>Données financières et de facturation : 10 ans (obligation légale)</li>
              <li>Données de navigation et logs : 13 mois</li>
              <li>Données de commandes : 5 ans après la dernière commande</li>
            </ul>
          </Section>
          <Section title="6. Cookies">
            <p>CODShipEurope utilise des cookies strictement nécessaires au fonctionnement du service :</p>
            <ul>
              <li>Cookie de session d'authentification (durée : session)</li>
              <li>Cookie de préférences de langue (durée : 1 an)</li>
            </ul>
            <p>Aucun cookie publicitaire ou de suivi tiers n'est utilisé sans votre consentement explicite.</p>
          </Section>
          <Section title="7. Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
            <ul>
              <li><strong className="text-white">Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong className="text-white">Droit de rectification :</strong> corriger des données inexactes</li>
              <li><strong className="text-white">Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong className="text-white">Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong className="text-white">Droit d'opposition :</strong> vous opposer à certains traitements</li>
              <li><strong className="text-white">Droit à la limitation :</strong> limiter le traitement de vos données</li>
            </ul>
            <p>
              Pour exercer vos droits, envoyez un e-mail à{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span> avec une copie de votre pièce d'identité.
              Nous répondrons dans un délai de 30 jours.
            </p>
          </Section>
          <Section title="8. Sécurité">
            <p>
              CODShipEurope met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement TLS en transit, chiffrement au repos, accès restreint selon le principe du moindre privilège,
              authentification sécurisée et journalisation des accès.
            </p>
          </Section>
          <Section title="9. Contact et réclamation">
            <p>
              Pour toute question relative à la protection de vos données :{" "}
              <span className="text-orange-400">contact@codshipeurope.com</span>
            </p>
            <p>
              Vous avez également le droit de déposer une réclamation auprès de la CNPD (Commission Nationale de Protection
              des Données), l'autorité de contrôle compétente au Portugal.
            </p>
          </Section>
        </>
      )}
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
