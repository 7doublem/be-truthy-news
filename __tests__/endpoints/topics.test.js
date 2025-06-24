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

describe('GET /api/topics', () => {
  // happy path
  test('200: Responds with an array of all topics', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe('string');
          expect(typeof topic.slug).toBe('string');
          expect(typeof topic.img_url).toBe('string');
        });
      });
  });
});

describe('POST /api/topics', () => {
  // happy path
  test('201: Responds with newly posted topic', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'test-topic',
        description: 'jest tests for testing topics',
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toMatchObject({
          slug: 'test-topic',
          description: 'jest tests for testing topics',
          img_url: 'https://example.com/test-topic.jpg',
        });
      });
  });
  //sad path
  test('400: Responds with an error message 400: Bad Request for a request body that is missing one of the required fields', () => {
    return request(app)
      .post('/api/topics')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Missing more than one required field');
      });
  });
  test('400: Responds with an error message 400: Bad Request for a request body that is missing topic slug', () => {
    return request(app)
      .post('/api/topics')
      .send({
        description: 'jest tests for testing topics',
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Topic is required');
      });
  });
  test('400: Responds with an error message 400: Bad Request for a request body that is missing description', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'test-topic',
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Description is required');
      });
  });
  test('400: Responds with an error message 400: Bad Request for a request body that is missing image url', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'test-topic',
        description: 'jest tests for testing topics',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Image URL is required');
      });
  });
  test('400: Responds with an error message 400: Bad Request for request body that has one or more invalid data types', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 600,
        description: false,
        img_url: true,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid data type for more than one field');
      });
  });
  test('400: Responds with an error message 400: Bad Request for request body that has invalid topic slug', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 600,
        description: 'jest tests for testing topics',
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid Topic Slug');
      });
  });
  test('400: Responds with an error message 400: Bad Request for request body that has invalid description', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'test-topic',
        description: false,
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid Description');
      });
  });
  test('400: Responds with an error message 400: Bad Request for request body that has invalid image url', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'test-topic',
        description: 'jest tests for testing topics',
        img_url: false,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid Image URL');
      });
  });
  test('400: Responds with an error message 400: Bad Request for request body that has a duplicate slug', () => {
    return request(app)
      .post('/api/topics')
      .send({
        slug: 'mitch',
        description: 'jest tests for testing topics',
        img_url: 'https://example.com/test-topic.jpg',
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Topic already exists');
      });
  });
});
