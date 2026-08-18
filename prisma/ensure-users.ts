import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const passwordHash = hashSync("demo1234", 10);

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@eisa.local" },
    update: { role: "ADMIN", name: "Administrador", area: "TI" },
    create: {
      email: "admin@eisa.local",
      name: "Administrador",
      area: "TI",
      role: "ADMIN",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "ana.garcia@eisa.local" },
    update: { role: "SOLICITANTE" },
    create: {
      email: "ana.garcia@eisa.local",
      name: "Ana García",
      area: "Compras",
      role: "SOLICITANTE",
      passwordHash,
    },
  });

  console.log("Perfiles listos:");
  console.log("- Administrador: admin@eisa.local / demo1234");
  console.log("- Solicitante:   ana.garcia@eisa.local / demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
