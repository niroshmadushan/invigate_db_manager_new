import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const reminderRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            id,
            rem_num,
            rev_ticket,
            rem_date
          FROM is_reminder
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              CAST(rem_num AS CHAR) LIKE ? OR
              CAST(rev_ticket AS CHAR) LIKE ?
          `;
          params.push(searchTerm, searchTerm);
        }

        query += " ORDER BY id DESC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: number;
          rem_num: number;
          rev_ticket: number;
          rem_date: Date;
        }[];
      } catch (error) {
        console.error("Error fetching reminders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reminders from SLA database",
        });
      }
    }),
});
