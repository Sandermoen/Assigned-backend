import request from 'supertest';
import app from '../../app';
import User from '../../models/User';

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
    test('handles signing up correctly', async () => {
      expect.assertions(1);
      await api
        .post(`${baseUrl}/signup`)
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(201);
      const users = await User.find({});
      expect(users.length).toBe(1);
    });

    test('responds with status code 400 for incorrect details', async () => {
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

  describe.only('/login', () => {
    beforeEach(async () => {
      await api.post(`${baseUrl}/signup`).send(credentials);
    });

    test('handles logging in correctly', async () => {
      await api
        .post(`${baseUrl}/login`)
        .send({ email: credentials.email, password: credentials.password })
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('responds with status code 401 for invalid details', async () => {
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
});
