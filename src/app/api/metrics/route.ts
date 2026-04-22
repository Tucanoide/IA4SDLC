import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT
         COUNT(*)::text AS total_programs,
         SUM(array_length(string_to_array(original_code, E'\\n'), 1))::text AS total_lines
       FROM cobol_analysis.programs
       WHERE is_current = true AND original_code IS NOT NULL`
    );
    return NextResponse.json({
      totalPrograms: parseInt(result.rows[0]?.total_programs ?? '0', 10),
      totalLines: parseInt(result.rows[0]?.total_lines ?? '0', 10),
      health: 80
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}

