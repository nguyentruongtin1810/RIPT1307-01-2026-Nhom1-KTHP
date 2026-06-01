const mysql = require('mysql2/promise');
require('dotenv').config();

const TABLES = ['users','candidates','universities','majors','subject_groups','major_subject_groups','applications'];

async function run(){
  const db = process.env.MYSQL_DATABASE || 'university_admission';
  const conn = await mysql.createConnection({ host: process.env.MYSQL_HOST || 'localhost', port: process.env.MYSQL_PORT || 3306, user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '', database: db });
  const ts = Date.now();
  for (const t of TABLES) {
    const [rows] = await conn.execute("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [db, t]);
    if (rows[0].cnt > 0) {
      const newName = `${t}_backup_${ts}`;
      console.log(`Renaming table ${t} -> ${newName}`);
      await conn.execute(`RENAME TABLE \`${db}\`.\`${t}\` TO \`${db}\`.\`${newName}\``);
    } else {
      console.log(`Table ${t} does not exist, skipping`);
    }
  }
  await conn.end();
}

run().catch(err=>{ console.error('Rename failed:', err); process.exit(1); });
