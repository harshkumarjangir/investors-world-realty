import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

import homeRoutes from './src/routes/homeRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import path from 'path';

// ... middleware ...

// API Routes
app.use('/api/home', homeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic route
app.get('/', (req, res) => {
  res.send('Investors World Realty Website API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
