const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function migrate() {
  console.log('Starting migration v3...');

  try {
    // 1. Add car_name column
    try {
      await db.execute("ALTER TABLE cars ADD COLUMN car_name TEXT");
      console.log('Added car_name column');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        console.log('car_name column might already exist or error:', e.message);
      }
    }

    // 2. Add vehicle_number column
    try {
      await db.execute("ALTER TABLE cars ADD COLUMN vehicle_number TEXT");
      console.log('Added vehicle_number column');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        console.log('vehicle_number column might already exist or error:', e.message);
      }
    }

    // 3. Add parking_slot column
    try {
      await db.execute("ALTER TABLE cars ADD COLUMN parking_slot TEXT");
      console.log('Added parking_slot column');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        console.log('parking_slot column might already exist or error:', e.message);
      }
    }

    // 4. Add whatsapp_message column
    try {
      await db.execute("ALTER TABLE cars ADD COLUMN whatsapp_message TEXT DEFAULT 'Hello, regarding your parked vehicle'");
      console.log('Added whatsapp_message column');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        console.log('whatsapp_message column might already exist or error:', e.message);
      }
    }

    // 5. Migrate existing data
    console.log('Migrating existing data...');
    const result = await db.execute("SELECT id, vehicle_label, location FROM cars");
    
    for (const row of result.rows) {
      const label = row.vehicle_label;
      const location = row.location;
      
      // Simple heuristic: if label contains digits, treat as number, else name?
      // Actually, user wants split. We'll just set both to label for now to be safe.
      // Or set car_name = label, vehicle_number = label.
      // And set parking_slot = location.
      
      await db.execute({
        sql: "UPDATE cars SET car_name = ?, vehicle_number = ?, parking_slot = ? WHERE id = ?",
        args: [label, label, location, row.id]
      });
    }
    console.log('Data migration completed.');

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
