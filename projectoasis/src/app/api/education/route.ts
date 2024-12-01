export const dynamic = "force-dynamic";

// src/app/api/education/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT id, title, short_description, detailed_content, icon_name, created_at, updated_at
      FROM space_weather_topics
      WHERE icon_name IS NOT NULL
      ORDER BY display_order
    `);

    const educationItems = result.rows.map((item) => ({
      id: item.id,
      title: item.title,
      details: item.short_description,
      fullDetails: item.detailed_content,
      time: formatTimeDifference(item.created_at),
      icon: item.icon_name, // Return the actual icon name
    }));

    return NextResponse.json(educationItems);
  } catch (error) {
    console.error('Error fetching education data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education data' },
      { status: 500 }
    );
  }
}

// Helper function to format time difference
function formatTimeDifference(timestamp: string): string {
  const currentTime = new Date();
  const itemTime = new Date(timestamp);
  const diffInSeconds = Math.floor((currentTime.getTime() - itemTime.getTime()) / 1000);

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
}