import { db } from './lib/db';

async function check() {
  const users = await db.execute("SELECT id, email, role FROM users");
  console.log("Users:", users.rows);

  const cars = await db.execute("SELECT id, vehicle_label, user_id FROM cars");
  console.log("Cars:", cars.rows);
}

check();
