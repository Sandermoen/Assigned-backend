import request from 'supertest';
import app from '../../app';
import User from '../../models/User';

const api = request(app);

describe('/users route', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  const baseUrl = '/api/v1/users';
  test('handles signing up correctly', async () => {
    const credentials = {
      firstName: 'John',
      lastName: 'Marston',
      email: 'fdsgsdfgdsfgdfs@gmail.com',
      password: 'testpassword',
      role: 'student',
    };
    await api.post(`${baseUrl}/signup`).send(credentials).expect(201);
  });
});
