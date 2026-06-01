const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'university_admission';

async function run(){
  const conn = await mysql.createConnection({ host: MYSQL_HOST, port: MYSQL_PORT, user: MYSQL_USER, password: MYSQL_PASSWORD, database: MYSQL_DATABASE });
  const [rows] = await conn.execute(`SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'candidates' AND COLUMN_NAME = 'user_id'`, [MYSQL_DATABASE]);
  if (rows[0].cnt > 0) {
    console.log('Column user_id already exists on candidates');
    await conn.end();
    return;
  }

  console.log('Adding user_id column to candidates (nullable)');
  await conn.execute("ALTER TABLE candidates ADD COLUMN user_id INT NULL AFTER id");
  console.log('Added column user_id');
  await conn.end();
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
