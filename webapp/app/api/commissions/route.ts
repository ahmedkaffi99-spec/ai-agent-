import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date requise' }, { status: 400 });

  const mois = date.slice(0, 7);

  const [lignesRes, profilRes, manuelRes, balanceRes, precedentRes] = await Promise.all([
    supabase.from('commission_lignes').select('*').eq('date', date).order('id'),
    supabase.from('commission_profil_lignes').select('*').eq('date', date).order('id'),
    supabase.from('commission_manuel').select('*').eq('date', date).maybeSingle(),
    supabase.from('mouvements_lignes').select('montant').eq('mois', mois).eq('section', 'balance'),
    supabase
      .from('commission_manuel')
      .select('balance_total')
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  for (const r of [lignesRes, profilRes, manuelRes, balanceRes, precedentRes]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  }

  const balanceRestant = (balanceRes.data ?? []).reduce((s, l) => s + Number(l.montant), 0);
  const balancePrecedente = Number(precedentRes.data?.balance_total ?? 0);

  return NextResponse.json({
    lignes: lignesRes.data,
    profil: profilRes.data,
    manuel: manuelRes.data ?? { date, commission_global: 0 },
    balanceRestant,
    balancePrecedente,
  });
}
