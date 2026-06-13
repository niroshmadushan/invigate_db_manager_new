import { PrismaClient } from "../generated/prisma_client/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB Manager database...");
  
  // Hash the default password
  const hashedPassword = await bcrypt.hash("Connex@123", 10);

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
