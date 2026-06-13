import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";

export const appAccessRouter = createTRPCRouter({
  getAllGrouped: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            app_name,
            emp_no,
            name,
            lastname
          FROM app_access_view
        `;
        
        const params: any[] = [];
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            WHERE 
              app_name LIKE ? OR
              emp_no LIKE ? OR
              name LIKE ? OR
              lastname LIKE ?
          `;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY app_name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        // Group by app_name
        const groupedMap = new Map<string, {
          app_name: string;
          employees: { emp_no: string; name: string | null; lastname: string | null; }[]
        }>();

        for (const row of rows) {
          const appName = row.app_name || 'Unknown Application';
          
          if (!groupedMap.has(appName)) {
            groupedMap.set(appName, {
              app_name: appName,
              employees: []
            });
          }
          
          const isValidUser = row.emp_no || row.name || row.lastname;
          
          if (isValidUser) {
            groupedMap.get(appName)!.employees.push({
              emp_no: row.emp_no,
              name: row.name,
              lastname: row.lastname
            });
          }
        }

        return Array.from(groupedMap.values());
      } catch (error) {
        console.error("Error fetching app access details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch app access details from SLA database",
        });
      }
    }),

  getByAppName: protectedProcedure
    .input(z.object({ appName: z.string(), search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        let query = `
          SELECT 
            emp_no,
            name,
            lastname
          FROM app_access_view
          WHERE 
        `;

        const params: any[] = [];

        if (input.appName === 'Unknown Application') {
          query += `(app_name IS NULL OR app_name = 'Unknown Application')`;
        } else {
          query += `app_name = ?`;
          params.push(input.appName);
        }
        
        console.log(`[appAccessRouter.getByAppName] Searching for appName: "${input.appName}"`);
        
        if (input.search && input.search.trim() !== "") {
          const searchTerm = `%${input.search}%`;
          query += `
            AND (
              emp_no LIKE ? OR
              name LIKE ? OR
              lastname LIKE ?
            )
          `;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY name ASC";

        const [rows] = await dbSla.query<RowDataPacket[]>(query, params);
        
        // Filter out completely blank rows
        const validRows = rows.filter(row => row.emp_no || row.name || row.lastname);
        
        return validRows as {
          emp_no: string;
          name: string | null;
          lastname: string | null;
        }[];
      } catch (error) {
        console.error("Error fetching specific app users:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users for the application",
        });
      }
    }),
});
