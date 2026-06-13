import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const [rows] = await dbSla.query("DESCRIBE app_access_view");
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
