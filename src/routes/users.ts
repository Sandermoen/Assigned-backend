import express from 'express';

import { signUp } from '../controllers/usersController';

const usersRouter = express.Router();

usersRouter.post('/signup', signUp);

export default usersRouter;
