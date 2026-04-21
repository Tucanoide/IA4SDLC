import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const content_type  = searchParams.get('content_type');
  const program_name  = searchParams.get('program_name');

  if (!content_type) {
    return NextResponse.json({ error: 'content_type required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    let result;
    const pn = program_name?.toUpperCase();

    switch (content_type) {
      case 'metrics':
        result = await client.query(
          `SELECT
             program_name,
             overall_score,
             metrics,
             findings,
             content_html,
             generated_at
           FROM cobol_analysis.metrics
           WHERE program_name = $1
           ORDER BY generated_at DESC LIMIT 1`,
          [pn]
        );
        break;

      case 'quality_audit':
        result = await client.query(
          `SELECT program_name, overall_score, findings, content_html, generated_at
           FROM cobol_analysis.quality_audits
           WHERE program_name = $1 ORDER BY generated_at DESC LIMIT 1`,
          [pn]
        );
        break;

      case 'technical_doc':
        result = await client.query(
          `SELECT program_name, content_md, generated_at
           FROM cobol_analysis.technical_docs
           WHERE program_name = $1 ORDER BY generated_at DESC LIMIT 1`,
          [pn]
        );
        break;

      case 'functional_doc': {
        const fdRes = await client.query(
          `SELECT fd.title, fd.content_html, fd.generated_at
           FROM cobol_analysis.functional_docs fd
           JOIN cobol_analysis.programs p ON p.id = fd.program_id
           WHERE p.program_name = $1 ORDER BY fd.generated_at DESC LIMIT 1`,
          [pn]
        );
        if (fdRes.rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
        const raw = fdRes.rows[0].content_html as string ?? '';
        const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : raw;
        const cleanedHtml = bodyContent
          .replace(/\s*style="[^"]*"/gi, '')  // strip inline styles
          .replace(/<div class="meta"[^>]*>[\s\S]*?<\/div>/i, '') // strip meta banner
          .trim();
        return NextResponse.json({
          title: fdRes.rows[0].title,
          content_html: cleanedHtml,
          generated_at: fdRes.rows[0].generated_at,
        });
      }

      case 'use_cases': {
        const ucRes = await client.query(
          `SELECT id, program_name, title, content_html, use_cases_json, generated_at
           FROM cobol_analysis.use_cases
           ORDER BY generated_at DESC`
        );
        if (ucRes.rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
        const cleanedRows = ucRes.rows.map((row) => {
          if (!row.content_html) return row;
          const raw = row.content_html as string;
          const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1] : raw;
          const cleaned = bodyContent
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
            .replace(/<h[1-4][^>]*>\s*[IÍ]ndice\s*<\/h[1-4]>[\s\S]*?(?=<h[1-4])/i, '')
            .trim();
          return { ...row, content_html: cleaned };
        });
        return NextResponse.json({ use_cases: cleanedRows });
      }

      case 'onboarding': {
        const obRes = await client.query(
          `SELECT id, profile, version, chapter_count, content_md, generated_at
           FROM cobol_analysis.onboarding_content
           ORDER BY profile ASC`
        );
        if (obRes.rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
        return NextResponse.json({ onboarding_profiles: obRes.rows });
      }

      case 'code_audit': {
        const runRes = await client.query(
          `SELECT id, findings_count, notes, completed_at
           FROM cobol_analysis.audit_runs
           WHERE triggered_by = 'ia4sdlc-code-audit'
             AND notes LIKE $1
             AND status = 'COMPLETED'
           ORDER BY started_at DESC LIMIT 1`,
          [`Auditoría de ${pn}%—%`]
        );
        if (runRes.rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
        const run = runRes.rows[0];
        const qualityMatch = run.notes?.match(/\| Quality: (\w+) \|/);
        const summaryMatch = run.notes?.match(/\| Quality: \w+ \| (.+)$/);
        const findingsRes = await client.query(
          `SELECT aft.name AS type_name, aft.code,
                  af.severity, af.title, af.description,
                  af.line_number, af.line_content, af.raw_evidence
           FROM cobol_analysis.audit_findings af
           JOIN cobol_analysis.audit_finding_types aft ON aft.id = af.finding_type_id
           WHERE af.audit_run_id = $1
           ORDER BY
             CASE af.severity WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 WHEN 'INFO' THEN 3 ELSE 4 END,
             af.title`,
          [run.id]
        );
        return NextResponse.json({
          audit_run_id:    run.id,
          findings_count:  run.findings_count,
          overall_quality: qualityMatch?.[1] ?? 'UNKNOWN',
          summary:         summaryMatch?.[1]?.trim() ?? '',
          generated_at:    run.completed_at,
          findings:        findingsRes.rows,
        });
      }

      case 'impact_analysis':
        result = await client.query(
          `SELECT program_name, program_description, program_functionality,
                  calling_count, called_count, impact_risk, impact_rationale,
                  analysis_json, generated_at
           FROM cobol_analysis.impact_analysis
           WHERE program_name = $1 ORDER BY generated_at DESC LIMIT 1`,
          [pn]
        );
        break;

      case 'functional_doc_system': {
        const sysRes = await client.query(
          `SELECT functional_md, content_html, updated_at AS generated_at
           FROM cobol_analysis.system_functional_overview
           ORDER BY updated_at DESC LIMIT 1`
        );
        if (sysRes.rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
        return NextResponse.json({
          content_md:   sysRes.rows[0].functional_md,
          content_html: sysRes.rows[0].content_html,
          generated_at: sysRes.rows[0].generated_at,
        });
      }

      default:
        return NextResponse.json({ error: 'unknown content_type' }, { status: 400 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
