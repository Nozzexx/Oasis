export const dynamic = "force-dynamic";

// src/app/api/neo/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required query parameters: start and end' },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, name, observation_date, 
             estimated_diameter_km, is_potentially_hazardous
      FROM public.neo_objects
      WHERE observation_date BETWEEN $1 AND $2
      ORDER BY observation_date DESC
    `;

    const result = await client.query(query, [startDate, endDate]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NEO data' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
