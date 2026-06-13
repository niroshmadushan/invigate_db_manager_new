import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const crResolutionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            id,
            team,
            req_date,
            created_date,
            type,
            task_id,
            main_cr,
            resl,
            pending_days,
            status,
            left_days,
            ex_close_day
          FROM cr_sla
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              team LIKE ? OR
              CAST(task_id AS CHAR) LIKE ? OR
              CAST(main_cr AS CHAR) LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY id DESC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: number;
          team: string;
          req_date: string;
          created_date: Date;
          type: number;
          task_id: number;
          main_cr: number;
          resl: number;
          pending_days: number | null;
          status: number;
          left_days: number | null;
          ex_close_day: Date | null;
        }[];
      } catch (error) {
        console.error("Error fetching CR resolutions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch CR resolutions from SLA database",
        });
      }
    }),
});
