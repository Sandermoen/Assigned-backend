import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import User from '../../models/User';
import { IUser, IRefreshToken } from '../../types';
import { redisGet, redisClient } from '../../app';

const api = request(app);

describe('/users route', () => {
  const credentials = {
    firstName: 'John',
    lastName: 'Marston',
    email: 'test@gmail.com',
    password: 'testpassword',
    role: 'student',
  };
  const baseUrl = '/api/v1/users';
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    redisClient.quit();
  });

  describe('/signup', () => {
    const signup = async (
      credentials: { [key: string]: string | number | Record<string, unknown> },
      expectedCode: number
    ) => {
      await api
        .post(`${baseUrl}/signup`)
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(expectedCode);
    };

    describe('valid credentials', () => {
      test('creates and returns a new user upon signup', async () => {
        expect.assertions(1);
        await signup(credentials, 201);
        const users = await User.find({});
        expect(users.length).toBe(1);
      });

      test('stores a hashed version of the password', async () => {
        expect.assertions(1);
        await signup(credentials, 201);
        const user = await User.findOne({ email: credentials.email });
        if (user?.password) {
          expect(user.password).not.toBe(credentials.password);
        }
      });
    });

    describe('invalid credentials', () => {
      test('responds with status code 400 for invalid details', async () => {
        expect.assertions(1);
        const credentials = {
          firstName: 'test',
          lastName: 'hello',
        };
        await signup(credentials, 400);
        const users = await User.find({});
        expect(users.length).toBe(0);
      });

      test('responds with status code 400 and does not create a user when user already exists', async () => {
        const user = new User(credentials);
        await user.save();
        await signup(credentials, 400);
        const users = await User.find({ email: credentials.email });
        expect(users.length).toBe(1);
      });
    });
  });

  describe('/login', () => {
    const login = async (
      credentials: { [key: string]: string | number | Record<string, unknown> },
      expectedCode: number
    ) => {
      await api
        .post(`${baseUrl}/login`)
        .send({ email: credentials.email, password: credentials.password })
        .expect('Content-Type', /json/)
        .expect(expectedCode);
    };

    beforeEach(async () => {
      const user = new User(credentials);
      await user.save();
    });

    test('handles logging in with correct information', async () => {
      await login(
        { email: credentials.email, password: credentials.password },
        200
      );
    });

    test('responds with status code 401 when user does not exist', async () => {
      await login(
        {
          email: 'doesnot@exist.com',
          password: 'incorrectpassword',
        },
        401
      );
    });

    test('responds with status code 401 when the password is incorrent', async () => {
      await login(
        {
          email: credentials.email,
          password: 'incorrectpassword',
        },
        401
      );
    });

    test('responds with status code 400 for malformatted details', async () => {
      await login({ email: 'notanemail' }, 400);
    });
  });

  describe('/auth', () => {
    test('responds with status code 200 and exchanges JWT token for user details', async () => {
      expect.assertions(1);
      const response: {
        body: { user: IUser & { id: string }; accessToken: string };
      } = await api.post(`${baseUrl}/signup`).send(credentials);

      const user = await api
        .get(`${baseUrl}/auth`)
        .set('Authorization', `bearer ${response.body.accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(user.body).toEqual(response.body.user);
    });
  });

  describe('/refresh', () => {
    test('responds with status code 200 and replaces old refresh token with a new one and responds with access token', async () => {
      expect.assertions(2);
      const signUpResponse = await api
        .post(`${baseUrl}/signup`)
        .send(credentials);
      // Splits the string to isolate the refreshToken value
      const oldRefreshToken = signUpResponse
        .get('Set-Cookie')[0]
        .split('refreshToken=')[1]
        .split(';')[0];

      const response: {
        body: { accessToken: string };
      } = await api
        .put(`${baseUrl}/refresh`)
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .send({ email: credentials.email })
        .expect('Set-Cookie', /refreshToken/)
        .expect(200);

      const refreshToken = JSON.parse(
        (await redisGet(credentials.email)) as string
      ) as IRefreshToken;

      expect(refreshToken.token).not.toBe(oldRefreshToken);
      expect(response.body.accessToken).toBeDefined();
    });

    test('responds with status code 401 and does not replace token when an invalid token is provided', async () => {
      await api.post(`${baseUrl}/signup`).send(credentials);
      const oldRefreshToken = JSON.parse(
        (await redisGet(credentials.email)) as string
      ) as IRefreshToken;

      await api
        .put(`${baseUrl}/refresh`)
        .set('Cookie', `refreshToken=invalidtoken`)
        .send({ email: credentials.email })
        .expect('Content-Type', /json/)
        .expect(401);

      const newRefreshToken = JSON.parse(
        (await redisGet(credentials.email)) as string
      ) as IRefreshToken;

      expect(oldRefreshToken).toEqual(newRefreshToken);
    });
  });
});
