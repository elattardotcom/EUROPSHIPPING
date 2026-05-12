"use client"

import { useState } from "react"

type Lang = "en" | "fr"

export default function Conditions() {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white mb-0">
          {lang === "en" ? "Terms of Service" : "Conditions d'utilisation"}
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
          <Section title="1. Purpose">
            <p>
              These Terms of Service ("ToS") govern access to and use of the CODShip platform, published by CODShip Lda,
              a company incorporated under Portuguese law with its registered office in Lisbon, Portugal (hereinafter "CODShip").
            </p>
            <p>
              By creating an account or using CODShip's services, you unreservedly accept these ToS. If you do not accept
              these terms, please do not use the platform.
            </p>
          </Section>
          <Section title="2. Service Description">
            <p>CODShip is a SaaS platform enabling e-commerce merchants to:</p>
            <ul>
              <li>Connect their Shopify stores and centralize Cash on Delivery (COD) orders</li>
              <li>Manage order confirmation by phone (leads)</li>
              <li>Track package shipping and delivery across Europe</li>
              <li>Receive bank transfers for COD collections within 48 business hours</li>
              <li>Access analytics dashboards and manage an affiliate program</li>
            </ul>
          </Section>
          <Section title="3. Registration and User Account">
            <p>
              To access the services, the user must create an account by providing accurate, complete, and up-to-date
              information. The user is solely responsible for the confidentiality of their credentials and all actions
              taken from their account.
            </p>
            <p>
              CODShip reserves the right to suspend or delete any account in case of incorrect information, fraudulent
              behavior, or violation of these ToS.
            </p>
          </Section>
          <Section title="4. Plans and Pricing">
            <p>
              CODShip offers three subscription plans (Starter, Pro, Enterprise) whose prices and features are detailed
              on the Pricing page. All prices are in euros (EUR) excluding taxes.
            </p>
            <p>
              A free 14-day trial is offered to all new registrants without any requirement to enter a payment method.
              After the trial period, access is suspended unless a paid subscription is taken out.
            </p>
            <p>
              Subscriptions are automatically renewed each month. The user may cancel at any time from their personal
              space, effective at the end of the current period.
            </p>
          </Section>
          <Section title="5. User Obligations">
            <p>The user agrees to:</p>
            <ul>
              <li>Use CODShip exclusively for legal and legitimate commercial purposes</li>
              <li>Not resell, sublicense, or transfer access to the platform to third parties without authorization</li>
              <li>Comply with applicable legislation in the countries where they conduct business</li>
              <li>Not attempt to access unauthorized data or systems</li>
              <li>Inform CODShip of any unauthorized use of their account</li>
            </ul>
          </Section>
          <Section title="6. Intellectual Property">
            <p>
              All elements of the CODShip platform (source code, interfaces, trademarks, logos, content) are the exclusive
              property of CODShip and are protected by intellectual property laws. Any unauthorized reproduction or use
              is strictly prohibited.
            </p>
          </Section>
          <Section title="7. Limitation of Liability">
            <p>
              CODShip is committed to maintaining optimal availability (99.9% SLA for the Enterprise plan) but cannot be
              held responsible for service interruptions due to events beyond its control (force majeure, network outages,
              scheduled maintenance).
            </p>
            <p>
              In no event shall CODShip's liability exceed the amounts actually paid by the user during the three months
              preceding the incident.
            </p>
          </Section>
          <Section title="8. Termination">
            <p>
              The user may cancel their subscription at any time from their account settings. CODShip may terminate access
              without notice in the event of a serious violation of these ToS or non-payment.
            </p>
          </Section>
          <Section title="9. ToS Amendments">
            <p>
              CODShip reserves the right to amend these ToS at any time. Users will be notified by email at least 15 days
              before the amendments take effect. Continued use of the service after that date constitutes acceptance of
              the new terms.
            </p>
          </Section>
          <Section title="10. Governing Law and Jurisdiction">
            <p>
              These ToS are governed by Portuguese law. In the event of a dispute, the parties agree to seek an amicable
              resolution before any legal proceedings. Failing that, exclusive jurisdiction is granted to the courts of
              Lisbon, Portugal.
            </p>
          </Section>
          <div className="mt-12 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] text-neutral-600 text-xs">
            For any questions regarding these ToS: <span className="text-orange-400">legal@codship.com</span>
          </div>
        </>
      ) : (
        <>
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
