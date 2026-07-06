import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL, extractText } from '@/lib/anthropic';
import { groq, GROQ_MODEL } from '@/lib/groq';
import { gemini, GEMINI_MODEL } from '@/lib/gemini';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { sujet } = await req.json();
  if (!sujet || typeof sujet !== 'string') {
    return NextResponse.json({ error: 'Sujet manquant' }, { status: 400 });
  }

  // --- Etape 1 : Chercheur (Groq, rapide) ---
  const rechercheRes = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: `Liste 5 a 8 faits factuels et verifiables sur : ${sujet}. Format : liste a puces, une phrase par fait.`,
      },
    ],
  });
  const faits = rechercheRes.choices[0].message.content ?? '';

  // --- Etape 2 : Redacteur (Claude) ---
  const redactionRes = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `A partir de ces faits :\n${faits}\n\nRedige une reponse structuree en 3 parties : avantages, inconvenients, et une recommandation finale en une phrase.`,
      },
    ],
  });
  const redaction = extractText(redactionRes.content);

  // --- Etape 3 : Relecteur (Gemini) ---
  const relectureRes = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Relis ce texte, corrige toute erreur de grammaire ou de clarte, sans changer la structure en 3 parties. Produis la version finale :\n\n${redaction}`,
  });
  const resultatFinal = relectureRes.text ?? redaction;

  return NextResponse.json({ faits, redaction, resultatFinal });
}
