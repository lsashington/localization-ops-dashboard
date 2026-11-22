require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const contentItems = [
  { title: "Midnight Harbor", status: "In Translation", vendor: "Tidewater" },
  { title: "The Lantern Keepers", status: "QA", vendor: "Brightline Dubbing" },
  { title: "Desert Postcards", status: "Ordered", vendor: "Kestrel Language Co." },
  { title: "Paper Crowns", status: "Delivered", vendor: "Orchard Voice Works" },
  { title: "Cold Signal S2E1", status: "Ordered", vendor: "Lumen Subtitle House" },
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