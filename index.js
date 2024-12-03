const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/csvRoutes');
const cors = require('cors');

const app = express();

// Configuration de CORS
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type',
}));

// Middleware pour gérer les données JSON et les formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route d'upload
app.use('/api', uploadRoutes);

// Exportez votre app pour Vercel
module.exports = app;
