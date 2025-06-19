const endpointsJson = require("../../endpoints.json");
const db = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const data = require("../../db/data/test-data");
const request = require("supertest");
const app = require("../../api");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/topics", () => {
  // happy path
  test("200: Responds with an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.img_url).toBe("string");
        });
      });
  });
  // sad path
  test("500: Responds with an error message 500: Internal Server Error", () => {
    jest.spyOn(db, "query").mockImplementation(() => {
      return Promise.reject(new Error("Database error"));
    });
    return request(app)
      .get("/api/topics")
      .expect(500)
      .then(({ body }) => {
        expect(body.msg).toBe("Internal Server Error");
        db.query.mockRestore();
      });
  });
});