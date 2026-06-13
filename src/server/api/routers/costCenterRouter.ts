import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const costCenterRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            a.cost_centre,
            a.cost_centre_name,
            a.cost_centre_manager_sn,
            a.division,
            a.department,
            u.name as manager_first_name,
            u.lastname as manager_last_name
          FROM api_tab a
          LEFT JOIN user_details u ON a.cost_centre_manager_sn = u.username
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              a.cost_centre LIKE ? OR
              a.cost_centre_name LIKE ? OR
              a.cost_centre_manager_sn LIKE ? OR
              a.division LIKE ? OR
              a.department LIKE ? OR
              u.name LIKE ? OR
              u.lastname LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY a.cost_centre ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          cost_centre: string;
          cost_centre_name: string;
          cost_centre_manager_sn: string | null;
          division: string | null;
          department: string | null;
          manager_first_name: string | null;
          manager_last_name: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching cost center data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cost center data from SLA database",
        });
      }
    }),

  searchUsers: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ input }) => {
      try {
        const searchTerm = `%${input.search}%`;
        const query = `
          SELECT username, name as first_name, lastname as last_name, email 
          FROM user_details 
          WHERE username LIKE ? OR name LIKE ? OR lastname LIKE ?
          LIMIT 20
        `;
        const [rows] = await dbSla.query<RowDataPacket[]>(query, [searchTerm, searchTerm, searchTerm]);
        
        return rows as {
          username: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
        }[];
      } catch (error) {
        console.error("Error searching users:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search users in SLA database",
        });
      }
    }),

  updateManager: protectedProcedure
    .input(z.object({
      costCentre: z.string(),
      newUsername: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const query = `UPDATE api_tab SET cost_centre_manager_sn = ? WHERE cost_centre = ?`;
        
        await dbSla.execute(query, [input.newUsername, input.costCentre]);
        
        return { success: true };
      } catch (error) {
        console.error("Error updating Cost Center Manager:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Cost Center Manager in SLA database",
        });
      }
    }),
});
