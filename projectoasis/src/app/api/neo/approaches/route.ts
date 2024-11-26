// src/app/api/neo/approaches/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const result = await pool.query(`
      SELECT close_approach_date, 
             relative_velocity_kph, 
             miss_distance_km
      FROM public.neo_approaches
      WHERE close_approach_date BETWEEN $1 AND $2
      ORDER BY close_approach_date DESC
    `, [startDate, endDate]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching approach data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approach data' },
      { status: 500 }
    );
  }
}