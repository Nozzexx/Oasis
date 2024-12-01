export const dynamic = "force-dynamic";

// src/app/api/spaceweather/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  let client;
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('type') ?? ''; // Default to an empty string if null
    const endDate = searchParams.get('end') ?? '';    // Default to an empty string if null

    // Validate query parameters
    if (!eventType || !endDate) {
      return NextResponse.json(
        { error: 'Missing query parameters: type and end are required.' },
        { status: 400 }
      );
    }

    let query = '';
    let queryParams: string[] = [];

    switch (eventType) {
      case 'solar_flare': {
        const startDate = searchParams.get('start') ?? ''; // Default to an empty string if null
        query = `
          SELECT class_type, source_location, active_region_num, begin_time, peak_time, end_time
          FROM public.donki_solar_flare
          WHERE begin_time BETWEEN $1 AND $2
          ORDER BY begin_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;
      }
      case 'cme': {
        const startDate = searchParams.get('start') ?? ''; // Default to an empty string if null
        query = `
          SELECT catalog, start_time, source_location, speed, type
          FROM public.donki_cme
          WHERE start_time BETWEEN $1 AND $2
          ORDER BY start_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;
      }
      case 'geostorm': {
        query = `
          SELECT gst_id, kp_index, observed_time, source
          FROM public.geostorm_kp_index
          WHERE observed_time BETWEEN $1 AND $2
          ORDER BY observed_time DESC;
        `;
        queryParams = ['2010-01-01', endDate]; // Hardcoded start date for geostorms
        break;
      }
      case 'kp_index': {
        const startDate = searchParams.get('start') ?? ''; // Default to an empty string if null
        query = `
          SELECT observed_time, kp_index, source
          FROM public.geostorm_kp_index
          WHERE observed_time BETWEEN $1 AND $2
          ORDER BY observed_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Invalid event type. Use solar_flare, cme, geostorm, or kp_index.' },
          { status: 400 }
        );
    }

    // Acquire a client from the pool
    client = await pool.connect();
    const result = await client.query(query, queryParams);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Error fetching space weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space weather data' },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}
