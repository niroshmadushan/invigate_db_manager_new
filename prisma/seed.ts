import { PrismaClient } from "../generated/prisma_client/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB Manager database...");
  
  // Hash the default password
  const hashedPassword = await bcrypt.hash("Connex@123", 10);

  // 0. Create Default Permission Roles
  const adminPermissions: any = {};
  const userPermissions: any = {};

  const SYSTEM_MODULES = [
    "departments", "applications", "divisions", "mitbs", "itbsm", "cost-center", 
    "single-user", "groups", "help-desk", "logs-it-service", "reminders", 
    "cr-resolution", "report", "app-access", "app-tracking"
  ];

  SYSTEM_MODULES.forEach(m => {
    adminPermissions[m] = { view: true, edit: true };
    userPermissions[m] = { view: true, edit: false }; // Users can view everything, but not edit
  });

  const adminRoleProfile = await prisma.permissionRole.upsert({
    where: { name: "System Administrator" },
    update: { permissions: adminPermissions },
    create: {
      name: "System Administrator",
      description: "Full access to all system modules (View and Edit).",
      permissions: adminPermissions,
    }
  });

  const userRoleProfile = await prisma.permissionRole.upsert({
    where: { name: "Basic User" },
    update: { permissions: userPermissions },
    create: {
      name: "Basic User",
      description: "Read-only access to most system modules.",
      permissions: userPermissions,
    }
  });

  console.log("Upserted Permission Roles: Admin / Basic User");

  // 1. Create/Update Admin Account
  const admin = await prisma.user.upsert({
    where: { email: "admin@connexcodeworks.biz" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      accessLevel: "FULL_CONTROL"
    },
    create: {
      name: "Admin Superuser",
      email: "admin@connexcodeworks.biz",
      password: hashedPassword,
      role: "ADMIN",
      designation: "System Administrator",
      accessLevel: "FULL_CONTROL",
      permissionRoleId: adminRoleProfile.id,
    },
  });
  console.log("Upserted Admin:", admin.email);

  // 2. Create/Update Normal User Account
  const user = await prisma.user.upsert({
    where: { email: "nirosh@connexcodeworks.biz" },
    update: {
      password: hashedPassword,
      role: "USER"
    },
    create: {
      name: "Nirosh Madushan",
      email: "nirosh@connexcodeworks.biz",
      password: hashedPassword,
      role: "USER",
      designation: "Software Engineer",
      accessLevel: "VIEW_ONLY",
      permissionRoleId: userRoleProfile.id,
    },
  });
  console.log("Upserted User:", user.email);

  console.log("\n✅ Seeding complete. You can now login with:");
  console.log("   Admin: admin@connexcodeworks.biz / Connex@123");
  console.log("   User : nirosh@connexcodeworks.biz / Connex@123");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
