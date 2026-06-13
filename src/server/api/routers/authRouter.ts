import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { sendEmail } from "~/server/mailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRouter = createTRPCRouter({
  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email(), purpose: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw new Error("User not found");
      }

      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await ctx.db.otp.create({
        data: {
          email: input.email,
          userId: user.id,
          code: otpCode,
          purpose: input.purpose,
          expiresAt,
        },
      });

      const success = await sendEmail({
        to: input.email,
        subject: `Your OTP for ${input.purpose}`,
        html: `<p>Your OTP is: <strong>${otpCode}</strong></p><p>It will expire in 10 minutes.</p>`,
      });

      if (!success) {
        throw new Error("Failed to send OTP email");
      }

      return { success: true };
    }),

  verifyCredentialsAndSendOtp: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user || !user.password) {
        throw new Error("Invalid credentials");
      }
      
      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // 3. Generate a 6-digit OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // DEVELOPMENT HELPER: Log OTP to the terminal so the user can log in even if email fails
      console.log(`\n=========================================`);
      console.log(`🔐 OTP CODE FOR ${input.email}: ${otpCode} `);
      console.log(`=========================================\n`);

      await ctx.db.otp.create({
        data: {
          email: input.email,
          userId: user.id,
          code: otpCode,
          purpose: "LOGIN",
          expiresAt,
        },
      });

      const emailHtml = `
        <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #0C0C0E; padding: 40px 20px; color: #ffffff; text-align: center;">
          <div style="max-w: 500px; margin: 0 auto; background-color: #151518; border: 1px solid #2A2A35; border-radius: 16px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">🔒</span>
            </div>
            <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff;">DB-MANAGER</h1>
            <p style="color: #94A3B8; font-size: 14px; margin-bottom: 30px;">System Authentication Protocol</p>
            
            <div style="background-color: #0A0A0C; border: 1px dashed #3B82F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0 0 10px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Access Code</p>
              <h2 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #60A5FA;">${otpCode}</h2>
            </div>
            
            <p style="color: #64748B; font-size: 13px; line-height: 1.6;">
              Please enter this code to verify your identity and complete the login sequence. This code is securely generated and will expire in <strong>5 minutes</strong>.
            </p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2A35;">
              <p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">SriLankan Airlines • Internal Systems</p>
            </div>
          </div>
        </div>
      `;

      const success = await sendEmail({
        to: input.email,
        subject: "DB-Manager Access Code",
        html: emailHtml,
        fromName: "DB Manager Info"
      });

      if (!success) {
        throw new Error("Failed to send OTP email");
      }

      return { success: true, requireOtp: true };
    }),

  verifyOtpAndResetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const otp = await ctx.db.otp.findFirst({
        where: {
          email: input.email,
          code: input.code,
          purpose: "RESET_PASSWORD",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otp) {
        throw new Error("Invalid or expired OTP");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      await ctx.db.user.update({
        where: { email: input.email },
        data: { password: hashedPassword },
      });

      await ctx.db.otp.deleteMany({
        where: { email: input.email, purpose: "RESET_PASSWORD" },
      });

      return { success: true };
    }),

  sendOtpToNewEmail: protectedProcedure
    .input(z.object({ newEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.newEmail } });
      if (existing) {
        throw new Error("Email is already in use by another account");
      }
      
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await ctx.db.otp.create({
        data: {
          email: input.newEmail,
          userId: ctx.session.user.id,
          code: otpCode,
          purpose: "CHANGE_EMAIL",
          expiresAt,
        },
      });

      const success = await sendEmail({
        to: input.newEmail,
        subject: `Verify your new email address`,
        html: `<p>Your verification code is: <strong>${otpCode}</strong></p><p>It will expire in 10 minutes.</p>`,
      });

      if (!success) {
        throw new Error("Failed to send verification email");
      }

      return { success: true };
    }),

  verifyOtpAndChangeEmail: protectedProcedure
    .input(z.object({ newEmail: z.string().email(), code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const otp = await ctx.db.otp.findFirst({
        where: {
          email: input.newEmail,
          userId: ctx.session.user.id,
          code: input.code,
          purpose: "CHANGE_EMAIL",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otp) {
        throw new Error("Invalid or expired OTP");
      }

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { email: input.newEmail },
      });

      await ctx.db.otp.deleteMany({
        where: { email: input.newEmail, purpose: "CHANGE_EMAIL" },
      });

      return { success: true };
    }),
});
