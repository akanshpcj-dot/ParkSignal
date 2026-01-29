/* eslint-disable */
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
  console.log("Running migration v2 (Fleet Mode)...");
  
  try {
    // Add location column
    try {
      await db.execute(`ALTER TABLE cars ADD COLUMN location TEXT`);
      console.log("Added location column");
    } catch (e) {
      if (e.message.includes("duplicate column")) {
        console.log("location column already exists");
      } else {
        console.error("Error adding location:", e);
      }
    }
    
    console.log("Migration v2 completed");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

main();
