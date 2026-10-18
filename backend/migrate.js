// Creates the counter table and its one row. Safe to run again: every statement is a no-op once it has run.
require('dotenv').config();

const mysql = require('mysql2/promise');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS counter (
     id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
     value BIGINT NOT NULL DEFAULT 0,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   )`,
  'INSERT IGNORE INTO counter (id, value) VALUES (1, 0)',
];

const ATTEMPTS = 12;
const WAIT_MS = 5000;

async function connect() {
  for (let attempt = 1; ; attempt++) {
    try {
      return await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 10000 });
    } catch (err) {
      if (attempt >= ATTEMPTS) throw err;
      console.error(`Could not connect (attempt ${attempt} of ${ATTEMPTS}): ${err.message}. Retrying in ${WAIT_MS / 1000} seconds.`);
      await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
    }
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }
  const connection = await connect();
  try {
    for (const statement of STATEMENTS) {
      await connection.query(statement);
    }
    const [rows] = await connection.query('SELECT value FROM counter WHERE id = 1');
    console.log(`Migration complete. Counter is ${rows[0].value}.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
