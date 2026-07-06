import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { anthropic, CLAUDE_MODEL, extractText } from '@/lib/anthropic';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get('date');

  const [historique, rapport] = await Promise.all([
    supabase.from('rapports_ia').select('date').order('date', { ascending: false }).limit(30),
    date
      ? supabase.from('rapports_ia').select('*').eq('date', date).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (historique.error) return NextResponse.json({ error: historique.error.message }, { status: 500 });
  if (rapport.error) return NextResponse.json({ error: rapport.error.message }, { status: 500 });

  return NextResponse.json({ historique: historique.data, rapport: rapport.data });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { date } = await req.json();
  if (!date) return NextResponse.json({ error: 'date requise' }, { status: 400 });

  const mois = date.slice(0, 7);

  const [commissionRes, profilRes, manuelRes, mouvementsRes] = await Promise.all([
    supabase.from('commission_lignes').select('*').eq('date', date),
    supabase.from('commission_profil_lignes').select('*').eq('date', date),
    supabase.from('commission_manuel').select('*').eq('date', date).maybeSingle(),
    supabase.from('mouvements_lignes').select('*').eq('mois', mois),
  ]);

  for (const r of [commissionRes, profilRes, manuelRes, mouvementsRes]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  }

  const commissions = commissionRes.data ?? [];
  const profil = profilRes.data ?? [];
  const manuel = manuelRes.data;
  const mouvements = mouvementsRes.data ?? [];

  if (commissions.length === 0 && profil.length === 0 && mouvements.length === 0) {
    return NextResponse.json({ error: 'Aucune donnee pour cette date.' }, { status: 400 });
  }

  const texte = `
Commissions du ${date} (agent | commission | paye | non paye | retrait) :
${commissions.map((c) => `${c.agent} | ${c.commission} | ${c.paye} | ${c.non_paye} | ${c.retrait}`).join('\n') || '(aucune)'}

Repartition du profil du ${date} :
${profil.map((p) => `${p.libelle} | ${p.montant}`).join('\n') || '(aucune)'}

Resume du ${date} : commission=${manuel?.commission_global ?? 0}, balance totale=${manuel?.balance_total ?? 0}

Mouvements de fonds du mois ${mois} (section | libelle | montant) :
${mouvements.map((m) => `${m.section} | ${m.libelle} | ${m.montant}`).join('\n') || '(aucun)'}
`.trim();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Tu es l'assistant financier personnel de l'utilisateur, qui gere une activite de commissions (agents/wakiil) avec mouvements de fonds. Voici les donnees brutes de sa journee du ${date} :\n\n${texte}\n\nRedige un rapport de fin de journee professionnel et concis en francais avec :\n1. Resume des chiffres cles (commissions, profit, entrees/sorties de fonds)\n2. Anomalies ou points d'attention (ex: non paye important, gros retraits, ecarts)\n3. 2-3 recommandations concretes pour le lendemain\n\nUtilise un format clair avec des titres courts, pas de tableau markdown complexe.`,
      },
    ],
  });

  const contenu = extractText(response.content);

  const { data, error } = await supabase
    .from('rapports_ia')
    .upsert({ date, contenu, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rapport: data });
}
