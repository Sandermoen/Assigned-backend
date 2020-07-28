import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
let MONGO_URI;
let REDIS_URI;
let REDIS_PASSWORD;
if (process.env.NODE_ENV === 'test') {
  MONGO_URI = process.env.TEST_MONGO_URI;
  REDIS_URI = process.env.TEST_REDIS_URI;
  REDIS_PASSWORD = process.env.TEST_REDIS_PASSWORD;
} else {
  MONGO_URI = process.env.MONGO_URI;
  REDIS_URI = process.env.REDIS_URI;
  REDIS_PASSWORD = process.env.REDIS_PASSWORD;
}

export default {
  PORT,
  MONGO_URI,
  REDIS_URI,
  REDIS_PASSWORD,
};
