import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:slug')
  .get(getProjectBySlug)
  .put(updateProject)
  .delete(deleteProject);

export default router;
