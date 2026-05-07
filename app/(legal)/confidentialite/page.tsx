import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données personnelles de CODShip.",
}

export default function Confidentialite() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-3xl font-black text-white mb-2">Politique de confidentialité</h1>
      <p className="text-neutral-500 text-sm mb-12">Dernière mise à jour : 1er janvier 2025</p>

      <Section title="1. Responsable du traitement">
        <p>
          CODShip Lda, société de droit portugais, dont le siège social est situé à Lisbonne, Portugal, est responsable
          du traitement des données personnelles collectées via la plateforme CODShip. Contact :{" "}
          <span className="text-orange-400">privacy@codship.com</span>
        </p>
      </Section>

      <Section title="2. Données collectées">
        <p>Lors de votre inscription et utilisation de la plateforme, nous collectons :</p>
        <ul>
          <li>
            <strong className="text-white">Données d'identité :</strong> prénom, nom, adresse e-mail, numéro de
            téléphone
          </li>
          <li>
            <strong className="text-white">Données professionnelles :</strong> nom de votre boutique, pays d'activité,
            URL de vos boutiques Shopify
          </li>
          <li>
            <strong className="text-white">Données financières :</strong> coordonnées bancaires pour les virements
            (IBAN/BIC), historique des transactions
          </li>
          <li>
            <strong className="text-white">Données de navigation :</strong> adresse IP, type de navigateur, pages
            consultées, durée des sessions
          </li>
          <li>
            <strong className="text-white">Données de commandes :</strong> informations sur vos clients finaux
            (nom, adresse, téléphone) dans le cadre du service de livraison COD
          </li>
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
          <li>
            <strong className="text-white">Prestataires techniques :</strong> hébergement (Vercel/AWS), base de données
            (Supabase), e-mails transactionnels
          </li>
          <li>
            <strong className="text-white">Partenaires logistiques :</strong> transporteurs en Europe pour
            l'acheminement des colis
          </li>
          <li>
            <strong className="text-white">Établissements bancaires :</strong> pour le traitement des virements
          </li>
          <li>
            <strong className="text-white">Autorités compétentes :</strong> sur réquisition judiciaire ou légale
          </li>
        </ul>
        <p>
          Tous nos sous-traitants sont liés par un accord de traitement des données conforme au RGPD.
        </p>
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
        <p>CODShip utilise des cookies strictement nécessaires au fonctionnement du service :</p>
        <ul>
          <li>Cookie de session d'authentification (durée : session)</li>
          <li>Cookie de préférences de langue (durée : 1 an)</li>
        </ul>
        <p>
          Aucun cookie publicitaire ou de suivi tiers n'est utilisé sans votre consentement explicite.
        </p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants
          sur vos données personnelles :
        </p>
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
          <span className="text-orange-400">privacy@codship.com</span> avec une copie de votre pièce d'identité.
          Nous répondrons dans un délai de 30 jours.
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          CODShip met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
          chiffrement TLS en transit, chiffrement au repos, accès restreint selon le principe du moindre privilège,
          authentification sécurisée et journalisation des accès.
        </p>
      </Section>

      <Section title="9. Contact et réclamation">
        <p>
          Pour toute question relative à la protection de vos données :{" "}
          <span className="text-orange-400">privacy@codship.com</span>
        </p>
        <p>
          Vous avez également le droit de déposer une réclamation auprès de la CNPD (Commission Nationale de Protection
          des Données), l'autorité de contrôle compétente au Portugal.
        </p>
      </Section>
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
