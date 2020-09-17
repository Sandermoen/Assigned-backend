import request from 'supertest';
import app from '../../app';
import User from '../../models/User';
import Class from '../../models/Class';
import { ISignUpResponse } from '../../types';

const api = request(app);

describe.only('/class route', () => {
  const baseUrl = '/api/v1/class';
  describe('/create', () => {
    let accessToken: string;
    const credentials = {
      email: 'test@hotmail.com',
      password: 'testpassword',
      firstName: 'John',
      lastName: 'Marston',
      role: 'teacher',
    };

    const createClass = async (
      accessToken: string,
      expectedStatusCode = 200,
      className: string | number = 'test'
    ) => {
      await api
        .post(`${baseUrl}/create`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ className })
        .expect('Content-Type', /json/)
        .expect(expectedStatusCode);
    };

    beforeEach(async () => {
      await User.deleteMany({});
      await Class.deleteMany({});
      const response: ISignUpResponse = await api
        .post('/api/v1/users/signup')
        .send(credentials);
      accessToken = response.body.accessToken;
    });

    test('responds with status code 400 for an invalid class', async () => {
      await createClass(accessToken, 400, 1);
    });

    test('unable to create a class as a student', async () => {
      expect.assertions(1);
      const response: ISignUpResponse = await api
        .post('/api/v1/users/signup')
        .send({ ...credentials, role: 'student' });
      const accessToken = response.body.accessToken;
      await createClass(accessToken, 401);
      const classes = await Class.find({});
      expect(classes.length).toBe(0);
    });

    test('handles creating a class correctly', async () => {
      expect.assertions(1);
      await createClass(accessToken, 200);
      const classes = await Class.find({});
      expect(classes.length).toBe(1);
    });
  });
});
