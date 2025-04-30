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
        expect(body.msg).toBe("Article Not Found");
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

describe("GET /api/articles/:article_id/comments", () => {
  // happy path
  test("200: Responds with an array of comments for the given article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("200: Responds with an empty array for an article with no comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(0);
        expect(comments).toEqual([]);
      });
  });
  // sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect article_id", () => {
    return request(app)
      .get("/api/articles/mitch/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid article_id that doesn't exist", () => {
    return request(app)
      .get("/api/articles/789/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe(`Article Not Found`);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  // happy path
  test("201: Responds with newly posted comment", () => {
    return request(app)
      .post("/api/articles/11/comments")
      .send({
        username: "butter_bridge",
        body: "I am commenting on this post from an airplane, does that make me a bird? Careful, Sam. Too much pondering and you'll wake up a cat, vaguely disappointed.",
      })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          article_id: 11,
          author: "butter_bridge",
          body: "I am commenting on this post from an airplane, does that make me a bird? Careful, Sam. Too much pondering and you'll wake up a cat, vaguely disappointed.",
          votes: 0,
        });
        expect(comment.comment_id).toEqual(expect.any(Number));
        expect(comment.created_at).toEqual(expect.any(String));
      });
  });
  //sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect article_id", () => {
    return request(app)
      .post("/api/articles/mitch/comments")
      .send({
        username: "butter_bridge",
        body: "I am commenting on this post from an airplane, does that make me a bird? Careful, Sam. Too much pondering and you'll wake up a cat, vaguely disappointed.",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid article_id that doesn't exist", () => {
    return request(app)
      .post("/api/articles/789/comments")
      .send({
        username: "butter_bridge",
        body: "I am commenting on this post from an airplane, does that make me a bird? Careful, Sam. Too much pondering and you'll wake up a cat, vaguely disappointed.",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
  test("400: Responds with an error message 400: Bad Request for request body that is missing the required fields", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a username that does not exist in the users table", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({
        username: "silly_comms",
        body: "I am commenting on this post from an airplane, does that make me a bird? Careful, Sam. Too much pondering and you'll wake up a cat, vaguely disappointed.",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username Not Found");
      });
  });
  test("400: Responds with an error message 400: Bad Request for invalid data types in the request body", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: 99,
        body: false,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  // happy path
  test("200: Responds with updated article with updated votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -100 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
        expect(article.article_id).toEqual(expect.any(Number));
        expect(article.created_at).toEqual(expect.any(String));
      });
  });
  //sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect article_id", () => {
    return request(app)
      .patch("/api/articles/mitch")
      .send({ inc_votes: -100 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid article_id that doesn't exist", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: -100 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });
  test("400: Responds with an error message 400: Bad Request for request body that is missing the required fields", () => {
    return request(app)
      .patch("/api/articles/4")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Responds with an error message 400: Bad Request for invalid data types in the request body", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: "one hundred" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  // happy path
  test("204: Deletes comment by it's id, does not return content, but returns 404 when trying to get comment", () => {
    return request(app)
      .delete("/api/comments/4")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/comments/4")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not Found");
          });
      });
  });
  // sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect comment_id", () => {
    return request(app)
      .delete("/api/comments/comment")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid comment_id that doesn't exist", () => {
    return request(app)
      .delete("/api/comments/789")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment Not Found");
      });
  });
});
