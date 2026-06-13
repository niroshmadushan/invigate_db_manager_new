import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.SLA_DATABASE_URL);
  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM api_tab");
    console.log("Columns in api_tab table:");
    console.log(columns);
    
    const [rows] = await connection.query("SELECT * FROM api_tab LIMIT 5");
    console.log("Sample data:");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();
