import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const [rows] = await dbSla.query("DESCRIBE app_tracking_view");
    console.log(rows);
    
    const [data] = await dbSla.query("SELECT * FROM app_tracking_view LIMIT 5");
    console.log("Sample Data:");
    console.log(data);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
