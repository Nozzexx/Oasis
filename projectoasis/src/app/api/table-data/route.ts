export const dynamic = "force-dynamic";

// src/app/api/table-data/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  let client;
  try {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get('table');

    if (!table) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      );
    }

    // Validate table name to prevent SQL injection
    const validTables = [
      'sat_cat',
      'gp',
      'neo_objects',
      'donki_solar_flare',
      'donki_cme',
      'geostorm_kp_index'
    ];

    if (!validTables.includes(table)) {
      return NextResponse.json(
        { success: false, message: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Get a client from the pool
    client = await pool.connect();

    // Get column information
    const columnQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    const columnResult = await client.query(columnQuery, [table]);
    const columns = columnResult.rows.map(row => row.column_name);

    // Get table data with pagination
    const dataQuery = `
      SELECT *
      FROM ${table}
      LIMIT 1000;
    `;
    const dataResult = await client.query(dataQuery);

    return NextResponse.json({
      success: true,
      columns,
      rows: dataResult.rows
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch table data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}
