export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

// Type definitions
interface EducationTopic {
  id: number;
  title: string;
  short_description: string;
  detailed_content: string;
  icon_name: string;
  created_at: Date;
  updated_at: Date;
  display_order: number;
}

interface FormattedEducationItem {
  id: number;
  title: string;
  details: string;
  fullDetails: string;
  time: string;
  icon: string;
}

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Query to fetch space weather topics with error handling
    const query = `
      SELECT 
        id, 
        title, 
        short_description, 
        detailed_content, 
        icon_name, 
        created_at, 
        updated_at,
        display_order
      FROM space_weather_topics
      WHERE 
        icon_name IS NOT NULL 
        AND title IS NOT NULL 
        AND short_description IS NOT NULL
      ORDER BY 
        COALESCE(display_order, 9999),
        created_at DESC
    `;

    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.warn('No education topics found in database');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No education topics available'
      });
    }

    // Format data with type safety
    const educationItems: FormattedEducationItem[] = result.rows.map((item: EducationTopic) => ({
      id: item.id,
      title: item.title.trim(),
      details: item.short_description.trim(),
      fullDetails: item.detailed_content.trim(),
      time: formatTimeDifference(item.created_at.toISOString()),
      icon: item.icon_name.trim(),
    }));

    // Return successful response
    return NextResponse.json({
      success: true,
      data: educationItems,
      count: educationItems.length
    });

  } catch (error) {
    console.error('Database error in education route:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch education data',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}

function formatTimeDifference(timestamp: string): string {
  try {
    const currentTime = new Date();
    const itemTime = new Date(timestamp);
    
    if (isNaN(itemTime.getTime())) {
      throw new Error('Invalid timestamp');
    }

    const diffInSeconds = Math.floor((currentTime.getTime() - itemTime.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return 'Just now'; // Handle future dates gracefully
    }

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error formatting time difference:', error);
    return 'Unknown time';
  }
}