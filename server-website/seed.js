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

    // Seed Projects
    const projectsToSeed = [
      { slug: 'mahima-windchimes', title: 'Mahima Windchimes' },
      { slug: 'mahima-palm-springs', title: 'Mahima Palm Springs' },
      { slug: 'mahima-sansaar', title: 'Mahima Sansaar' },
      { slug: 'mahima-elanza', title: 'Mahima Elanza' },
      { slug: 'mahima-florenza', title: 'Mahima Florenza' }
    ];

    for (const proj of projectsToSeed) {
      const pData = JSON.parse(JSON.stringify(projectData)); // Deep copy
      pData.slug = proj.slug;
      if (pData.hero) pData.hero.title = proj.title;
      if (pData.overview) pData.overview.title = `${proj.title} Overview`;
      await Project.create(pData);
      console.log(`Seeded project: ${proj.title}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
