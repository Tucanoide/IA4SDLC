import pool from '@/lib/db';
import { unstable_cache } from 'next/cache';

export interface ProgramTypeCount {
  program_type: string;
  count: number;
}

export interface SystemMetrics {
  totalPrograms: number;
  totalLines: number;
  totalDependencies: number;
  byType: ProgramTypeCount[];
}

// Cached for 5 minutes — avoids hammering Postgres on every page load
export const getSystemMetrics = unstable_cache(
  async (): Promise<SystemMetrics> => {
    const client = await pool.connect();
    try {
      const [countResult, linesResult, typeResult, depsResult] = await Promise.all([
        // Total program count
        client.query<{ count: string }>(`SELECT COUNT(*) as count FROM cobol_analysis.programs`),

        // Total lines: sum length of original_code split by newlines
        client.query<{ total_lines: string }>(`
          SELECT SUM(array_length(string_to_array(original_code, E'\\n'), 1)) AS total_lines
          FROM cobol_analysis.programs
          WHERE original_code IS NOT NULL
        `),

        // Count by program_type
        client.query<{ program_type: string; count: string }>(`
          SELECT
            COALESCE(NULLIF(TRIM(program_type), ''), 'UNKNOWN') AS program_type,
            COUNT(*) AS count
          FROM cobol_analysis.programs
          GROUP BY 1
          ORDER BY 2 DESC
        `),

        // Total inter-program dependencies
        client.query<{ count: string }>(`SELECT COUNT(*) as count FROM cobol_analysis.program_calls`),
      ]);

      return {
        totalPrograms:      parseInt(countResult.rows[0]?.count ?? '0', 10),
        totalLines:         parseInt(linesResult.rows[0]?.total_lines ?? '0', 10),
        totalDependencies:  parseInt(depsResult.rows[0]?.count ?? '0', 10),
        byType: typeResult.rows.map((r) => ({
          program_type: r.program_type,
          count: parseInt(r.count, 10),
        })),
      };
    } finally {
      client.release();
    }
  },
  ['system-metrics'],
  { revalidate: 300 } // 5 min cache
);

// ── Program list for Impact Analysis selector ──────────────────────────────
export interface ProgramEntry {
  program_name: string;
  program_type: string;
}

export const getPrograms = unstable_cache(
  async (): Promise<ProgramEntry[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query<{ program_name: string; program_type: string }>(`
        SELECT DISTINCT
          program_name,
          COALESCE(NULLIF(TRIM(program_type), ''), 'UNKNOWN') AS program_type
        FROM cobol_analysis.programs
        ORDER BY program_name ASC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },
  ['programs-list'],
  { revalidate: 300 }
);
