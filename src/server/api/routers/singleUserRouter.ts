import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const singleUserRouter = createTRPCRouter({
  getAllRoles: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            ur.id as role_id, 
            ur.short_name, 
            ur.long_name, 
            ur.user_id,
            ud.name as first_name, 
            ud.lastname as last_name, 
            ud.username, 
            ud.department,
            ud.email
          FROM user_roles ur
          LEFT JOIN user_details ud ON ur.user_id = ud.id
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              ur.short_name LIKE ? OR
              ur.long_name LIKE ? OR
              ud.name LIKE ? OR
              ud.lastname LIKE ? OR
              ud.username LIKE ? OR
              ud.department LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY ur.short_name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        return rows as {
          role_id: number;
          short_name: string;
          long_name: string;
          user_id: number;
          first_name: string | null;
          last_name: string | null;
          username: string | null;
          department: string | null;
          email: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching user roles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user roles from SLA database",
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

  getUserProfile: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const detailsQuery = `SELECT * FROM user_details WHERE id = ?`;
        const [detailsRows] = await dbSla.query<RowDataPacket[]>(detailsQuery, [input.userId]);
        
        if (detailsRows.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        const userDetails = detailsRows[0];

        const rolesQuery = `SELECT id, short_name, long_name FROM user_roles WHERE user_id = ?`;
        const [rolesRows] = await dbSla.query<RowDataPacket[]>(rolesQuery, [input.userId]);

        return {
          details: userDetails as Record<string, any>,
          roles: rolesRows as { id: number, short_name: string, long_name: string }[],
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user profile",
        });
      }
    }),

  updateRoleAssignment: protectedProcedure
    .input(z.object({ roleId: z.number(), newUserId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const query = `UPDATE user_roles SET user_id = ? WHERE id = ?`;
        await dbSla.query(query, [input.newUserId, input.roleId]);
        return { success: true };
      } catch (error) {
        console.error("Error updating role assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update role assignment",
        });
      }
    }),
});
