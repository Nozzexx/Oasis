export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

interface SpaceObject {
  norad_cat_id: string;
  object_name: string;
  object_type: string;
  inclination: number;
  mean_motion: number;
  eccentricity: number;
  period: number;
  semimajor_axis: number;
  apoapsis: number;
  periapsis: number;
  rcs_size: string;
  country_code: string;
  launch_date: string;
  decay_date: string | null;
}

// GET handler to fetch space object data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const objectType = searchParams.get('type') || 'ALL';
    const timeframe = parseInt(searchParams.get('timeframe') || '24'); // hours

    let query = `
      SELECT 
        gp.norad_cat_id,
        gp.object_name,
        gp.object_type,
        gp.inclination::float,
        gp.mean_motion::float,
        gp.eccentricity::float,
        gp.period::float,
        gp.semimajor_axis::float,
        gp.apoapsis::float,
        gp.periapsis::float,
        gp.rcs_size,
        gp.country_code,
        gp.launch_date,
        gp.decay_date,
        gp.mean_anomaly::float as current_anomaly,
        gp.mean_motion_dot::float as motion_change,
        gp.ra_of_asc_node::float as right_ascension,
        gp.arg_of_pericenter::float as argument_periapsis
      FROM gp
      WHERE updated_at >= NOW() - interval '${timeframe} hours'
        AND (gp.decay_date IS NULL OR gp.decay_date > CURRENT_DATE)
    `;

    const queryParams: (string | number)[] = [];
    if (objectType !== 'ALL') {
      query += ` AND object_type = $1`;
      queryParams.push(objectType);
    }

    const result = await pool.query(query, queryParams);

    // Process results and calculate positions
    const spaceObjects = result.rows.map(row => {
      const position = calculatePosition(
        row.semimajor_axis,
        row.eccentricity,
        row.inclination,
        row.right_ascension,
        row.argument_periapsis,
        row.current_anomaly
      );

      return {
        id: row.norad_cat_id,
        name: row.object_name,
        type: row.object_type,
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
        orbit: {
          semimajorAxis: row.semimajor_axis,
          eccentricity: row.eccentricity,
          inclination: row.inclination,
          period: row.period,
        },
        metadata: {
          country: row.country_code,
          rcsSize: row.rcs_size,
          launchDate: row.launch_date,
          decayDate: row.decay_date,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: spaceObjects,
      metadata: {
        total: spaceObjects.length,
        timeframe,
        lastUpdate: new Date().toISOString(),
        objectTypes: {
          PAYLOAD: spaceObjects.filter(obj => obj.type.trim().toUpperCase() === 'PAYLOAD').length,
          DEBRIS: spaceObjects.filter(obj => obj.type.trim().toUpperCase() === 'DEBRIS').length,
          ROCKET_BODY: spaceObjects.filter(obj => obj.type.trim().toUpperCase() === 'ROCKET BODY').length,
        },
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch space objects data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate position from orbital elements
function calculatePosition(
  semiMajorAxis: number,
  eccentricity: number,
  inclination: number,
  rightAscension: number,
  argumentPeriapsis: number,
  meanAnomaly: number
): { x: number; y: number; z: number } {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  // Solve Kepler's equation for eccentric anomaly
  let E = meanAnomaly;
  for (let i = 0; i < 10; i++) {
    E = meanAnomaly + eccentricity * Math.sin(E);
  }

  const x = semiMajorAxis * (Math.cos(E) - eccentricity);
  const y = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2) * Math.sin(E);

  const cosI = Math.cos(toRadians(inclination));
  const sinI = Math.sin(toRadians(inclination));
  const cosO = Math.cos(toRadians(rightAscension));
  const sinO = Math.sin(toRadians(rightAscension));
  const cosw = Math.cos(toRadians(argumentPeriapsis));
  const sinw = Math.sin(toRadians(argumentPeriapsis));

  return {
    x: x * (cosO * cosw - sinO * sinw * cosI) - y * (cosO * sinw + sinO * cosw * cosI),
    y: x * (sinO * cosw + cosO * sinw * cosI) + y * (cosO * cosw * cosI - sinO * sinw),
    z: x * sinw * sinI + y * cosw * sinI,
  };
}
