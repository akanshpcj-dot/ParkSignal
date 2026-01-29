import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const session = await getSession();
  
  // Security check: only superadmin can access
  if (!session || session.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const result = await db.execute("SELECT * FROM users ORDER BY created_at DESC");
  const users = result.rows.map(row => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as string,
    created_at: row.created_at as string,
  }));

  return <UsersClient users={users} />;
}
