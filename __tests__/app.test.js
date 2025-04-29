const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../api");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("General errors", () => {
  test("404: Responds with an error message 404: Not found", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
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

describe("GET /api/articles/:article_id", () => {
  // happy path
  test("200: Responds with an article object by the article id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.author).toBe("icellusedkars");
        expect(article.title).toBe("Eight pug gifs that remind me of mitch");
        expect(article.article_id).toBe(3);
        expect(article.body).toBe("some gifs");
        expect(article.topic).toBe("mitch");
        expect(new Date(article.created_at).getTime()).toBe(1604394720000);
        expect(article.votes).toBe(0);
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  // sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect article_id", () => {
    return request(app)
      .get("/api/articles/mitch")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid article_id that doesn't exist", () => {
    return request(app)
      .get("/api/articles/789")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe(`No article found for article_id: 789`);
      });
  });
});

describe("GET /api/articles", () => {
  // happy path
  test("200: Responds with an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSorted({ descending: true });
        articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
        });
        // article with comments
        const article1 = articles.find((f) => f.article_id === 1);
        expect(article1.comment_count).toBe(11);
        // article without comments
        const article13 = articles.find((f) => f.article_id === 13);
        expect(article13.comment_count).toBe(0);
      });
  });
});
