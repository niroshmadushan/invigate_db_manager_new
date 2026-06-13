import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const itServiceLogRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            id,
            service,
            updated_date,
            t_no,
            service_ref,
            type,
            r_date,
            r_type,
            service_owner,
            review_staff,
            changes
          FROM it_service_log
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              service LIKE ? OR
              changes LIKE ? OR
              service_owner LIKE ? OR
              review_staff LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY id DESC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: number;
          service: string;
          updated_date: Date;
          t_no: number;
          service_ref: string;
          type: string;
          r_date: Date | null;
          r_type: string | null;
          service_owner: string | null;
          review_staff: string | null;
          changes: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching IT service logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch logs from SLA database",
        });
      }
    }),
});
