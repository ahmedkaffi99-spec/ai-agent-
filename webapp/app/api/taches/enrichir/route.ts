import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { anthropic, CLAUDE_MODEL, extractText } from '@/lib/anthropic';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { id } = await req.json();

  const { data: tache, error: fetchError } = await supabase
    .from('taches')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !tache) {
    return NextResponse.json({ error: fetchError?.message ?? 'Tache introuvable' }, { status: 404 });
  }

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }],
    messages: [
      {
        role: 'user',
        content: `Fais une recherche web utile pour cette tache : "${tache.titre}" (projet: ${tache.projet ?? 'aucun'}). Donne un resume concis et actionnable, avec les points cles.`,
      },
    ],
  });

  const notesIa = extractText(response.content);

  const { data: updated, error: updateError } = await supabase
    .from('taches')
    .update({ notes_ia: notesIa })
    .eq('id', id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ tache: updated });
}
