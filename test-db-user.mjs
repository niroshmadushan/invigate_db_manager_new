import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.SLA_DATABASE_URL);
  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM user_details");
    console.log("Columns in user_details table:");
    console.log(columns.map(c => c.Field));
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();
