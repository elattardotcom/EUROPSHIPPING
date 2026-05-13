"use client"

import { useState } from "react"

type Lang = "en" | "fr"

export default function RGPD() {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white mb-0">
          {lang === "en" ? "GDPR — Data Protection" : "RGPD — Protection des données"}
        </h1>
        <button
          onClick={() => setLang(l => l === "en" ? "fr" : "en")}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all">
          {lang === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
        </button>
      </div>
      <p className="text-neutral-500 text-sm mb-12">
        {lang === "en"
          ? "Regulation (EU) 2016/679 — Last updated: January 1, 2025"
          : "Règlement (UE) 2016/679 — Dernière mise à jour : 1er janvier 2025"}
      </p>

      {lang === "en" ? (
        <>
          <div className="mb-10 p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
            <p className="text-orange-300 text-sm font-semibold mb-1">Our commitment</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              CODShipEurope is fully compliant with the General Data Protection Regulation (GDPR). As a platform operating in
              Europe, protecting your data and that of your customers is an absolute priority.
            </p>
          </div>
          <Section title="1. Who are we?">
            <p>
              <strong className="text-white">Data Controller:</strong> CODShipEurope Lda<br />
              <strong className="text-white">Registered office:</strong> Lisbon, Portugal<br />
              <strong className="text-white">DPO contact:</strong>{" "}
              <span className="text-orange-400">dpo@codshipeurope.com</span>
            </p>
          </Section>
          <Section title="2. Data Processed and Legal Bases">
            <p>
              CODShipEurope processes two categories of personal data: those of its{" "}
              <strong className="text-white">merchant users</strong> (you) and those of your{" "}
              <strong className="text-white">end customers</strong> (COD buyers).
            </p>
            <p>
              <strong className="text-white">Merchant data:</strong> processed on the basis of contract performance and
              legitimate interest (service improvement).
            </p>
            <p>
              <strong className="text-white">End customer data:</strong> processed on the basis of the delivery contract.
              As a merchant using CODShipEurope, you are the data controller for your customers' data; CODShipEurope acts as a
              data processor.
            </p>
          </Section>
          <Section title="3. Rights of Data Subjects">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { right: "Right of access (Art. 15)", desc: "Obtain confirmation of processing and a copy of your data." },
                { right: "Right to rectification (Art. 16)", desc: "Have inaccurate or incomplete data corrected." },
                { right: "Right to erasure (Art. 17)", desc: "Request deletion of your data under certain conditions." },
                { right: "Right to data portability (Art. 20)", desc: "Receive your data in a structured, machine-readable format." },
                { right: "Right to object (Art. 21)", desc: "Object to processing for marketing or legitimate interest purposes." },
                { right: "Right to restriction (Art. 18)", desc: "Limit processing where the accuracy of data is contested." },
              ].map(item => (
                <div key={item.right} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-white text-xs font-semibold mb-1">{item.right}</p>
                  <p className="text-neutral-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              To exercise your rights: <span className="text-orange-400">dpo@codshipeurope.com</span>. Response time: maximum 30 days.
            </p>
          </Section>
          <Section title="4. Retention Periods">
            <ul>
              <li>Active account data: throughout the duration of the contractual relationship</li>
              <li>Data after termination: 3 years (civil limitation period)</li>
              <li>Billing data: 10 years (accounting and tax obligation)</li>
              <li>Technical logs: 12 months</li>
              <li>Delivery data: 5 years</li>
            </ul>
          </Section>
          <Section title="5. International Transfers">
            <p>
              CODShipEurope uses sub-processors whose servers may be located outside the European Union. These transfers are
              governed by <strong className="text-white">Standard Contractual Clauses (SCCs)</strong> approved by the
              European Commission, ensuring a level of protection equivalent to the GDPR.
            </p>
          </Section>
          <Section title="6. Sub-processors">
            <p>CODShipEurope engages the following sub-processors, all GDPR compliant:</p>
            <ul>
              <li><strong className="text-white">Supabase:</strong> database and authentication</li>
              <li><strong className="text-white">Vercel:</strong> hosting and deployment</li>
              <li><strong className="text-white">Stripe:</strong> payment processing</li>
              <li><strong className="text-white">Resend:</strong> transactional email sending</li>
            </ul>
          </Section>
          <Section title="7. Security Measures">
            <ul>
              <li>TLS 1.3 encryption for all communications</li>
              <li>Encryption of sensitive data at rest (AES-256)</li>
              <li>Secure authentication with bcrypt password hashing</li>
              <li>Role-based access control (RBAC)</li>
              <li>Access logging and monitoring</li>
              <li>Daily encrypted backups</li>
              <li>Regular security testing</li>
            </ul>
          </Section>
          <Section title="8. Data Breaches">
            <p>
              In the event of a personal data breach likely to result in a risk to your rights and freedoms, CODShipEurope
              commits to notifying you within <strong className="text-white">72 hours</strong> of becoming aware of it,
              in accordance with Article 33 of the GDPR.
            </p>
          </Section>
          <Section title="9. Complaint">
            <p>
              If you believe that the processing of your data does not comply with the GDPR, you have the right to lodge
              a complaint with the competent supervisory authority:
            </p>
            <p>
              <strong className="text-white">CNPD (Portugal):</strong> Rua de São Bento, 148-3°, 1200-821 Lisbon —{" "}
              <span className="text-orange-400">www.cnpd.pt</span>
            </p>
          </Section>
        </>
      ) : (
        <>
          <div className="mb-10 p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
            <p className="text-orange-300 text-sm font-semibold mb-1">Notre engagement</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              CODShipEurope est pleinement conforme au Règlement Général sur la Protection des Données (RGPD). En tant que
              plateforme opérant en Europe, la protection de vos données et celles de vos clients est une priorité absolue.
            </p>
          </div>
          <Section title="1. Qui sommes-nous ?">
            <p>
              <strong className="text-white">Responsable du traitement :</strong> CODShipEurope Lda<br />
              <strong className="text-white">Siège social :</strong> Lisbonne, Portugal<br />
              <strong className="text-white">Contact DPO :</strong>{" "}
              <span className="text-orange-400">dpo@codshipeurope.com</span>
            </p>
          </Section>
          <Section title="2. Données traitées et bases légales">
            <p>
              CODShipEurope traite deux catégories de données personnelles : celles de ses{" "}
              <strong className="text-white">utilisateurs marchands</strong> (vous) et celles de vos{" "}
              <strong className="text-white">clients finaux</strong> (acheteurs COD).
            </p>
            <p>
              <strong className="text-white">Données marchands :</strong> traitées sur la base de l'exécution du contrat
              et de l'intérêt légitime (amélioration du service).
            </p>
            <p>
              <strong className="text-white">Données clients finaux :</strong> traitées sur la base de l'exécution du
              contrat de livraison. En tant que marchand utilisant CODShipEurope, vous êtes responsable de traitement pour les
              données de vos clients ; CODShipEurope agit en qualité de sous-traitant.
            </p>
          </Section>
          <Section title="3. Droits des personnes concernées">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { right: "Droit d'accès (Art. 15)", desc: "Obtenir confirmation du traitement et une copie de vos données." },
                { right: "Droit de rectification (Art. 16)", desc: "Faire corriger des données inexactes ou incomplètes." },
                { right: "Droit à l'effacement (Art. 17)", desc: "Demander la suppression de vos données sous conditions." },
                { right: "Droit à la portabilité (Art. 20)", desc: "Recevoir vos données dans un format structuré et lisible par machine." },
                { right: "Droit d'opposition (Art. 21)", desc: "S'opposer au traitement à des fins de marketing ou d'intérêt légitime." },
                { right: "Droit à la limitation (Art. 18)", desc: "Limiter le traitement en cas de contestation de l'exactitude des données." },
              ].map(item => (
                <div key={item.right} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-white text-xs font-semibold mb-1">{item.right}</p>
                  <p className="text-neutral-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Pour exercer vos droits : <span className="text-orange-400">dpo@codshipeurope.com</span>. Délai de réponse : 30 jours maximum.
            </p>
          </Section>
          <Section title="4. Durées de conservation">
            <ul>
              <li>Données de compte actif : pendant toute la durée de la relation contractuelle</li>
              <li>Données après résiliation : 3 ans (prescription civile)</li>
              <li>Données de facturation : 10 ans (obligation comptable et fiscale)</li>
              <li>Logs techniques : 12 mois</li>
              <li>Données de livraison : 5 ans</li>
            </ul>
          </Section>
          <Section title="5. Transferts internationaux">
            <p>
              CODShipEurope utilise des sous-traitants dont les serveurs peuvent être situés en dehors de l'Union Européenne.
              Ces transferts sont encadrés par des{" "}
              <strong className="text-white">Clauses Contractuelles Types (CCT)</strong> approuvées par la Commission
              Européenne, garantissant un niveau de protection équivalent au RGPD.
            </p>
          </Section>
          <Section title="6. Sous-traitants">
            <p>CODShipEurope fait appel aux sous-traitants suivants, tous conformes au RGPD :</p>
            <ul>
              <li><strong className="text-white">Supabase :</strong> base de données et authentification</li>
              <li><strong className="text-white">Vercel :</strong> hébergement et déploiement</li>
              <li><strong className="text-white">Stripe :</strong> traitement des paiements</li>
              <li><strong className="text-white">Resend :</strong> envoi d'e-mails transactionnels</li>
            </ul>
          </Section>
          <Section title="7. Mesures de sécurité">
            <ul>
              <li>Chiffrement TLS 1.3 pour toutes les communications</li>
              <li>Chiffrement des données sensibles au repos (AES-256)</li>
              <li>Authentification sécurisée avec hachage bcrypt des mots de passe</li>
              <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
              <li>Journalisation et surveillance des accès</li>
              <li>Sauvegardes quotidiennes chiffrées</li>
              <li>Tests de sécurité réguliers</li>
            </ul>
          </Section>
          <Section title="8. Violations de données">
            <p>
              En cas de violation de données à caractère personnel susceptible d'engendrer un risque pour vos droits et
              libertés, CODShipEurope s'engage à vous notifier dans un délai de{" "}
              <strong className="text-white">72 heures</strong> après en avoir pris connaissance, conformément à l'article
              33 du RGPD.
            </p>
          </Section>
          <Section title="9. Réclamation">
            <p>
              Si vous estimez que le traitement de vos données ne respecte pas le RGPD, vous avez le droit de déposer une
              réclamation auprès de l'autorité de contrôle compétente :
            </p>
            <p>
              <strong className="text-white">CNPD (Portugal) :</strong> Rua de São Bento, 148-3°, 1200-821 Lisbonne —{" "}
              <span className="text-orange-400">www.cnpd.pt</span>
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
