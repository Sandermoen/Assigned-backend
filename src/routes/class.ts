import express from 'express';

import { createClass } from '../controllers/classController';
import protectedRoute from '../middleware/protectedRoute';

const classRouter = express.Router();

classRouter.post('/create', protectedRoute, createClass);

export default classRouter;
