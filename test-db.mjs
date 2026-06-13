import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.SLA_DATABASE_URL);
  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM hod");
    console.log("Columns in hod table:");
    console.log(columns);
    
    const [rows] = await connection.query("SELECT * FROM hod LIMIT 5");
    console.log("Sample data:");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();
