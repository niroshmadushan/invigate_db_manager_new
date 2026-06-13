import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const [rows] = await dbSla.query("SELECT DISTINCT app_name FROM app_access_view WHERE app_name LIKE 'Aero%'");
    console.log("DB app_names starting with Aero:");
    for (const r of rows as any[]) {
      console.log(`"${r.app_name}"`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
