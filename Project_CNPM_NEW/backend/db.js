
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const sslMode = (process.env.DB_SSL || 'false').trim().toLowerCase();
const sslEnabled = ['true', '1', 'required', 'enabled'].includes(sslMode);
if (!sslEnabled && !['false', '0', 'disabled', ''].includes(sslMode)) {
  throw new Error('DB_SSL must be true/required or false/disabled.');
}

const rejectUnauthorizedValue = (
  process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true'
).trim().toLowerCase();
if (!['true', 'false'].includes(rejectUnauthorizedValue)) {
  throw new Error('DB_SSL_REJECT_UNAUTHORIZED must be true or false.');
}

const caValue = process.env.DB_SSL_CA?.trim();
const ca = sslEnabled && caValue
  ? caValue.includes('-----BEGIN CERTIFICATE-----')
    ? caValue.replace(/\\n/g, '\n')
    : fs.readFileSync(path.resolve(__dirname, caValue), 'utf8')
  : undefined;

const ssl = sslEnabled
  ? {
      rejectUnauthorized: rejectUnauthorizedValue === 'true',
      ...(ca ? { ca } : {})
    }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bus_map',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl
});

module.exports = pool;
