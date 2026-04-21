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

export default async function UseCasesPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = [];
  try { programs = await getPrograms(); } catch { /* show empty selector */ }

  return (
    <ProgramPageClient
      programs={programs}
      contentType="use_cases"
      title="Use Cases"
      description="Casos de uso generados a partir del código COBOL del programa."
      icon="fact_check"
      accentColor="#00e639"
    />
  );
}
