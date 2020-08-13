import request from 'supertest';
import app from '../../app';
import User from '../../models/User';
import { IUser, IRefreshToken } from '../../types';
import { redisGet } from '../../app';

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

  describe('/signup', () => {
    describe('valid credentials', () => {
      test('creates and returns a new user upon signup', async () => {
        expect.assertions(1);
        await api
          .post(`${baseUrl}/signup`)
          .send(credentials)
          .expect('Content-Type', /json/)
          .expect(201);
        const users = await User.find({});
        expect(users.length).toBe(1);
      });

      test('stores a hashed version of the password', async () => {
        expect.assertions(1);
        await api
          .post(`${baseUrl}/signup`)
          .send(credentials)
          .expect('Content-Type', /json/)
          .expect(201);
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
        await api
          .post(`${baseUrl}/signup`)
          .send(credentials)
          .expect('Content-Type', /json/)
          .expect(400);
        const users = await User.find({});
        expect(users.length).toBe(0);
      });
    });
  });

  describe('/login', () => {
    beforeEach(async () => {
      const user = new User(credentials);
      await user.save();
    });

    test('handles logging in correctly', async () => {
      await api
        .post(`${baseUrl}/login`)
        .send({ email: credentials.email, password: credentials.password })
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('responds with status code 401 for incorrect details', async () => {
      await api
        .post(`${baseUrl}/login`)
        .send({
          email: credentials.email,
          password: 'incorrectpassword',
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('responds with status code 400 for incorrect details', async () => {
      await api
        .post(`${baseUrl}/login`)
        .send({ email: 'notanemail' })
        .expect('Content-Type', /json/)
        .expect(400);
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
    test('responds with status code 204 and replaces old refresh token with a new one', async () => {
      expect.assertions(1);
      const signUpResponse = await api
        .post(`${baseUrl}/signup`)
        .send(credentials);
      // Splits the string to isolate the refreshToken value
      const oldRefreshToken = signUpResponse
        .get('Set-Cookie')[0]
        .split('refreshToken=')[1]
        .split(';')[0];

      await api
        .put(`${baseUrl}/refresh`)
        .set('Cookie', `refreshToken=${oldRefreshToken}`)
        .send({ email: credentials.email })
        .expect('Set-Cookie', /refreshToken/)
        .expect(204);

      const refreshToken = JSON.parse(
        (await redisGet(credentials.email)) as string
      ) as IRefreshToken;

      expect(refreshToken.token).not.toBe(oldRefreshToken);
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
