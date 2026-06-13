import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const applicationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ input }: { input: { search?: string } }) => {
      try {
        let query = `
          SELECT 
            a.id, 
            a.name as application_name, 
            a.apc_sn as controller_username, 
            c.name as controller_first_name, 
            c.lastname as controller_last_name,
            a.apo_sn as owner_username, 
            o.name as owner_first_name, 
            o.lastname as owner_last_name
          FROM appc_det a
          LEFT JOIN user_details c ON a.apc_sn = c.username
          LEFT JOIN user_details o ON a.apo_sn = o.username
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              a.name LIKE ? OR
              a.apc_sn LIKE ? OR
              c.name LIKE ? OR
              c.lastname LIKE ? OR
              a.apo_sn LIKE ? OR
              o.name LIKE ? OR
              o.lastname LIKE ?
          `;
          // 7 parameters for the 7 LIKE clauses
          params.push(
            searchTerm, searchTerm, searchTerm, searchTerm, 
            searchTerm, searchTerm, searchTerm
          );
        }

        query += " ORDER BY a.name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          id: string;
          application_name: string;
          controller_username: string | null;
          controller_first_name: string | null;
          controller_last_name: string | null;
          owner_username: string | null;
          owner_first_name: string | null;
          owner_last_name: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching applications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch applications from SLA database",
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

  updateAssignment: protectedProcedure
    .input(z.object({
      applicationId: z.string(),
      type: z.enum(["controller", "owner"]),
      newUsername: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const column = input.type === "controller" ? "apc_sn" : "apo_sn";
        const query = `UPDATE appc_det SET ${column} = ? WHERE id = ?`;
        
        const [result] = await dbSla.execute(query, [input.newUsername, input.applicationId]);
        
        return { success: true };
      } catch (error) {
        console.error("Error updating assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update application assignment in SLA database",
        });
      }
    }),
});
