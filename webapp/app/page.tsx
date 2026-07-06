import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '1rem' }}>
      <h1>Back-office IA</h1>
      <p>Outil personnel — pas destine aux visiteurs publics.</p>
      <ul style={{ lineHeight: 2 }}>
        <li><Link href="/admin/agent">Agent IA (simple + pipeline multi-modele)</Link></li>
        <li><Link href="/admin/finances">Finances</Link></li>
        <li><Link href="/admin/taches">Taches / Projets</Link></li>
      </ul>
    </div>
  );
}
