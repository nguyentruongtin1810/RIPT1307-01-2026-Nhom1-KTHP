const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "university_admission_prod",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  namedPlaceholders: true
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("MySQL production database is reachable.");
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection
};
// To test the connection when this module is loaded