import { authRouter } from "~/server/api/routers/authRouter";
import { userRouter } from "~/server/api/routers/userRouter";
import { roleRouter } from "~/server/api/routers/roleRouter";
import { postRouter } from "~/server/api/routers/post";
import { applicationRouter } from "~/server/api/routers/applicationRouter";
import { divisionRouter } from "~/server/api/routers/divisionRouter";
import { itbsmRouter } from "~/server/api/routers/itbsmRouter";
import { mitbsmRouter } from "~/server/api/routers/mitbsmRouter";
import { costCenterRouter } from "~/server/api/routers/costCenterRouter";
import { singleUserRouter } from "~/server/api/routers/singleUserRouter";
import { departmentRouter } from "~/server/api/routers/departmentRouter";
import { helpdeskRouter } from "~/server/api/routers/helpdeskRouter";
import { itServiceLogRouter } from "~/server/api/routers/itServiceLogRouter";
import { reminderRouter } from "~/server/api/routers/reminderRouter";
import { crResolutionRouter } from "~/server/api/routers/crResolutionRouter";
import { appAccessRouter } from "~/server/api/routers/appAccessRouter";
import { appTrackingRouter } from "~/server/api/routers/appTrackingRouter";
import { reportsRouter } from "~/server/api/routers/reportsRouter";
import { groupsRouter } from "~/server/api/routers/groupsRouter";
import { logRouter } from "~/server/api/routers/logRouter";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  user: userRouter,
  role: roleRouter,
  application: applicationRouter,
  division: divisionRouter,
  itbsm: itbsmRouter,
  mitbsm: mitbsmRouter,
  costCenter: costCenterRouter,
  singleUser: singleUserRouter,
  department: departmentRouter,
  helpdesk: helpdeskRouter,
  itServiceLog: itServiceLogRouter,
  reminder: reminderRouter,
  crResolution: crResolutionRouter,
  appAccess: appAccessRouter,
  appTracking: appTrackingRouter,
  reports: reportsRouter,
  groups: groupsRouter,
  logs: logRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
