import express from 'express';
import mongoose from 'mongoose';
import redis from 'redis';
import cors from 'cors';

import config from './utils/config';
import logger from './utils/logger';

const redisClient = redis.createClient({
  url: config.REDIS_URI,
  password: config.REDIS_PASSWORD,
  port: 6379,
});
const app = express();

redisClient.on('connect', () => {
  logger.info('Connected to redis server');
});

mongoose
  .connect(config.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Connected to mongodb database');
  })
  .catch((err) => logger.error('Could not connect to mongodb:', err));

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.send('Hello!');
});

export default app;
