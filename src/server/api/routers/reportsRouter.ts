import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dbSla } from "~/server/db-sla";
import { TRPCError } from "@trpc/server";

export const reportsRouter = createTRPCRouter({
  getApplicationManage: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_application_manage");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch application manage report" });
    }
  }),
  
  getCcmManage: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_ccm_manage");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch ccm manage report" });
    }
  }),

  getHodManage: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_hod_manage");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch hod manage report" });
    }
  }),

  getItbsmManage: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_itbsm_manage");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch itbsm manage report" });
    }
  }),

  getMitbsmManage: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_mitbsm_manage");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch mitbsm manage report" });
    }
  }),

  getSingleRole: protectedProcedure.query(async () => {
    try {
      const [rows] = await dbSla.query("SELECT * FROM report_single_role");
      return rows;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch single role report" });
    }
  }),

  getPendingRequests: protectedProcedure.query(async () => {
    try {
      const url = "https://api.invgatesla.com/pending_req_view/get_requests.php";
      const auth = Buffer.from("sla:qeJWMcn2k0WOKdD5ZOHmDJR2").toString("base64");
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Basic ${auth}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Failed to fetch pending requests API:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch pending requests report" });
    }
  })
});
