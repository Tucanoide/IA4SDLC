import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const content_type = searchParams.get('content_type');
  const program_name  = searchParams.get('program_name');

  if (!content_type) {
    return NextResponse.json({ error: 'content_type required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // code_audit lives in audit_runs, not content_generation_status
    if (content_type === 'code_audit' && program_name) {
      const pn = program_name.toUpperCase();
      const result = await client.query(
        `SELECT status FROM cobol_analysis.audit_runs
         WHERE triggered_by = 'ia4sdlc-code-audit'
           AND notes LIKE $1
         ORDER BY started_at DESC LIMIT 1`,
        [`Auditoría de ${pn}%—%`]
      );
      if (result.rows.length === 0) return NextResponse.json({ status: 'not_found' });
      const map: Record<string, string> = { COMPLETED: 'completed', RUNNING: 'in_progress', ERROR: 'error' };
      return NextResponse.json({ status: map[result.rows[0].status] ?? 'pending' });
    }

    let result;
    if (program_name) {
      result = await client.query(
        `SELECT status, generated_at, output_id, error_message
         FROM cobol_analysis.content_generation_status
         WHERE content_type = $1 AND program_name = $2
         ORDER BY updated_at DESC LIMIT 1`,
        [content_type, program_name.toUpperCase()]
      );
    } else {
      result = await client.query(
        `SELECT status, generated_at, output_id, error_message
         FROM cobol_analysis.content_generation_status
         WHERE content_type = $1 AND scope = 'system'
         ORDER BY updated_at DESC LIMIT 1`,
        [content_type]
      );
    }

    if (result.rows.length === 0) {
      // Fallback: check if content already exists in actual tables
      if (program_name) {
        const pn = program_name.toUpperCase();
        if (content_type === 'functional_doc') {
          const exists = await client.query(
            `SELECT fd.id FROM cobol_analysis.functional_docs fd 
             JOIN cobol_analysis.programs p ON p.id = fd.program_id 
             WHERE p.program_name = $1 LIMIT 1`, [pn]
          );
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
        if (content_type === 'technical_doc') {
          const exists = await client.query(`SELECT id FROM cobol_analysis.technical_docs WHERE program_name = $1 LIMIT 1`, [pn]);
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
        if (content_type === 'use_cases') {
          const exists = await client.query(`SELECT id FROM cobol_analysis.use_cases WHERE program_name = $1 LIMIT 1`, [pn]);
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
        if (content_type === 'metrics') {
          const exists = await client.query(`SELECT id FROM cobol_analysis.metrics WHERE program_name = $1 LIMIT 1`, [pn]);
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
        if (content_type === 'quality_audit') {
          const exists = await client.query(`SELECT 1 FROM cobol_analysis.quality_audits WHERE program_name = $1 LIMIT 1`, [pn]);
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
        if (content_type === 'impact_analysis') {
          const exists = await client.query(`SELECT 1 FROM cobol_analysis.impact_analysis WHERE program_name = $1 LIMIT 1`, [pn]);
          if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
        }
      } else if (content_type === 'functional_doc_system') {
        const exists = await client.query(`SELECT 1 FROM cobol_analysis.system_functional_overview LIMIT 1`);
        if (exists.rows.length > 0) return NextResponse.json({ status: 'completed' });
      }

      return NextResponse.json({ status: 'not_found' });
    }
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
