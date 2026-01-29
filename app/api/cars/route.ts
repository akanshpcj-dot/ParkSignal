import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM cars WHERE user_id = ?";
    let countQuery = "SELECT COUNT(*) as total FROM cars WHERE user_id = ?";
    const args: any[] = [(session as any).id];

    if (search) {
      const searchPattern = `%${search}%`;
      query += " AND (vehicle_label LIKE ? OR phone_number LIKE ? OR location LIKE ?)";
      countQuery += " AND (vehicle_label LIKE ? OR phone_number LIKE ? OR location LIKE ?)";
      args.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    // For main query, we need to add limit and offset
    const queryArgs = [...args, limit, offset];
    
    // For count query, we use the original args
    const countArgs = [...args];

    const [rowsResult, countResult] = await Promise.all([
      db.execute({ sql: query, args: queryArgs }),
      db.execute({ sql: countQuery, args: countArgs }),
    ]);

    const total = countResult.rows[0].total as number;

    return NextResponse.json({
      data: rowsResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
