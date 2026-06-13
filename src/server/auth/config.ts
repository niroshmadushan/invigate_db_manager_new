import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      accessLevel: "VIEW_ONLY" | "FULL_CONTROL";
      phone?: string | null;
      designation?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "USER";
    accessLevel?: "VIEW_ONLY" | "FULL_CONTROL";
    phone?: string | null;
    designation?: string | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        if (!credentials.otp) {
          return null;
        }

        const otpRecord = await db.otp.findFirst({
          where: {
            email: user.email,
            code: credentials.otp as string,
            purpose: "LOGIN",
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) {
          return null;
        }

        // Consume the OTP so it can't be reused
        await db.otp.deleteMany({
          where: { email: user.email, purpose: "LOGIN" },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accessLevel: user.accessLevel,
          phone: user.phone,
          designation: user.designation,
        };
      }
    })
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.designation !== undefined) token.designation = session.designation;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessLevel = user.accessLevel;
        token.phone = user.phone;
        token.designation = user.designation;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as "ADMIN" | "USER",
        accessLevel: token.accessLevel as "VIEW_ONLY" | "FULL_CONTROL",
        phone: token.phone as string | undefined,
        designation: token.designation as string | undefined,
      },
    }),
  },
} satisfies NextAuthConfig;
