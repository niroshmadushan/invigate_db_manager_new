import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import https from "https";
import { dbSla } from "~/server/db-sla";
import type { RowDataPacket } from "mysql2";

export const groupsRouter = createTRPCRouter({
  getGroups: protectedProcedure.query(async () => {
    try {
      const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
      
      const data = await new Promise<any[]>((resolve, reject) => {
        const req = https.request(
          "https://itsm.srilankan.com/api/v1/groups",
          {
            method: "GET",
            headers: {
              "Authorization": `Basic ${auth}`,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json"
            },
            timeout: 30000 // 30 seconds timeout
          },
          (res) => {
            let body = "";
            res.on("data", (chunk) => {
              body += chunk;
            });
            res.on("end", () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  const json = JSON.parse(body);
                  resolve(Array.isArray(json) ? json : []);
                } catch (e) {
                  reject(new Error("Invalid JSON response"));
                }
              } else {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
              }
            });
          }
        );

        req.on("error", (e) => {
          reject(e);
        });

        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });

        req.end();
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch groups API:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch groups" });
    }
  }),

  getGroupUsers: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
        
        const data = await new Promise<any[]>((resolve, reject) => {
          const req = https.request(
            `https://itsm.srilankan.com/api/v1/groups.users?id=${input.id}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Basic ${auth}`,
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
              },
              timeout: 30000
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => body += chunk);
              res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    const json = JSON.parse(body);
                    resolve(Array.isArray(json) ? json : []);
                  } catch (e) {
                    reject(new Error("Invalid JSON response"));
                  }
                } else {
                  reject(new Error(`HTTP error! status: ${res.statusCode}`));
                }
              });
            }
          );

          req.on("error", reject);
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timed out"));
          });
          req.end();
        });

        return data;
      } catch (error) {
        console.error("Failed to fetch group users API:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch group users" });
      }
    }),

  removeUserFromGroup: protectedProcedure
    .input(z.object({ id: z.number(), users: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      try {
        const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
        
        const data = await new Promise<any>((resolve, reject) => {
          const payload = JSON.stringify(input);
          
          const req = https.request(
            "https://itsm.srilankan.com/api/v1/groups.users",
            {
              method: "DELETE",
              headers: {
                "Authorization": `Basic ${auth}`,
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Length": Buffer.byteLength(payload)
              },
              timeout: 30000
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => body += chunk);
              res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    resolve(JSON.parse(body));
                  } catch (e) {
                    resolve(body); // Sometimes it returns non-json success
                  }
                } else {
                  reject(new Error(`HTTP error! status: ${res.statusCode}`));
                }
              });
            }
          );

          req.on("error", reject);
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timed out"));
          });
          
          req.write(payload);
          req.end();
        });

        return data;
      } catch (error) {
        console.error("Failed to remove user from group via API:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove user from group" });
      }
    }),

  addUsersToGroup: protectedProcedure
    .input(z.object({ id: z.number(), users: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      try {
        const auth = Buffer.from("SLA_API:zsuxo5Y5tt0p4bW1ndaoenOh").toString("base64");
        
        const data = await new Promise<any>((resolve, reject) => {
          const payload = JSON.stringify(input);
          
          const req = https.request(
            "https://itsm.srilankan.com/api/v1/groups.users",
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${auth}`,
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Length": Buffer.byteLength(payload)
              },
              timeout: 30000
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => body += chunk);
              res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    resolve(JSON.parse(body));
                  } catch (e) {
                    resolve(body);
                  }
                } else {
                  reject(new Error(`HTTP error! status: ${res.statusCode}`));
                }
              });
            }
          );

          req.on("error", reject);
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timed out"));
          });
          
          req.write(payload);
          req.end();
        });

        return data;
      } catch (error) {
        console.error("Failed to add users to group via API:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add users to group" });
      }
    }),

  getAllUsersForGroupAdd: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query<RowDataPacket[]>("SELECT id, name, lastname, username, email FROM user_details");
      return rows as { id: number; name: string; lastname: string; username: string; email: string; }[];
    } catch (error) {
      console.error("Failed to fetch all users from DB:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch users" });
    }
  })
});
