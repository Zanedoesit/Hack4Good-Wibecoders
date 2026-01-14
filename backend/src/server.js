// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const signupsRoutes = require('./routes/signups');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/auth', authRoutes);
app.use('/activities', activitiesRoutes);
app.use('/signups', signupsRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MINDS Activity Signup API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});