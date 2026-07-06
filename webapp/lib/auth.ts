import { NextRequest } from 'next/server';

// Verifie le header x-admin-secret contre la variable d'environnement ADMIN_SECRET.
// A appeler en premiere ligne de chaque route API privee.
export function isAuthorized(req: NextRequest): boolean {
  const provided = req.headers.get('x-admin-secret');
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected) && provided === expected;
}
