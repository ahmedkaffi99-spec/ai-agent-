import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL, extractText } from '@/lib/anthropic';
import { isAuthorized } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
    messages: [{ role: 'user', content: message }],
  });

  return NextResponse.json({ result: extractText(response.content) });
}
