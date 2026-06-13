import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.SLA_DATABASE_URL);
  try {
    const [rows] = await connection.query("SELECT ticket_no, cneint, mgdp, tld, g10 FROM user_details LIMIT 10");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();
