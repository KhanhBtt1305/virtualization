
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile !== 'function') {
    throw new Error('Loading backend/.env requires Node.js 20.12 or newer.');
  }
  process.loadEnvFile(envPath);
}

const ssl = process.env.DB_SSL === 'true'
  ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      ...(process.env.DB_SSL_CA
        ? { ca: fs.readFileSync(path.resolve(__dirname, process.env.DB_SSL_CA), 'utf8') }
        : {})
    }
  : undefined;

const ssl = process.env.DB_SSL?.toLowerCase() === 'required'
  ? { rejectUnauthorized: true }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bus_map',
  port: process.env.DB_PORT || 3306,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl
});

module.exports = pool;
