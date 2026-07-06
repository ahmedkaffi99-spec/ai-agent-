'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors } from '@/lib/styles';

const liens = [
  { href: '/', label: 'Accueil' },
  { href: '/admin/agent', label: 'Agent IA' },
  { href: '/admin/finances', label: 'Finances' },
  { href: '/admin/taches', label: 'Taches' },
  { href: '/admin/commissions', label: 'Commissions' },
  { href: '/admin/mouvements', label: 'Mouvements' },
  { href: '/admin/rapport', label: 'Rapport IA' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: colors.primaryDark,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, padding: '0.9rem 0', whiteSpace: 'nowrap' }}>
          Back-office IA
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {liens.map((l) => {
            const actif = l.href === '/' ? pathname === '/' : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  color: actif ? '#fff' : '#aeb4c2',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: actif ? 700 : 500,
                  padding: '0.9rem 0.6rem',
                  borderBottom: actif ? '2px solid #fff' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
