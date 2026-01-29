/* eslint-disable */
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing credentials");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
  const email = "admin@parksignal.com";
  const password = "admin";
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  try {
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
      args: [id, email, hashedPassword],
    });
    console.log(`Admin created: ${email} / ${password}`);
  } catch (e) {
    // Check for unique constraint violation (error message varies by driver/db)
    if (e.toString().includes("UNIQUE constraint failed") || e.toString().includes("ALREADY EXISTS")) {
      console.log("Admin already exists");
    } else {
      console.error("Error creating admin:", e);
    }
  }
}

main();
