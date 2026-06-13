import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const departmentRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            id,
            dep_name,
            dep_man,
            sec_manager,
            dep_man_id,
            sec_man_id
          FROM slc_dep
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              dep_name LIKE ? OR
              dep_man LIKE ? OR
              sec_manager LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY dep_name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: number;
          dep_name: string;
          dep_man: string;
          sec_manager: string;
          dep_man_id: number | null;
          sec_man_id: number | null;
        }[];
      } catch (error) {
        console.error("Error fetching departments:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch departments from SLA database",
        });
      }
    }),

  searchUsers: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ input }) => {
      try {
        const searchTerm = `%${input.search}%`;
        const query = `
          SELECT id, username, name, lastname, email, department, position 
          FROM user_details 
          WHERE username LIKE ? OR name LIKE ? OR lastname LIKE ? OR email LIKE ?
          LIMIT 20
        `;
        const [rows] = await dbSla.query<RowDataPacket[]>(query, [searchTerm, searchTerm, searchTerm, searchTerm]);
        
        return rows as {
          id: number;
          username: string;
          name: string | null;
          lastname: string | null;
          email: string | null;
          department: string | null;
          position: string | null;
        }[];
      } catch (error) {
        console.error("Error searching users:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search users in SLA database",
        });
      }
    }),

  updateManagers: protectedProcedure
    .input(z.object({
      id: z.number(),
      dep_man: z.string(),
      dep_man_id: z.number().nullable(),
      sec_manager: z.string(),
      sec_man_id: z.number().nullable(),
    }))
    .mutation(async ({ input }) => {
      try {
        const [result] = await dbSla.query(
          `UPDATE slc_dep SET 
            dep_man = ?, 
            dep_man_id = ?, 
            sec_manager = ?, 
            sec_man_id = ? 
           WHERE id = ?`,
          [
            input.dep_man, 
            input.dep_man_id, 
            input.sec_manager, 
            input.sec_man_id, 
            input.id
          ]
        );
        
        return { success: true };
      } catch (error) {
        console.error("Error updating department managers:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update department managers",
        });
      }
    }),
});
