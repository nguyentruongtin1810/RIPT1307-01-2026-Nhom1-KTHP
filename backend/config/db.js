const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const { seedInitialData } = require("../models/initModel");

dotenv.config();

const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "university_admission";

let pool;

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();

  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true
  });

  // debug: log database and existing tables
  try {
    const [tables] = await pool.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [MYSQL_DATABASE]);
    console.log('Using database:', MYSQL_DATABASE, 'Existing tables:', tables.map(t=>t.TABLE_NAME));
  } catch (e) {
    console.error('Failed to list tables for debug:', e.message);
  }

  await createTables();
  await seedInitialData(pool);
}

async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_users_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      gender VARCHAR(20),
      dob DATE DEFAULT NULL,
      id_card_number VARCHAR(50),
      priority_group VARCHAR(100) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_candidates_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS universities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(30) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      logo_url VARCHAR(2083) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS majors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      university_id INT NOT NULL,
      code VARCHAR(40) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      quota INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_majors_university_id (university_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS subject_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS major_subject_groups (
      major_id INT NOT NULL,
      subject_group_id INT NOT NULL,
      PRIMARY KEY (major_id, subject_group_id),
      FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (subject_group_id) REFERENCES subject_groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_major_subject_groups_major_id (major_id),
      INDEX idx_major_subject_groups_subject_group_id (subject_group_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidate_id INT NOT NULL,
      major_id INT NOT NULL,
      subject_group_id INT NOT NULL,
      scores JSON NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      rejection_reason TEXT DEFAULT NULL,
      document_url VARCHAR(2083) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (subject_group_id) REFERENCES subject_groups(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_applications_candidate_id (candidate_id),
      INDEX idx_applications_major_id (major_id),
      INDEX idx_applications_subject_group_id (subject_group_id),
      INDEX idx_applications_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const query of queries) {
    await pool.query(query);
  }
}

function getPool() {
  if (!pool) {
    throw new Error("Database pool not initialized. Call initializeDatabase() first.");
  }
  return pool;
}

module.exports = { initializeDatabase, getPool };
