import express from 'express';

import usersRouter from './users';
import classRouter from './class';

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/class', classRouter);

export default apiRouter;
