import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation de la plateforme CODShip.",
}

export default function Conditions() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-3xl font-black text-white mb-2">Conditions d'utilisation</h1>
      <p className="text-neutral-500 text-sm mb-12">Dernière mise à jour : 1er janvier 2025</p>

      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme
          CODShip, éditée par CODShip Lda, société de droit portugais dont le siège social est situé à Lisbonne, Portugal
          (ci-après « CODShip »).
        </p>
        <p>
          En créant un compte ou en utilisant les services de CODShip, vous acceptez sans réserve les présentes CGU. Si
          vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
        </p>
      </Section>

      <Section title="2. Description du service">
        <p>CODShip est une plateforme SaaS permettant aux marchands e-commerce de :</p>
        <ul>
          <li>Connecter leurs boutiques Shopify et centraliser les commandes Cash on Delivery (COD)</li>
          <li>Gérer la confirmation des commandes par téléphone (leads)</li>
          <li>Suivre l'expédition et la livraison des colis en Europe</li>
          <li>Recevoir des virements bancaires relatifs aux encaissements COD sous 48 heures ouvrées</li>
          <li>Accéder à des tableaux de bord analytiques et gérer un programme d'affiliation</li>
        </ul>
      </Section>

      <Section title="3. Inscription et compte utilisateur">
        <p>
          Pour accéder aux services, l'utilisateur doit créer un compte en fournissant des informations exactes,
          complètes et à jour. L'utilisateur est seul responsable de la confidentialité de ses identifiants et de toutes
          les actions effectuées depuis son compte.
        </p>
        <p>
          CODShip se réserve le droit de suspendre ou supprimer tout compte en cas d'informations erronées, de
          comportement frauduleux ou de violation des présentes CGU.
        </p>
      </Section>

      <Section title="4. Offres et tarification">
        <p>
          CODShip propose trois formules d'abonnement (Starter, Pro, Enterprise) dont les prix et fonctionnalités sont
          détaillés sur la page Tarifs du site. Tous les prix sont exprimés en euros (EUR) hors taxes.
        </p>
        <p>
          Un essai gratuit de 14 jours est offert à tout nouvel inscrit sans obligation de saisir un moyen de paiement.
          À l'issue de la période d'essai, l'accès est suspendu sauf souscription à un abonnement payant.
        </p>
        <p>
          Les abonnements sont renouvelés automatiquement chaque mois. L'utilisateur peut résilier à tout moment depuis
          son espace personnel, avec effet à la fin de la période en cours.
        </p>
      </Section>

      <Section title="5. Obligations de l'utilisateur">
        <p>L'utilisateur s'engage à :</p>
        <ul>
          <li>Utiliser CODShip exclusivement à des fins légales et commerciales légitimes</li>
          <li>Ne pas revendre, sous-licencier ou transférer l'accès à la plateforme à des tiers sans autorisation</li>
          <li>Respecter la législation en vigueur dans les pays où il exerce son activité</li>
          <li>Ne pas tenter d'accéder à des données ou systèmes non autorisés</li>
          <li>Informer CODShip de toute utilisation non autorisée de son compte</li>
        </ul>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <p>
          L'ensemble des éléments composant la plateforme CODShip (code source, interfaces, marques, logos, contenus)
          sont la propriété exclusive de CODShip et sont protégés par les lois sur la propriété intellectuelle. Toute
          reproduction ou utilisation non autorisée est strictement interdite.
        </p>
      </Section>

      <Section title="7. Limitation de responsabilité">
        <p>
          CODShip s'engage à maintenir un niveau de disponibilité optimal (SLA 99,9 % pour le plan Enterprise) mais ne
          saurait être tenu responsable des interruptions de service liées à des événements hors de son contrôle (force
          majeure, pannes réseau, maintenances planifiées).
        </p>
        <p>
          En aucun cas la responsabilité de CODShip ne pourra dépasser le montant des sommes effectivement payées par
          l'utilisateur au cours des trois derniers mois précédant l'incident.
        </p>
      </Section>

      <Section title="8. Résiliation">
        <p>
          L'utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. CODShip peut
          résilier l'accès sans préavis en cas de violation grave des présentes CGU ou de non-paiement.
        </p>
      </Section>

      <Section title="9. Modification des CGU">
        <p>
          CODShip se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par
          e-mail au moins 15 jours avant l'entrée en vigueur des modifications. La poursuite de l'utilisation du service
          après cette date vaut acceptation des nouvelles conditions.
        </p>
      </Section>

      <Section title="10. Droit applicable et juridiction">
        <p>
          Les présentes CGU sont régies par le droit portugais. En cas de litige, les parties s'engagent à rechercher
          une solution amiable avant tout recours judiciaire. À défaut, compétence exclusive est attribuée aux tribunaux
          de Lisbonne, Portugal.
        </p>
      </Section>

      <div className="mt-12 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] text-neutral-600 text-xs">
        Pour toute question relative aux présentes CGU : <span className="text-orange-400">legal@codship.com</span>
      </div>
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
