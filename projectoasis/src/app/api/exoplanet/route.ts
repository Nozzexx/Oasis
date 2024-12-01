import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

// Types for Exoplanet API
export interface ExoplanetData {
  planet_name: string;
  host_star: string;
  discovery_method: string;
  orbital_period: number | null;
  planet_radius: number | null;
  mass: number | null;
  semi_major_axis: number | null;
  discovery_year: number | null;
  facility?: string;
  telescope?: string;
  instrument?: string;
  ra_str?: string;
  dec_str?: string;
  controversial?: boolean;
  reference?: string;
}

// Types for Export PDF API
export interface ExportPDFRequest {
  table: string;
  data: Record<string, unknown>[];
  columns: string[];
}

export interface TableData {
  data: Record<string, unknown>[];
  columns: string[];
}

// Types for API Responses
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Types for Chart Data
export interface ChartDataPoint {
  label: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export type ChartData = ChartDataPoint[];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const discoveryMethod = searchParams.get('discoveryMethod');
    const minRadius = searchParams.get('minRadius');
    const maxRadius = searchParams.get('maxRadius');

    let query = `
      SELECT planet_name, host_star, discovery_method, 
             orbital_period, planet_radius, mass, semi_major_axis
      FROM public.exoplanets
      WHERE 1=1
    `;
    const params: any[] = [];

    if (discoveryMethod) {
      params.push(discoveryMethod);
      query += ` AND discovery_method = $${params.length}`;
    }

    if (minRadius) {
      params.push(parseFloat(minRadius));
      query += ` AND planet_radius >= $${params.length}`;
    }

    if (maxRadius) {
      params.push(parseFloat(maxRadius));
      query += ` AND planet_radius <= $${params.length}`;
    }

    query += ' ORDER BY planet_radius DESC';

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching Exoplanet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Exoplanet data' },
      { status: 500 }
    );
  }
}
