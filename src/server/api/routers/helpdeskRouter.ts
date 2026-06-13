import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const helpdeskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            xid,
            id,
            name,
            extno
          FROM helpdesk
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              name LIKE ? OR
              extno LIKE ?
          `;
          params.push(searchTerm, searchTerm);
        }

        query += " ORDER BY name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          xid: number;
          id: number;
          name: string;
          extno: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching helpdesk entries:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch helpdesk from SLA database",
        });
      }
    }),

  updateExtNo: protectedProcedure
    .input(z.object({
      xid: z.number(),
      extno: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      try {
        await dbSla.query(
          `UPDATE helpdesk SET extno = ? WHERE xid = ?`,
          [input.extno, input.xid]
        );
        
        return { success: true };
      } catch (error) {
        console.error("Error updating helpdesk extno:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update extension number",
        });
      }
    }),
});
