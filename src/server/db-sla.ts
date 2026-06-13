import mysql from "mysql2/promise";
import { env } from "~/env";

// Ensure we only have one instance in development to avoid connection leaks
const globalForDb = globalThis as unknown as {
  dbSla: mysql.Pool | undefined;
};

export const dbSla =
  globalForDb.dbSla ??
  mysql.createPool({
    uri: env.SLA_DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (env.NODE_ENV !== "production") globalForDb.dbSla = dbSla;
