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
  const id = parseInt(req.params.id);
  try{
    const update = await prisma.contentItem.update({
      where: {id},
      data: {status: req.body.status}
    });
    res.json(update);
  }catch(err){
    res.status(404).json({message: "Could not update"});
    console.log(err);
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try{
    await prisma.contentItem.delete({where: {id}});
    res.json({message:"Item deleted"});
  }catch(err){
    res.status(404).json({message: "Item was not found"});
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on http://localhost:3000');
});

