const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const router = express.Router();


// Route: Getall users






module.exports = router;
