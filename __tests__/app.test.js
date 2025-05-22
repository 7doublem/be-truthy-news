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
        expect(article.comment_count).toBe(2);
      });
  });
  test("200: Responds with an article object and comment count of 0 for an article with no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.author).toBe("icellusedkars");
        expect(article.title).toBe("Sony Vaio; or, The Laptop");
        expect(article.article_id).toBe(2);
        expect(article.body).toBe(
          "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me."
        );
        expect(article.topic).toBe("mitch");
        expect(article.created_at).toEqual(expect.any(String));
        expect(article.votes).toBe(0);
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(article.comment_count).toBe(0);
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
        expect(body.msg).toBe(
          "Oops! That article could not be found. It might have been deleted or never existed"
        );
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
        expect(body.msg).toBe(
          "Oops! That article could not be found. It might have been deleted or never existed"
        );
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
        expect(body.msg).toBe(
          "Oops! That article could not be found. It might have been deleted or never existed"
        );
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
        expect(body.msg).toBe(
          "Oops! That article could not be found. It might have been deleted or never existed"
        );
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
        expect(body.msg).toBe(
          "Oops! That comment could not be found. It might have been deleted or never existed"
        );
      });
  });
});

describe("GET /api/users", () => {
  // happy path
  test("200: Responds with an array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  //happy path
  test("200: Responds with an array of articles sorted by created_at in descending order (default)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSorted("created_at", { descending: true });
      });
  });
  test("200: Responds with an array of articles sorted by comment count in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSorted("comment_count", { ascending: true });
      });
  });
  test("200: Responds with an array of articles sorted by votes in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSorted("votes", { descending: true });
      });
  });
  // sad path
  test("400: Responds with an error message 400 when trying to sort by an invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=reactions&order=desc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Field");
      });
  });
  test("400: Responds with an error message 400 when trying to order by an invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=downwards")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Order Field");
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  // happy path
  test("200: Responds with an array of articles filtered by a topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: Responds with an empty array when the topic exists but doesn't have any articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
        expect(articles).toEqual([]);
      });
  });
  // sad path
  test("404: Responds with an error message 404: Not Found for an invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=chickensandos")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/users/:username", () => {
  // happy path
  test("200: Responds with a user object which is found by username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user.username).toBe("butter_bridge");
        expect(user.name).toBe("jonny");
        expect(user.avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
  // sad path
  test("400: Responds with an error message 400: Bad Request when finding a user by an invalid username", () => {
    return request(app)
      .get("/api/users/900")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 400: Not Found when finding a user by a username that does not exist", () => {
    return request(app)
      .get("/api/users/7doublem")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  // happy path
  test("200: Responds with updated comment with updated votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -15 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.body).toBe(
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
        );
        expect(comment.votes).toBe(1);
        expect(comment.author).toBe("butter_bridge");
        expect(comment.created_at).toEqual(expect.any(String));
        expect(comment.comment_id).toEqual(expect.any(Number));
      });
  });
  //sad path
  test("400: Responds with an error message 400: Bad Request for an incorrect comment_id", () => {
    return request(app)
      .patch("/api/comments/notaroute")
      .send({ inc_votes: -15 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid comment_id that doesn't exist", () => {
    return request(app)
      .patch("/api/comments/99999")
      .send({ inc_votes: -15 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: Responds with an error message 400: Bad Request for request body that is missing the required fields", () => {
    return request(app)
      .patch("/api/comments/4")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Responds with an error message 400: Bad Request for invalid data types in the request body", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: "one hundred" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
