export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

// Type definitions for different space weather events
interface SolarFlare {
  class_type: string;
  source_location: string;
  active_region_num: number;
  begin_time: string;
  peak_time: string;
  end_time: string;
}

interface CME {
  catalog: string;
  start_time: string;
  source_location: string;
  speed: number;
  type: string;
}

interface Geostorm {
  gst_id: string;
  kp_index: number;
  observed_time: string;
  source: string;
}

// Helper function to validate date format
function isValidDate(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to sanitize and validate query parameters
function validateQueryParams(params: URLSearchParams): { 
  isValid: boolean; 
  error?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
} {
  const eventType = params.get('type');
  const startDate = params.get('start');
  const endDate = params.get('end');

  if (!eventType) {
    return { isValid: false, error: 'Event type is required' };
  }

  if (!['solar_flare', 'cme', 'geostorm', 'kp_index'].includes(eventType)) {
    return { isValid: false, error: 'Invalid event type. Use solar_flare, cme, geostorm, or kp_index.' };
  }

  // For geostorm, we don't strictly require a start date
  if (eventType !== 'geostorm' && !startDate) {
    return { isValid: false, error: 'Start date is required' };
  }

  if (!endDate) {
    return { isValid: false, error: 'End date is required' };
  }

  if ((startDate && !isValidDate(startDate)) || !isValidDate(endDate)) {
    return { isValid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  return { 
    isValid: true, 
    eventType, 
    startDate: startDate || '2010-01-01', // Default start date for geostorms
    endDate 
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const validation = validateQueryParams(searchParams);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { eventType, startDate, endDate } = validation;
    let query = '';
    let queryParams: any[] = [];

    switch (eventType) {
      case 'solar_flare':
        query = `
          SELECT 
            class_type, 
            source_location, 
            active_region_num, 
            begin_time, 
            peak_time, 
            end_time
          FROM public.donki_solar_flare
          WHERE begin_time BETWEEN $1 AND $2
          ORDER BY begin_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;

      case 'cme':
        query = `
          SELECT 
            catalog, 
            start_time, 
            source_location, 
            speed, 
            type
          FROM public.donki_cme
          WHERE start_time BETWEEN $1 AND $2
          ORDER BY start_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;

      case 'geostorm':
        query = `
          SELECT 
            g.gst_id,
            k.kp_index,
            k.observed_time,
            k.source
          FROM public.donki_geostorm g
          JOIN public.geostorm_kp_index k ON g.gst_id = k.gst_id
          WHERE k.observed_time BETWEEN $1 AND $2
          ORDER BY k.observed_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;

      case 'kp_index':
        query = `
          SELECT 
            observed_time, 
            kp_index, 
            source
          FROM public.geostorm_kp_index
          WHERE observed_time BETWEEN $1 AND $2
          ORDER BY observed_time DESC;
        `;
        queryParams = [startDate, endDate];
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(query, queryParams);
      
      // Type check and format the response data
      const formattedData = result.rows.map(row => {
        // Convert date strings to ISO format
        Object.keys(row).forEach(key => {
          if (row[key] instanceof Date) {
            row[key] = row[key].toISOString();
          }
        });
        return row;
      });

      return NextResponse.json(formattedData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in space weather API:', error);
    
    // Determine if it's a database connection error
    const isConnectionError = error instanceof Error && 
      error.message.includes('connection');
    
    return NextResponse.json(
      { 
        error: isConnectionError ? 
          'Database connection error' : 
          'Error fetching space weather data',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' : 
          undefined
      },
      { status: isConnectionError ? 503 : 500 }
    );
  }
}