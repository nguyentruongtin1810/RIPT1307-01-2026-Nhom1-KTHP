const mysql = require('mysql2/promise');
require('dotenv').config();

async function run(){
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'university_admission'
  });
  const [rows] = await conn.execute("SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'candidates' ORDER BY ORDINAL_POSITION", [process.env.MYSQL_DATABASE || 'university_admission']);
  console.log(rows);
  await conn.end();
}

run().catch(err=>{ console.error(err); process.exit(1); });
