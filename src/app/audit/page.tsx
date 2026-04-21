import pool from '@/lib/db';
import ProgramPageClient from '@/components/dashboard/ProgramPageClient';

async function getPrograms() {
  const client = await pool.connect();
  try {
    const r = await client.query<{ program_name: string; program_type: string }>(
      `SELECT program_name, COALESCE(NULLIF(TRIM(program_type), ''), 'UNKNOWN') AS program_type
       FROM cobol_analysis.programs WHERE is_current = true ORDER BY program_name`
    );
    return r.rows;
  } finally {
    client.release();
  }
}

export default async function AuditPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = [];
  try { programs = await getPrograms(); } catch { /* show empty selector */ }

  return (
    <ProgramPageClient
      programs={programs}
      contentType="metrics"
      title="Metrics"
      description="Métricas de calidad y complejidad extraídas del análisis estático de cada programa COBOL."
      icon="monitoring"
      accentColor="#c3c0ff"
    />
  );
}
