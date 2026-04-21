import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query<{ program_name: string; program_type: string }>(
      `SELECT program_name, COALESCE(NULLIF(TRIM(program_type), ''), 'UNKNOWN') AS program_type
       FROM cobol_analysis.programs
       WHERE is_current = true
       ORDER BY program_name ASC`
    );
    return NextResponse.json(result.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
