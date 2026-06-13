import express from 'express';
import { getHomePageData, updateHomePageData } from '../controllers/homeController.js';

const router = express.Router();

// GET /api/home - Fetch the singleton home page data
router.get('/', getHomePageData);

// PUT /api/home - Update or create the home page data (Admin only ideally)
router.put('/', updateHomePageData);

export default router;
