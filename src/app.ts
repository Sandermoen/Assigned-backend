import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import redis from 'redis';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { promisify } from 'util';

import config from './utils/config';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import unknownEndpoint from './middleware/unknownEndpoint';
import tokenExtractor from './middleware/tokenExtractor';
import apiRouter from './routes';

const redisClient = redis.createClient({
  url: config.REDIS_URI,
  password: config.REDIS_PASSWORD || undefined,
  port: 6379,
});
export const redisGet = promisify(redisClient.get.bind(redisClient));
export const redisSet = promisify(redisClient.set.bind(redisClient));
export const redisDel = promisify(redisClient.del.bind(redisClient));

const app = express();

redisClient.on('connect', () => {
  logger.info('Connected to redis server');
});

mongoose
  .connect(config.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('Connected to mongodb database');
  })
  .catch((err) => logger.error('Could not connect to mongodb:', err));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));
app.use(tokenExtractor);
app.use('/api/v1', apiRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
