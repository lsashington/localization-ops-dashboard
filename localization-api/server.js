require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ['query'] });

const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.get('/api/items', async (req, res) => {
  const items = await prisma.contentItem.findMany({orderBy: {id: 'asc'}});
  res.json(items);
});

app.put('/api/items/:id',  async (req, res) => {
  const id = parseInt(req.params.id);
  try{
    const response = await prisma.contentItem.update({
      where: {id},
      data: {status: req.body.status}
    });
    res.json(response);
  }catch(err){
    console.log(err);
    res.status(404).json({message: "Could not update"});
  }
});

app.delete('/api/items/:id', async (req, res) =>{
  const id = parseInt(req.params.id);
  try{
    const response = await prisma.contentItem.delete({where : {id}});
    res.status(200).json(response);
  }catch(err){
    console.log(err);
    res.status(404).json({message: "Could not delete"});
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on http://localhost:3000');
});

app.post('/api/items' ,  async (req, res) =>{
  try{
    const response = await prisma.contentItem.create({data: {title: req.body.title, status: req.body.status, vendor: req.body.vendor}});
    res.status(201).json(response);
  }catch(err){
    console.log(err);
    res.status(500).json({message: "Could not Create"});
  }
});
