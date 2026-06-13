import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const logRouter = createTRPCRouter({
  createLog: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        pageUrl: z.string().optional(),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Don't log if we can't tie it to a user
      if (!ctx.session?.user?.id) return null;

      return ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: input.action,
          pageUrl: input.pageUrl,
          details: input.details,
        },
      });
    }),

  getLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        pageFilter: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, startDate, endDate, pageFilter } = input;
      
      const where: any = { userId: ctx.session.user.id };
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
      
      if (pageFilter) {
        where.pageUrl = { contains: pageFilter };
      }

      const items = await ctx.db.auditLog.findMany({
        take: limit + 1, // get an extra item to know if there's a next page
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    // Fetch user permissions if applicable
    const userWithPerms = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { permissionRole: true },
    });

    return {
      status: {
        database: "OPERATIONAL",
        api: "OPERATIONAL",
        latency: Math.floor(Math.random() * 30) + 15, // Simulate MS
      },
      permissions: userWithPerms?.permissionRole?.permissions || null,
      roleName: userWithPerms?.permissionRole?.name || "Standard User",
      roleDesc: userWithPerms?.permissionRole?.description || "Basic access level.",
    };
  }),
});
