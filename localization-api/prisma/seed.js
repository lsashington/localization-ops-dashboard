require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const contentItems = [
  { title: "The Last Airbender", status: "QA", vendor: "Delux Distribution" },
  { title: "Stranger Things", status: "Delivered", vendor: "TransPerfect" },
  { title: "One Piece", status: "In Translation", vendor: "Pixelogic" },
  { title: "Dahmer", status: "QA", vendor: "FotoKem" },
  { title: "Love Is Blind", status: "Ordered", vendor: "ODMedia" },
];

async function main() {
  for (const item of contentItems) {
    await prisma.contentItem.create({ data: item });
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());