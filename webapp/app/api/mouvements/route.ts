import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const mois = req.nextUrl.searchParams.get('mois');
  if (!mois) return NextResponse.json({ error: 'mois requis' }, { status: 400 });

  const { data, error } = await supabase
    .from('mouvements_lignes')
    .select('*')
    .eq('mois', mois)
    .order('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    entrant: data.filter((l) => l.section === 'entrant'),
    sortant: data.filter((l) => l.section === 'sortant'),
    balance: data.filter((l) => l.section === 'balance'),
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabase
    .from('mouvements_lignes')
    .insert({ mois: body.mois, section: body.section, libelle: body.libelle, montant: body.montant ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ligne: data });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { id, ...champs } = await req.json();
  const { data, error } = await supabase
    .from('mouvements_lignes')
    .update(champs)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ligne: data });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { id } = await req.json();
  const { error } = await supabase.from('mouvements_lignes').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
