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
  console.log("Creating tables...");
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS cars (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vehicle_label TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("Cars table created");
    
  } catch (e) {
    console.error("Error creating tables:", e);
    process.exit(1);
  }
}

main();
