export const dynamic = "force-dynamic";

// src/app/api/environmental-scores/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = `
      SELECT 
        id,
        timestamp,
        region,
        risk_score,
        flare_risk,
        cme_risk,
        storm_risk,
        debris_risk,
        data_status,
        confidence_score,
        model_version
      FROM environmental_scores
    `;

    const queryParams: (string | number)[] = [];
    let paramCounter = 1;

    if (region) {
      query += ` WHERE region = $${paramCounter}`;
      queryParams.push(region);
      paramCounter++;
    }

    query += ` ORDER BY timestamp DESC`;
    
    if (limit) {
      query += ` LIMIT $${paramCounter}`;
      queryParams.push(limit);
    }

    const result = await pool.query(query, queryParams);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching environmental scores:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch environmental scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optionally add POST method if you need to manually add scores
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const query = `
      INSERT INTO environmental_scores (
        region,
        risk_score,
        flare_risk,
        cme_risk,
        storm_risk,
        debris_risk,
        data_status,
        confidence_score,
        model_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.region,
      data.risk_score,
      data.flare_risk,
      data.cme_risk,
      data.storm_risk,
      data.debris_risk,
      data.data_status,
      data.confidence_score,
      data.model_version
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding environmental score:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add environmental score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}