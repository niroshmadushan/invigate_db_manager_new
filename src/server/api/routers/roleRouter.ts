import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const roleRouter = createTRPCRouter({
  
  // Get all permission roles
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view the full list of roles for management
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Only administrators can view roles." });
    }
    
    return ctx.db.permissionRole.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }),

  // Create a new permission role
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Role name is required"),
      description: z.string().optional(),
      permissions: z.record(z.object({
        view: z.boolean(),
        edit: z.boolean(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only administrators can create roles." });
      }

      const existingRole = await ctx.db.permissionRole.findUnique({
        where: { name: input.name }
      });

      if (existingRole) {
        throw new TRPCError({ code: "CONFLICT", message: "A role with this name already exists." });
      }

      return ctx.db.permissionRole.create({
        data: {
          name: input.name,
          description: input.description,
          permissions: input.permissions,
        }
      });
    }),

  // Update an existing permission role
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Role name is required"),
      description: z.string().optional(),
      permissions: z.record(z.object({
        view: z.boolean(),
        edit: z.boolean(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only administrators can update roles." });
      }

      return ctx.db.permissionRole.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          permissions: input.permissions,
        }
      });
    }),

  // Delete a permission role
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only administrators can delete roles." });
      }

      const role = await ctx.db.permissionRole.findUnique({
        where: { id: input.id },
        include: { _count: { select: { users: true } } }
      });

      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      if (role._count.users > 0) {
        throw new TRPCError({ 
          code: "PRECONDITION_FAILED", 
          message: "Cannot delete a role that is currently assigned to users. Reassign the users first." 
        });
      }

      return ctx.db.permissionRole.delete({
        where: { id: input.id }
      });
    })
});
