import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RGPD — Protection des données",
  description: "Conformité RGPD de CODShip : droits, traitements et protection des données personnelles.",
}

export default function RGPD() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-3xl font-black text-white mb-2">RGPD — Protection des données</h1>
      <p className="text-neutral-500 text-sm mb-12">Règlement (UE) 2016/679 — Dernière mise à jour : 1er janvier 2025</p>

      <div className="mb-10 p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
        <p className="text-orange-300 text-sm font-semibold mb-1">Notre engagement</p>
        <p className="text-neutral-400 text-sm leading-relaxed">
          CODShip est pleinement conforme au Règlement Général sur la Protection des Données (RGPD). En tant que
          plateforme opérant en Europe, la protection de vos données et celles de vos clients est une priorité absolue.
        </p>
      </div>

      <Section title="1. Qui sommes-nous ?">
        <p>
          <strong className="text-white">Responsable du traitement :</strong> CODShip Lda<br />
          <strong className="text-white">Siège social :</strong> Lisbonne, Portugal<br />
          <strong className="text-white">Contact DPO :</strong>{" "}
          <span className="text-orange-400">dpo@codship.com</span>
        </p>
      </Section>

      <Section title="2. Données traitées et bases légales">
        <p>
          CODShip traite deux catégories de données personnelles : celles de ses{" "}
          <strong className="text-white">utilisateurs marchands</strong> (vous) et celles de vos{" "}
          <strong className="text-white">clients finaux</strong> (acheteurs COD).
        </p>
        <p>
          <strong className="text-white">Données marchands :</strong> traitées sur la base de l'exécution du contrat
          et de l'intérêt légitime (amélioration du service).
        </p>
        <p>
          <strong className="text-white">Données clients finaux :</strong> traitées sur la base de l'exécution du
          contrat de livraison. En tant que marchand utilisant CODShip, vous êtes responsable de traitement pour les
          données de vos clients ; CODShip agit en qualité de sous-traitant.
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
          Pour exercer vos droits : <span className="text-orange-400">dpo@codship.com</span>. Délai de réponse : 30
          jours maximum.
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
          CODShip utilise des sous-traitants dont les serveurs peuvent être situés en dehors de l'Union Européenne.
          Ces transferts sont encadrés par des{" "}
          <strong className="text-white">Clauses Contractuelles Types (CCT)</strong> approuvées par la Commission
          Européenne, garantissant un niveau de protection équivalent au RGPD.
        </p>
      </Section>

      <Section title="6. Sous-traitants">
        <p>CODShip fait appel aux sous-traitants suivants, tous conformes au RGPD :</p>
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
          libertés, CODShip s'engage à vous notifier dans un délai de{" "}
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
