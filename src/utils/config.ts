import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
let MONGO_URI;
let REDIS_URI;
if (process.env.NODE_ENV === 'test') {
  MONGO_URI = process.env.TEST_MONGO_URI;
  REDIS_URI = process.env.TEST_REDIS_URI;
} else {
  MONGO_URI = process.env.MONGO_URI;
  REDIS_URI = process.env.REDIS_URI;
}

export default {
  PORT,
  MONGO_URI,
  REDIS_URI,
  REDIS_PASSWORD,
};
