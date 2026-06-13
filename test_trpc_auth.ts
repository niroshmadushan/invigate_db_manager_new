import { appAccessRouter } from "./src/server/api/routers/appAccessRouter";
import { dbSla } from "./src/server/db-sla";

async function run() {
  try {
    const caller = appAccessRouter.createCaller({ dbSla, session: { user: { id: "1" } } } as any);
    const users = await caller.getByAppName({ appName: "AeroOps - Web" });
    console.log("Users in AeroOps - Web:", users.length);
    console.log(users.slice(0, 3));
    
    const usersUnknown = await caller.getByAppName({ appName: "Unknown Application" });
    console.log("Users in Unknown Application:", usersUnknown.length);
    
    const usersAeroVault = await caller.getByAppName({ appName: "Aero Vault" });
    console.log("Users in Aero Vault:", usersAeroVault.length);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
