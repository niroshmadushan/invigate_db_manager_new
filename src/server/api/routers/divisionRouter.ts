import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const divisionRouter = createTRPCRouter({
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
            division as division_name, 
            hod as hod_username, 
            hod_first as hod_first_name, 
            hod_last as hod_last_name
          FROM division
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              division LIKE ? OR
              hod LIKE ? OR
              hod_first LIKE ? OR
              hod_last LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY division ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          division_name: string;
          hod_username: string | null;
          hod_first_name: string | null;
          hod_last_name: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching divisions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch divisions from SLA database",
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

  updateHod: protectedProcedure
    .input(z.object({
      divisionName: z.string(),
      newUsername: z.string(),
      newFirstName: z.string().nullable(),
      newLastName: z.string().nullable()
    }))
    .mutation(async ({ input }) => {
      try {
        const query = `UPDATE hod SET hod_sn = ? WHERE division = ?`;
        
        await dbSla.execute(query, [
          input.newUsername, 
          input.divisionName
        ]);
        
        return { success: true };
      } catch (error) {
        console.error("Error updating HOD:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Head of Division in SLA database",
        });
      }
    }),
});
