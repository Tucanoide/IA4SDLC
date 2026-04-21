import pool from '@/lib/db';
import HomeClient from '@/components/dashboard/HomeClient';

async function getSystemData() {
  const client = await pool.connect();
  try {
    const [systemRes, metricsRes, depsRes] = await Promise.all([
      client.query<{ name: string; description: string }>(
        `SELECT name, description FROM public."System" LIMIT 1`
      ),
      client.query<{ total_programs: string; total_lines: string }>(
        `SELECT
           COUNT(*)::text AS total_programs,
           SUM(array_length(string_to_array(original_code, E'\\n'), 1))::text AS total_lines
         FROM cobol_analysis.programs
         WHERE is_current = true AND original_code IS NOT NULL`
      ),
      client.query<{ count: string }>(
        `SELECT COUNT(DISTINCT copybook_name)::text AS count FROM cobol_analysis.copybook_inclusions`
      ),
    ]);
    return {
      system: systemRes.rows[0] ?? { name: 'CardDemo', description: null },
      totalPrograms: parseInt(metricsRes.rows[0]?.total_programs ?? '0', 10),
      totalLines: parseInt(metricsRes.rows[0]?.total_lines ?? '0', 10),
      totalDependencies: parseInt(depsRes.rows[0]?.count ?? '0', 10),
    };
  } finally {
    client.release();
  }
}

export default async function Home() {
  let data = null;
  let error: string | null = null;
  try {
    data = await getSystemData();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Database connection failed';
  }
  return <HomeClient data={data} error={error} />;
}
