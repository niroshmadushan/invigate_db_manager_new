import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@srilankan.com";
  const password = "AdminPassword123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      accessLevel: "FULL_CONTROL",
    },
    create: {
      email,
      name: "System Administrator",
      password: hashedPassword,
      role: "ADMIN",
      accessLevel: "FULL_CONTROL",
      designation: "Chief Admin",
    },
  });

  console.log("Admin user seeded successfully!");
  console.log("Email:", admin.email);
  console.log("Password:", password);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
