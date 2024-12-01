export const dynamic = "force-dynamic";

// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/utils/db';

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const read = searchParams.get('read');

    let query = `
      SELECT 
        id,
        title,
        body,
        created_at,
        read,
        notification_type
      FROM notifications
    `;

    const queryParams: (string | number | boolean)[] = [];
    let paramCounter = 1;

    if (read !== null) {
      query += ` WHERE read = $${paramCounter}`;
      queryParams.push(read === 'true');
      paramCounter++;
    }

    query += ` ORDER BY created_at DESC`;
    
    if (limit) {
      query += ` LIMIT $${paramCounter}`;
      queryParams.push(limit);
    }

    const result = await client.query(query, queryParams);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch notifications'
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    const data = await request.json();
    
    const query = `
      INSERT INTO notifications (
        title,
        body,
        notification_type,
        read
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await client.query(query, [
      data.title,
      data.body,
      data.notification_type || 'general',
      false
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding notification:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add notification'
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

// Update notification read status
export async function PATCH(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    const data = await request.json();
    
    const query = `
      UPDATE notifications
      SET read = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(query, [true, data.id]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update notification'
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
