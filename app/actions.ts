'use server';

import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

export async function addCar(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const carName = formData.get('car_name') as string;
  const vehicleNumber = formData.get('vehicle_number') as string;
  const phone = formData.get('phone') as string;
  const parkingSlot = formData.get('parking_slot') as string;
  const whatsappMessage = formData.get('whatsapp_message') as string;

  if (!carName || !vehicleNumber || !phone) return { error: 'Missing required fields' };

  // Legacy compatibility: construct label
  const label = `${carName} - ${vehicleNumber}`;

  try {
    const id = uuidv4();
    await db.execute({
      sql: `INSERT INTO cars (
        id, user_id, vehicle_label, phone_number, location, 
        car_name, vehicle_number, parking_slot, whatsapp_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        session.id, 
        label, 
        phone, 
        parkingSlot || null,
        carName,
        vehicleNumber,
        parkingSlot || null,
        whatsappMessage || 'Hello, regarding your parked vehicle'
      ],
    });
    revalidatePath('/dashboard/cars');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to add car' };
  }
}

export async function deleteCar(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') throw new Error('Unauthorized');

  await db.execute({
    sql: "DELETE FROM cars WHERE id = ?",
    args: [id],
  });
  revalidatePath('/dashboard/cars');
}

export async function toggleCar(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') throw new Error('Unauthorized');

  await db.execute({
    sql: "UPDATE cars SET is_active = ? WHERE id = ?",
    args: [isActive ? 1 : 0, id],
  });
  revalidatePath('/dashboard/cars');
}

export async function toggleWhatsapp(id: string, isEnabled: boolean) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Allow any authenticated user to toggle WhatsApp
  await db.execute({
    sql: "UPDATE cars SET whatsapp_enabled = ? WHERE id = ?",
    args: [isEnabled ? 1 : 0, id],
  });
  
  revalidatePath('/dashboard/cars');
}

export async function logInteraction(
  carId: string, 
  type: 'scan' | 'call' | 'whatsapp',
  metadata?: {
    latitude?: number;
    longitude?: number;
    userAgent?: string;
  }
) {
  // This can be called by public users, so no session check
  try {
    const id = uuidv4();
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

    await db.execute({
      sql: `INSERT INTO interactions (
        id, car_id, type, ip_address, user_agent, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        carId, 
        type,
        ip,
        metadata?.userAgent || null,
        metadata?.latitude || null,
        metadata?.longitude || null
      ],
    });
    
    // If it's a scan, we also increment the legacy counter
    if (type === 'scan') {
        await db.execute({
            sql: "UPDATE cars SET scan_count = scan_count + 1 WHERE id = ?",
            args: [carId],
        });
    }
  } catch (e) {
    console.error(`Failed to log interaction ${type} for car ${carId}`, e);
    // Don't fail the request if logging fails
  }
}

export async function resetPassword(userId: string) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  const passwordHash = await hashPassword('admin');

  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [passwordHash, userId],
  });
  
  revalidatePath('/dashboard/users');
}

export async function addUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return { error: 'Unauthorized' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'Missing required fields' };
  }

  try {
    // Check if user exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return { error: 'User already exists' };
    }

    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: [id, email, passwordHash, role],
    });

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to add user' };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return { error: 'Unauthorized' };
  }

  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  if (!email || !role) {
    return { error: 'Missing required fields' };
  }

  try {
    await db.execute({
      sql: "UPDATE users SET email = ?, role = ? WHERE id = ?",
      args: [email, role, userId],
    });

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to update user' };
  }
}

export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  try {
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [userId],
    });

    revalidatePath('/dashboard/users');
  } catch (e) {
    console.error(e);
    throw new Error('Failed to delete user');
  }
}
