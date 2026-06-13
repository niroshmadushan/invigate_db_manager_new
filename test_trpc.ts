import { appAccessRouter } from "./src/server/api/routers/appAccessRouter";
import { createTRPCContext } from "./src/server/api/trpc";
import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const caller = appAccessRouter.createCaller({ dbSla, session: null } as any);
    const users = await caller.getByAppName({ appName: "AeroOps - Web" });
    console.log("Users in AeroOps - Web:", users.length);
    console.log(users.slice(0, 3));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
