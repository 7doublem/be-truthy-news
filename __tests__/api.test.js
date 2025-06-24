const endpointsJson = require('../endpoints.json');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const request = require('supertest');
const app = require('../api');

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe('GET /api', () => {
  test('200: Responds with an object detailing the documentation for each endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('General errors', () => {
  test('404: Responds with an error message 404: Not found', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Page Not Found');
      });
  });
});
