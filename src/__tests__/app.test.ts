import request from 'supertest';
import app from '../app';

const api = request(app);

test('Responds with 404 for unknown endpoints', async () => {
  await api.get('/unknown-endpoint').expect('Content-Type', /json/).expect(404);
});
