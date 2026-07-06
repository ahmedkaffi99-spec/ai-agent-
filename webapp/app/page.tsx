import Link from 'next/link';
import * as s from '@/lib/styles';

const sections = [
  {
    href: '/admin/agent',
    titre: 'Agent IA',
    description: 'Agent simple (Claude + recherche web) ou pipeline multi-modele (Groq -> Claude -> Gemini).',
  },
  {
    href: '/admin/finances',
    titre: 'Finances',
    description: 'Suivi de transactions personnelles avec analyse IA (totaux, tendances, conseils).',
  },
  {
    href: '/admin/taches',
    titre: 'Taches / Projets',
    description: 'Suivi de taches avec enrichissement par recherche web IA.',
  },
  {
    href: '/admin/commissions',
    titre: 'Commissions',
    description: 'Commissions par agent, repartition du profil, calculs automatiques.',
  },
  {
    href: '/admin/mouvements',
    titre: 'Mouvements de fonds',
    description: 'Entrant / sortant / balance, par mois.',
  },
  {
    href: '/admin/rapport',
    titre: 'Rapport IA',
    description: 'Compte-rendu de fin de journee genere automatiquement par Claude.',
  },
];

export default function HomePage() {
  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Back-office IA</h1>
      <p style={s.pageSubtitle}>Outil personnel — pas destine aux visiteurs publics.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {sections.map((sec) => (
          <Link key={sec.href} href={sec.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...s.card, marginBottom: 0, height: '100%', cursor: 'pointer' }}>
              <h2 style={s.cardTitle}>{sec.titre}</h2>
              <p style={{ color: s.colors.muted, fontSize: '0.88rem', margin: 0 }}>{sec.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
