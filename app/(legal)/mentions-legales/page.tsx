import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de CODShip — éditeur, hébergeur, propriété intellectuelle.",
}

export default function MentionsLegales() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-3xl font-black text-white mb-2">Mentions légales</h1>
      <p className="text-neutral-500 text-sm mb-12">Conformément à la législation européenne en vigueur</p>

      <Section title="1. Éditeur du site">
        <Row label="Raison sociale" value="CODShip Lda" />
        <Row label="Forme juridique" value="Sociedade por Quotas (Lda) — équivalent SARL" />
        <Row label="Siège social" value="Lisbonne, Portugal" />
        <Row label="Capital social" value="5 000 EUR" />
        <Row label="Numéro d'identification fiscale" value="PT 516 XXX XXX" />
        <Row label="Directeur de la publication" value="CODShip — Direction générale" />
        <Row label="E-mail" value="contact@codship.com" />
        <Row label="Téléphone" value="+351 912 000 000" />
      </Section>

      <Section title="2. Hébergeur">
        <Row label="Société" value="Vercel Inc." />
        <Row label="Adresse" value="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
        <Row label="Site web" value="vercel.com" />
        <p className="mt-3">
          Les données sont hébergées sur des serveurs situés dans l'Union Européenne (Frankfurt, Allemagne) et
          encadrées par des garanties contractuelles conformes au RGPD.
        </p>
      </Section>

      <Section title="3. Propriété intellectuelle">
        <p>
          L'ensemble du contenu du site CODShip (textes, images, logos, icônes, code source, architecture de la
          plateforme) est protégé par les droits de propriété intellectuelle et est la propriété exclusive de CODShip
          Lda ou de ses partenaires.
        </p>
        <p>
          Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces éléments
          est strictement interdite sans accord écrit préalable de CODShip. Toute violation pourra faire l'objet de
          poursuites judiciaires.
        </p>
      </Section>

      <Section title="4. Marques">
        <p>
          La marque « CODShip » ainsi que le logo associé sont des marques déposées ou en cours de dépôt.
          Toute utilisation non autorisée constitue une contrefaçon passible de sanctions.
        </p>
        <p>
          Shopify® est une marque déposée de Shopify Inc. CODShip n'est pas affilié à Shopify Inc. mais propose
          une intégration technique avec la plateforme Shopify via son API officielle.
        </p>
      </Section>

      <Section title="5. Liens hypertextes">
        <p>
          CODShip peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif uniquement.
          CODShip n'est pas responsable du contenu des sites tiers et ne saurait être tenu responsable de leur
          politique de confidentialité ou de leurs pratiques.
        </p>
        <p>
          La création de liens vers le site CODShip est autorisée sous réserve que ces liens ne soient pas utilisés
          à des fins commerciales sans autorisation préalable.
        </p>
      </Section>

      <Section title="6. Cookies">
        <p>
          Le site CODShip utilise uniquement des cookies fonctionnels strictement nécessaires à son bon
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
        <Row label="E-mail général" value="contact@codship.com" />
        <Row label="Support technique" value="support@codship.com" />
        <Row label="Protection des données" value="privacy@codship.com" />
        <Row label="Mentions légales" value="legal@codship.com" />
      </Section>
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
