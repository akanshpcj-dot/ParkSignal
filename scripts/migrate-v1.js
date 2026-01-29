const { createClient } = require("@libsql/client");
require("dotenv").config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing credentials");
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function main() {
  console.log("Running migration v1...");
  
  try {
    // Add scan_count column
    try {
      await db.execute(`ALTER TABLE cars ADD COLUMN scan_count INTEGER DEFAULT 0`);
      console.log("Added scan_count column");
    } catch (e) {
      if (e.message.includes("duplicate column")) {
        console.log("scan_count column already exists");
      } else {
        console.error("Error adding scan_count:", e);
      }
    }

    // Add whatsapp_enabled column
    try {
      await db.execute(`ALTER TABLE cars ADD COLUMN whatsapp_enabled INTEGER DEFAULT 0`);
      console.log("Added whatsapp_enabled column");
    } catch (e) {
      if (e.message.includes("duplicate column")) {
        console.log("whatsapp_enabled column already exists");
      } else {
        console.error("Error adding whatsapp_enabled:", e);
      }
    }
    
    console.log("Migration completed");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

main();
