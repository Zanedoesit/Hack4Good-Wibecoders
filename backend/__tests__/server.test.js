const request = require('supertest');
const app = require('../src/server');

describe('GET /', () => {
  it('returns the API message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'MINDS Activity Signup API' });
  });
});
