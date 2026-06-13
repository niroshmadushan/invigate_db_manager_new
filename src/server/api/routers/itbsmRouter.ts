import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const itbsmRouter = createTRPCRouter({
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
            h.id, 
            h.division as division_name, 
            h.department,
            h.itbsm as itbsm_username, 
            u.name as itbsm_first_name, 
            u.lastname as itbsm_last_name
          FROM hod h
          LEFT JOIN user_details u ON h.itbsm = u.username
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              h.division LIKE ? OR
              h.department LIKE ? OR
              h.itbsm LIKE ? OR
              u.name LIKE ? OR
              u.lastname LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY h.division ASC, h.department ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: number;
          division_name: string;
          department: string;
          itbsm_username: string | null;
          itbsm_first_name: string | null;
          itbsm_last_name: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching ITBSM data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ITBSM data from SLA database",
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

  updateItbsm: protectedProcedure
    .input(z.object({
      divisionName: z.string(),
      departments: z.array(z.string()),
      newUsername: z.string()
    }))
    .mutation(async ({ input }) => {
      if (input.departments.length === 0) return { success: true };
      
      try {
        const placeholders = input.departments.map(() => "?").join(", ");
        const query = `UPDATE hod SET itbsm = ? WHERE division = ? AND department IN (${placeholders})`;
        
        const params = [input.newUsername, input.divisionName, ...input.departments];
        
        await dbSla.execute(query, params);
        
        return { success: true };
      } catch (error) {
        console.error("Error updating ITBSM:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ITBSM in SLA database",
        });
      }
    }),
});
