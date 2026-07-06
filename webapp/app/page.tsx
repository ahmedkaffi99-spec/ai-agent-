import Link from 'next/link';
import * as s from '@/lib/styles';

const sections = [
  {
    href: '/admin/commissions',
    titre: 'Commissions',
    description: 'Bulletin de commissions par agent, retenues, repartition du profit et solde restant.',
  },
  {
    href: '/admin/mouvements',
    titre: 'Mouvements de fonds',
    description: 'Entrant / sortant / balance, par mois, avec totaux automatiques.',
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
