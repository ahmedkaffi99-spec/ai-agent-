export const metadata = {
  title: 'AI Agent - Back-office',
  description: 'Outil personnel : agent IA, finances, taches',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>{children}</body>
    </html>
  );
}
