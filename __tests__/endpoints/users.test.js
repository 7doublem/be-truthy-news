const endpointsJson = require('../../endpoints.json');
const db = require('../../db/connection');
const seed = require('../../db/seeds/seed');
const data = require('../../db/data/test-data');
const request = require('supertest');
const app = require('../../api');

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe('GET /api/users', () => {
  // happy path
  test('200: Responds with an array of all users', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(typeof user.username).toBe('string');
          expect(typeof user.name).toBe('string');
          expect(typeof user.avatar_url).toBe('string');
        });
      });
  });
});

describe('GET /api/users/:username', () => {
  // happy path
  test('200: Responds with a user object which is found by username', () => {
    return request(app)
      .get('/api/users/butter_bridge')
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user.username).toBe('butter_bridge');
        expect(user.name).toBe('jonny');
        expect(user.avatar_url).toBe(
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
        );
      });
  });
  // sad path
  test('400: Responds with an error message 400: Bad Request when finding a user by an invalid username', () => {
    return request(app)
      .get('/api/users/900')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid Username');
      });
  });
  test('404: Responds with an error message 404: Not Found when finding a user by a username that does not exist', () => {
    return request(app)
      .get('/api/users/7doublem')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User Not Found');
      });
  });
});
