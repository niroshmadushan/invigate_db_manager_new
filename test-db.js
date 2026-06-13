import { dbSla } from "./src/server/db-sla.js";

async function run() {
  try {
    const [tables] = await dbSla.query("SHOW TABLES");
    console.log("Tables:");
    console.log(tables);

    const [columns] = await dbSla.query("SHOW COLUMNS FROM division");
    console.log("Columns of division:");
    console.log(columns);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
