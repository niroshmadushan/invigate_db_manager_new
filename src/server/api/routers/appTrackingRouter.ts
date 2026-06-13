import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const appTrackingRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            staff_no,
            status,
            acc_date,
            rec_method,
            t_number,
            remarks,
            app_name,
            name,
            lastname,
            app_access
          FROM app_tracking_view
        `;

        const params: any[] = [];

        if (input.search && input.search.trim() !== "") {
          query += ` WHERE 
            name LIKE ? OR 
            lastname LIKE ? OR 
            t_number LIKE ? OR 
            rec_method LIKE ? OR 
            app_name LIKE ? OR
            app_access LIKE ?
          `;
          const searchParam = `%${input.search.trim()}%`;
          params.push(
            searchParam,
            searchParam,
            searchParam,
            searchParam,
            searchParam,
            searchParam
          );
        }

        query += ` ORDER BY acc_date DESC`;

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          staff_no: string;
          status: string;
          acc_date: Date | null;
          rec_method: string | null;
          t_number: number | null;
          remarks: string | null;
          app_name: string | null;
          name: string | null;
          lastname: string | null;
          app_access: string | null;
        }[];

      } catch (error) {
        console.error("Failed to fetch app tracking data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch app tracking data",
        });
      }
    }),
});
