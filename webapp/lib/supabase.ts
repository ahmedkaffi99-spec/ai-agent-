import { createClient } from '@supabase/supabase-js';

// Cle service_role : usage serveur UNIQUEMENT (jamais dans un composant 'use client').
// Fallback pour ne pas faire planter le build quand les variables ne sont pas
// encore configurees (ex: build local sans .env) ; en production ces valeurs
// doivent etre definies dans Vercel, sinon les requetes Supabase echoueront a l'appel.
export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
);
