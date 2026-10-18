const mysql = require('mysql2/promise');

// One pool, created on first use. A MySQL server that is still starting must not stop the API from starting.
let pool = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 5,
      connectTimeout: 10000,
      waitForConnections: true,
    });
  }
  return pool;
}

module.exports = { getPool };
