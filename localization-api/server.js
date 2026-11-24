require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ['query'] });

const express = require('express');
const app = express();
const cors = require('cors');

const VALID_STATUSES = ["QA","Ordered","In Translation","Delivered"];

app.use(express.json());
app.use(cors());

app.get('/api/items', async (req, res) => {
  const items = await prisma.contentItem.findMany({orderBy: {id: 'asc'}});
  res.json(items);
});

app.put('/api/items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const status = req.body.status?.trim();

  if(!VALID_STATUSES.includes(status)){return res.status(422).json({message: "Status is not valid"});}
  try{
    const response = await prisma.contentItem.update({where: {id}, data: {status: status}});
    res.status(200).json(response);
  }catch(err){
    console.log(err);
    res.status(404).json({message: "Could not update item"});
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try{
    const response = await prisma.contentItem.delete({where: {id}});
    res.status(200).json(response);
  }catch(err){
    console.log(err);
    res.status(404).json({message: "Could not delete item"});
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on http://localhost:3000');
});

app.post('/api/items/', async (req, res) => {
  const title = req.body.title?.trim();
  const vendor = req.body.vendor?.trim();
  const status = req.body.status?.trim();
  if(!title) {return res.status(422).json({message: "Title cannot be empty"});}
  if(!vendor) {return res.status(422).json({message: "Vendor cannot be empty"});}
  if(!VALID_STATUSES.includes(status)){return res.status(422).json({message: "Status is not valid"});}
  try{
    const response = await prisma.contentItem.create({data: {title: title, status: status, vendor: vendor, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null}});
    res.status(201).json(response);
  }catch(err){
    console.log(err);
    res.status(500).json({message: "Could not create item"});
  }
});