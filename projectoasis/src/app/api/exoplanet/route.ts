export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract and parse query parameters
    const discoveryMethod = searchParams.get('discoveryMethod');
    const minRadius = searchParams.get('minRadius');
    const maxRadius = searchParams.get('maxRadius');

    // Construct SQL query with filters
    let query = `
      SELECT 
        planet_name, 
        host_star, 
        discovery_method, 
        orbital_period, 
        planet_radius, 
        mass, 
        semi_major_axis
      FROM public.exoplanets
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Apply filters based on query parameters
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

    // Add sorting by planet radius
    query += ' ORDER BY planet_radius DESC';

    // Execute the query with parameters
    const result = await pool.query(query, params);

    // Return the fetched rows as a JSON response
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching Exoplanet data:', error);

    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to fetch Exoplanet data' },
      { status: 500 }
    );
  }
}
