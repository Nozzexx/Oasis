// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

// Define types for the query results
interface MonthData {
  month: string;
  current_year_count: number;
  prior_year_count: number;
}

// Dashboard Data Types
export interface DashboardMetrics {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartDataPoint {
  name: string;
  thisYear: number;
  lastYear: number;
}

export interface CountryData {
  country: string;
  active_payload_count: number;
}

export interface DashboardStats {
  trackedDebris: DashboardMetrics;
  activeSatellites: DashboardMetrics;
  rocketBodies: DashboardMetrics;
  totalTracked: DashboardMetrics;
  yearComparison: ChartDataPoint[];
  topCountries: CountryData[];
}

// Space Weather Types
export interface SpaceWeatherEvent {
  timestamp: string;
  type: 'flare' | 'cme' | 'storm';
  intensity: number;
  details: string;
}

// Environmental Score Types
export interface EnvironmentalScore {
  region: string;
  risk_score: number;
  flare_risk: number;
  cme_risk: number;
  storm_risk: number;
  debris_risk: number;
  confidence_score: number;
}

// Risk Assessment Types
export interface RiskAssessment {
  score: number;
  confidence: number;
  components: {
    solar: number;
    debris: number;
    magnetic: number;
  };
  recommendations: string[];
}

export async function GET(request: NextRequest) {
  try {
    // Get pagination and search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

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

    // Query for decommissioned satellites
    const decommissionedSatellitesQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sat_cat 
      WHERE object_type = 'PAYLOAD'
      AND (decay_date IS NOT NULL AND decay_date <= CURRENT_DATE)
    `);

    // Query for satellites with operational issues based on rcs_value
    const criticalThreshold = 10.0; // Example threshold value
    const operationalIssuesQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM sat_cat 
      WHERE object_type = 'PAYLOAD'
      AND rcs_value > $1
    `, [criticalThreshold]);

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

    // Query for the top 25 countries by active payloads
    const activePayloadsByCountryQuery = await pool.query(`
      SELECT 
          country,
          COUNT(*) AS active_payload_count
      FROM 
          sat_cat
      WHERE 
          object_type = 'PAYLOAD'
          AND (decay_date IS NULL OR decay_date > CURRENT_DATE)
      GROUP BY 
          country
      ORDER BY 
          active_payload_count DESC
      LIMIT 25;
    `);

    // Process the query results
    const decommissionedCount = parseInt(decommissionedSatellitesQuery.rows[0].count, 10);
    const operationalIssuesCount = parseInt(operationalIssuesQuery.rows[0].count, 10);

    // Updated satellite status query with pagination and search
    const satelliteStatusQuery = await pool.query(`
      WITH filtered_satellites AS (
        SELECT 
          satname,
          country,
          launch_date,
          period,
          inclination,
          CASE 
            WHEN decay_date IS NULL OR decay_date > CURRENT_DATE THEN true 
            ELSE false 
          END as current,
          rcs_value
        FROM sat_cat 
        WHERE object_type = 'PAYLOAD'
          AND ($3 = '' OR 
              satname ILIKE $3 || '%' OR 
              country ILIKE $3 || '%')
      )
      SELECT 
        *,
        (SELECT COUNT(*) FROM filtered_satellites) AS total_count
      FROM filtered_satellites
      ORDER BY launch_date DESC
      LIMIT $1 OFFSET $2;
    `, [limit, offset, `%${search}%`]);

    // Query for object type distribution
    const objectTypeDistributionQuery = await pool.query(`
      SELECT 
        object_type,
        COUNT(*) as count
      FROM sat_cat
      WHERE decay_date IS NULL OR decay_date > CURRENT_DATE
      GROUP BY object_type
      ORDER BY count DESC;
    `);

    // Query for launch sites distribution
    const launchSiteDistributionQuery = await pool.query(`
      SELECT 
        site,
        COUNT(*) as count
      FROM sat_cat
      WHERE (decay_date IS NULL OR decay_date > CURRENT_DATE)
        AND site IS NOT NULL
      GROUP BY site
      ORDER BY count DESC
      LIMIT 10;
    `);

    // Process the query results for month data
    const currentYearData: MonthData[] = currentYearQuery.rows;
    const priorYearData: MonthData[] = priorYearQuery.rows;
    const activePayloadsByCountryData: CountryData[] = activePayloadsByCountryQuery.rows.map(row => ({
      country: row.country,
      active_payload_count: parseInt(row.active_payload_count, 10),
    }));

    // Create a map for quick look-up of month data
    const priorYearMap = new Map(priorYearData.map(item => [item.month, item.prior_year_count]));
    const currentYearMap = new Map(currentYearData.map(item => [item.month, item.current_year_count]));

    // Combine data by aligning months
    const combinedData: MonthData[] = [];
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, '0');
      combinedData.push({
        month,
        current_year_count: currentYearMap.get(month) || 0,
        prior_year_count: priorYearMap.get(month) || 0,
      });
    }

    // Get counts
    const activeSatellitesCount = parseInt(activeSatellitesQuery.rows[0].count, 10);
    const trackedDebrisCount = parseInt(trackedDebrisQuery.rows[0].count, 10);
    const rocketBodiesCount = parseInt(rocketBodiesQuery.rows[0].count, 10);
    const totalTrackedObjects = activeSatellitesCount + trackedDebrisCount + rocketBodiesCount;

    // Calculate percentage changes by comparing with previous month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

    const currentMonthStr = currentMonth.toString().padStart(2, '0');
    const previousMonthStr = previousMonth.toString().padStart(2, '0');

    const currentCount = currentYearMap.get(currentMonthStr) || 0;
    const previousCount = priorYearMap.get(previousMonthStr) || 0;

    const percentageChange = previousCount === 0 ? 0 : 
      ((currentCount - previousCount) / previousCount) * 100;

    // Get total count for pagination
    const totalCount = satelliteStatusQuery.rows.length > 0 ? parseInt(satelliteStatusQuery.rows[0].total_count, 10) : 0;

    return NextResponse.json({
      success: true,
      data: {
        trackedDebris: {
          count: trackedDebrisCount,
          percentageChange: ((trackedDebrisCount - previousCount) / previousCount) * 100
        },
        activeSatellites: {
          count: activeSatellitesCount,
          percentageChange: percentageChange
        },
        rocketBodies: {
          count: rocketBodiesCount,
          percentageChange: ((rocketBodiesCount - previousCount) / previousCount) * 100
        },
        totalTracked: {
          count: totalTrackedObjects,
          percentageChange: ((totalTrackedObjects - previousCount) / previousCount) * 100
        },
        decommissionedSatellites: {
          count: decommissionedCount
        },
        operationalIssues: {
          count: operationalIssuesCount
        },
        yearComparison: combinedData,
        topCountries: activePayloadsByCountryData,
        satelliteStatus: satelliteStatusQuery.rows.map(row => ({
          ...row,
          period: parseFloat(row.period),
          inclination: parseFloat(row.inclination)
        })),
        objectTypeDistribution: objectTypeDistributionQuery.rows,
        launchSiteDistribution: launchSiteDistributionQuery.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit)
        }
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
