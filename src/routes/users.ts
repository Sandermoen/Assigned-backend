import express from 'express';

import { signUp, login, auth } from '../controllers/usersController';
import protectedRoute from '../middleware/protectedRoute';

const usersRouter = express.Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);
usersRouter.get('/auth', protectedRoute, auth);

export default usersRouter;
