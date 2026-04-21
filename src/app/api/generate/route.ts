import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE = 'https://n8n.srv1187720.hstgr.cloud/webhook';

const WEBHOOK_MAP: Record<string, string> = {
  quality_audit:        `${N8N_BASE}/ia4sdlc-quality-audit`,
  technical_doc:        `${N8N_BASE}/ia4sdlc-technical-doc`,
  functional_doc:       `${N8N_BASE}/ia4sdlc-functional-doc`,
  use_cases:            `${N8N_BASE}/ia4sdlc-use-cases`,
  onboarding:           `${N8N_BASE}/ia4sdlc-onboarding`,
  code_audit:           `${N8N_BASE}/ia4sdlc-code-audit`,
  functional_doc_system:`${N8N_BASE}/ia4sdlc-system-functional-overview`,
  impact_analysis:      `${N8N_BASE}/ia4sdlc-impact-analysis`,
};

export async function POST(req: NextRequest) {
  const body = await req.json() as { content_type?: string; program_name?: string };
  const { content_type, program_name } = body;

  if (!content_type || !WEBHOOK_MAP[content_type]) {
    return NextResponse.json({ error: 'invalid content_type' }, { status: 400 });
  }

  const webhookUrl = WEBHOOK_MAP[content_type];
  const payload: Record<string, string> = {};
  if (program_name) payload.program_name = program_name.toUpperCase();

  // Fire and forget — n8n runs async and updates content_generation_status when done
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});

  return NextResponse.json({ status: 'triggered' });
}
