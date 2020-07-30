import express from 'express';

import { signUp, login } from '../controllers/usersController';

const usersRouter = express.Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);

export default usersRouter;
