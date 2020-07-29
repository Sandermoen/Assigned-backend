import express from 'express';

import usersRouter from './users';

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);

export default apiRouter;
