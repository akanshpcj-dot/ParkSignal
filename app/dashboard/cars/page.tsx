import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
// Import client component
import CarsClient, { Car } from './cars-client';

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  const params = await searchParams;
  
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = 10;
  const search = typeof params.search === 'string' ? params.search : '';
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM cars WHERE 1=1";
  let countQuery = "SELECT COUNT(*) as total FROM cars WHERE 1=1";
  const args: (string | number)[] = [];

  if (search) {
    const searchPattern = `%${search}%`;
    query += " AND (vehicle_label LIKE ? OR car_name LIKE ? OR vehicle_number LIKE ? OR phone_number LIKE ? OR location LIKE ? OR parking_slot LIKE ?)";
    countQuery += " AND (vehicle_label LIKE ? OR car_name LIKE ? OR vehicle_number LIKE ? OR phone_number LIKE ? OR location LIKE ? OR parking_slot LIKE ?)";
    // Push args for each ? (6 times)
    args.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  const queryArgs = [...args, limit, offset];
  const countArgs = [...args];

  const [rowsResult, countResult] = await Promise.all([
    db.execute({ sql: query, args: queryArgs }),
    db.execute({ sql: countQuery, args: countArgs }),
  ]);

  const cars = rowsResult.rows.map((row) => ({ ...row })) as unknown as Car[];
  const total = countResult.rows[0].total as number;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Vehicles
          </h2>
        </div>
      </div>
      <CarsClient 
        initialCars={cars} 
        pagination={{
          page,
          totalPages,
          total
        }}
        search={search}
        userRole={session?.role || ''}
        currentUserId={session?.id || ''}
      />
    </div>
  );
}
