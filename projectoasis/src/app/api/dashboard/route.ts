// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import pool from '@/utils/db';

// Define types for the query results
interface MonthData {
  month: string; // e.g., '01', '02', etc.
  current_year_count: number;
  prior_year_count: number;
}

export async function GET() {
  try {
    // Query for active satellites (payloads)
    const activeSatellitesQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sat_cat 
      WHERE object_type = 'PAYLOAD' 
      AND (decay_date IS NULL OR decay_date > CURRENT_DATE)
    `);

    // Query for tracked debris
    const trackedDebrisQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sat_cat 
      WHERE object_type = 'DEBRIS'
      AND (decay_date IS NULL OR decay_date > CURRENT_DATE)
    `);

    // Query for rocket bodies
    const rocketBodiesQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sat_cat 
      WHERE object_type = 'ROCKET BODY'
      AND (decay_date IS NULL OR decay_date > CURRENT_DATE)
    `);

    // Query for the current year (2024)
    const currentYearQuery = await pool.query(`
      SELECT
          TO_CHAR(launch_date, 'MM') AS month,
          COUNT(*) AS current_year_count
      FROM
          sat_cat
      WHERE
          (decay_date IS NULL OR decay_date > CURRENT_DATE)
          AND EXTRACT(YEAR FROM launch_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY
          TO_CHAR(launch_date, 'MM')
      ORDER BY
          month;
    `);

    // Query for the previous year (2023)
    const priorYearQuery = await pool.query(`
      SELECT
          TO_CHAR(launch_date, 'MM') AS month,
          COUNT(*) AS prior_year_count
      FROM
          sat_cat
      WHERE
          (decay_date IS NULL OR decay_date > CURRENT_DATE)
          AND EXTRACT(YEAR FROM launch_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
      GROUP BY
          TO_CHAR(launch_date, 'MM')
      ORDER BY
          month;
    `);

    const currentYearData: { month: string; current_year_count: number }[] = currentYearQuery.rows;
    const priorYearData: { month: string; prior_year_count: number }[] = priorYearQuery.rows;

    // Create a map for quick look-up of month data
    const priorYearMap = new Map(priorYearData.map(item => [item.month, item.prior_year_count]));
    const currentYearMap = new Map(currentYearData.map(item => [item.month, item.current_year_count]));

    // Combine data by aligning months
    const combinedData: MonthData[] = [];

    // Iterate over all 12 months to ensure alignment from '01' to '12'
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, '0'); // Convert to '01', '02', etc.
      combinedData.push({
        month,
        current_year_count: currentYearMap.get(month) || 0,
        prior_year_count: priorYearMap.get(month) || 0,
      });
    }

    // Get counts
    const activeSatellitesCount = parseInt(activeSatellitesQuery.rows[0].count);
    const trackedDebrisCount = parseInt(trackedDebrisQuery.rows[0].count);
    const rocketBodiesCount = parseInt(rocketBodiesQuery.rows[0].count);
    const totalTrackedObjects = activeSatellitesCount + trackedDebrisCount + rocketBodiesCount;

    // Calculate percentage changes (using static values for now)
    const satelliteChange = -0.03;
    const debrisChange = 1.02;
    const rocketChange = 5.03;
    const totalChange = 6.08;

    return NextResponse.json({
      success: true,
      data: {
        trackedDebris: {
          count: trackedDebrisCount,
          percentageChange: debrisChange
        },
        activeSatellites: {
          count: activeSatellitesCount,
          percentageChange: satelliteChange
        },
        rocketBodies: {
          count: rocketBodiesCount,
          percentageChange: rocketChange
        },
        totalTracked: {
          count: totalTrackedObjects,
          percentageChange: totalChange
        },
        yearComparison: combinedData
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
