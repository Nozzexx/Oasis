import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const discoveryMethod = searchParams.get('discoveryMethod');
    const minRadius = searchParams.get('minRadius');
    const maxRadius = searchParams.get('maxRadius');
    const minMass = searchParams.get('minMass');
    const maxMass = searchParams.get('maxMass');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const sortBy = searchParams.get('sortBy') || 'planet_radius';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    let query = `
      SELECT 
        planet_name, 
        host_star, 
        discovery_method, 
        orbital_period, 
        planet_radius, 
        mass, 
        semi_major_axis,
        discovery_year,
        created_at,
        updated_at
      FROM public.exoplanets
      WHERE 1=1
    `;
    const params: any[] = [];

    // Discovery Method filter
    if (discoveryMethod) {
      params.push(discoveryMethod);
      query += ` AND discovery_method = $${params.length}`;
    }

    // Radius range filter
    if (minRadius) {
      params.push(parseFloat(minRadius));
      query += ` AND planet_radius >= $${params.length}`;
    }
    if (maxRadius) {
      params.push(parseFloat(maxRadius));
      query += ` AND planet_radius <= $${params.length}`;
    }

    // Mass range filter
    if (minMass) {
      params.push(parseFloat(minMass));
      query += ` AND mass >= $${params.length}`;
    }
    if (maxMass) {
      params.push(parseFloat(maxMass));
      query += ` AND mass <= $${params.length}`;
    }

    // Discovery year range filter
    if (minYear) {
      params.push(parseInt(minYear));
      query += ` AND discovery_year >= $${params.length}`;
    }
    if (maxYear) {
      params.push(parseInt(maxYear));
      query += ` AND discovery_year <= $${params.length}`;
    }

    // Validate sort parameters to prevent SQL injection
    const validSortColumns = [
      'planet_radius',
      'mass',
      'orbital_period',
      'discovery_year',
      'semi_major_axis'
    ];
    const validSortOrders = ['ASC', 'DESC'];

    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'planet_radius';
    const sanitizedSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    query += ` ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder}`;

    // Add NULLS LAST to handle null values in sorting
    query += ` NULLS LAST`;

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