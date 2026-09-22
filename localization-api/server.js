require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.get('/api/items', async (req, res) => {
  const items = await prisma.contentItem.findMany();
  res.json(items);
});

app.put('/api/items/:id', async (req, res) => {
  const updated = await prisma.contentItem.update({
    where: { id: parseInt(req.params.id) },
    data: { status: req.body.status },
  });
  res.json(updated);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on http://localhost:3000');
});