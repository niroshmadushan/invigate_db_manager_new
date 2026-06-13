import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sendEmail } from "~/server/mailer";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        designation: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          phone: input.phone,
          designation: input.designation,
          image: input.image,
        },
      });
      return { success: true };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        name: true,
        phone: true,
        designation: true,
        image: true,
        role: true,
        permissionRole: true,
      },
    });
  }),

  getAllUsers: protectedProcedure
    .input(z.object({ searchQuery: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      
      return ctx.db.user.findMany({
        where: {
          id: { not: ctx.session.user.id },
          ...(input?.searchQuery ? {
            OR: [
              { name: { contains: input.searchQuery } },
              { email: { contains: input.searchQuery } }
            ]
          } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accessLevel: true,
          designation: true,
          permissionRoleId: true,
          permissionRole: {
            select: { name: true }
          }
        },
      });
    }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "USER"]),
        accessLevel: z.enum(["VIEW_ONLY", "FULL_CONTROL"]),
        permissionRoleId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          role: input.role,
          accessLevel: input.accessLevel,
          permissionRoleId: input.permissionRoleId || null,
        },
      });
      return { success: true };
    }),

  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["ADMIN", "USER"]),
        accessLevel: z.enum(["VIEW_ONLY", "FULL_CONTROL"]),
        designation: z.string().optional(),
        permissionRoleId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          accessLevel: input.accessLevel,
          designation: input.designation,
          permissionRoleId: input.permissionRoleId || null,
        },
      });

      // Send welcome email with credentials
      await sendEmail({
        to: input.email,
        subject: "Welcome to DB MANAGER - Account Provisioned",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #2563eb;">Account Provisioned</h2>
            <p>Hello <strong>${input.name}</strong>,</p>
            <p>An administrative account has been provisioned for you on the DB Manager System.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>System Role:</strong> ${input.role}</p>
              <p style="margin: 5px 0 0 0;"><strong>Login Email:</strong> ${input.email}</p>
              <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> ${input.password}</p>
            </div>
            <p style="color: #64748b; font-size: 12px;">Please log in and change your password immediately via the Profile Settings panel.</p>
          </div>
        `,
      });

      return { success: true };
    }),

  updateUserDetails: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        designation: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (existing && existing.id !== input.userId) {
        throw new Error("Another user with this email already exists");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          name: input.name,
          email: input.email,
          designation: input.designation,
        },
      });
      return { success: true };
    }),

  adminResetPassword: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          password: hashedPassword,
        },
      });
      return { success: true };
    }),
});
