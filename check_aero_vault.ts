import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const [rows] = await dbSla.query("SELECT * FROM app_access_view WHERE app_name = 'Aero Vault'");
    console.log("Users in Aero Vault:");
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
