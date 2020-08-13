import express from 'express';

import { signUp, login, auth, refresh } from '../controllers/usersController';
import protectedRoute from '../middleware/protectedRoute';

const usersRouter = express.Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);
usersRouter.get('/auth', protectedRoute, auth);
usersRouter.put('/refresh', refresh);

export default usersRouter;
