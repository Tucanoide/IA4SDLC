import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query<{ name: string; description: string }>(
      `SELECT name, description FROM public."System" LIMIT 1`
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ name: 'CardDemo', description: null });
    }
    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ name: 'CardDemo', description: null });
  } finally {
    client.release();
  }
}
