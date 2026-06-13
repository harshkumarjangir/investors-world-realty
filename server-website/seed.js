import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import HomePage from './src/models/HomePage.js';
import Project from './src/models/Project.js';

dotenv.config();

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/investors-website');
    console.log('MongoDB Connected for Seeding');

    // Read JSON files
    const homeDataRaw = await fs.readFile('../website/src/data/homepage.json', 'utf8');
    const projectDataRaw = await fs.readFile('../website/src/data/project.json', 'utf8');
    
    const homeData = JSON.parse(homeDataRaw);
    const projectData = JSON.parse(projectDataRaw);

    // Clear existing data
    await HomePage.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Seed HomePage
    await HomePage.create(homeData);
    console.log('HomePage data seeded');

    // Seed Project (we need to give it a slug since it's required in our schema)
    const projectWithSlug = {
      ...projectData,
      slug: 'mahima-windchimes' // creating a slug from the hero title
    };
    await Project.create(projectWithSlug);
    console.log('Project data seeded');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
