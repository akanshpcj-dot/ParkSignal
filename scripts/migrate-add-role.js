/* eslint-disable */
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
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
  console.log("Starting migration: Adding roles...");

  try {
    // 1. Add role column if it doesn't exist
    try {
        await db.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'owner'");
        console.log("Added role column to users table");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
            console.log("Role column already exists");
        } else {
            throw e;
        }
    }

    // 2. Set admin@parksignal.com to superadmin
    await db.execute({
        sql: "UPDATE users SET role = 'superadmin' WHERE email = ?",
        args: ['admin@parksignal.com']
    });
    console.log("Updated admin@parksignal.com to superadmin");

    // 3. Create owner user if not exists
    const ownerEmail = 'owner@parksignal.com';
    const existingOwner = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [ownerEmail]
    });

    if (existingOwner.rows.length === 0) {
        const passwordHash = await bcrypt.hash('admin', 10);
        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4();

        await db.execute({
            sql: "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
            args: [id, ownerEmail, passwordHash, 'owner']
        });
        console.log(`Created owner user: ${ownerEmail}`);
    } else {
        console.log(`Owner user ${ownerEmail} already exists`);
    }

    console.log("Migration completed successfully");

  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

main();
