import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { anthropic, CLAUDE_MODEL, extractText } from '@/lib/anthropic';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ analyse: 'Aucune transaction a analyser pour le moment.' });
  }

  const tableauTexte = transactions
    .map((t) => `${t.date} | ${t.type} | ${t.categorie} | ${t.montant}e | ${t.description ?? ''}`)
    .join('\n');

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Voici mes transactions financieres (date | type | categorie | montant | description) :\n\n${tableauTexte}\n\nAnalyse ces donnees : totaux revenus/depenses, principales categories de depenses, tendances notables, et 2-3 conseils concrets.`,
      },
    ],
  });

  return NextResponse.json({ analyse: extractText(response.content) });
}
