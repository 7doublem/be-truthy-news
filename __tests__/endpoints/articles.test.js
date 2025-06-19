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
        expect(articles.length).toBe(10);
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
        expect(comments.length).toBe(10);
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

describe("GET /api/articles (sorting queries)", () => {
  //happy path
  test("200: Responds with an array of articles sorted by created_at in descending order (default)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(10);
        expect(articles).toBeSorted("created_at", { descending: true });
      });
  });
  test("200: Responds with an array of articles sorted by comment count in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(10);
        expect(articles).toBeSorted("comment_count", { ascending: true });
      });
  });
  test("200: Responds with an array of articles sorted by votes in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(10);
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

describe("POST /api/articles", () => {
  // happy path
  test("201: Responds with newly posted article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "Cookies, so many types",
        body: "Cookies, the most scrumptious dessert there is. So many types, so many textures. I prefer the chewy and chocolately type cookies.",
        topic: "paper",
        article_img_url: "",
      })
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "butter_bridge",
          title: "Cookies, so many types",
          body: "Cookies, the most scrumptious dessert there is. So many types, so many textures. I prefer the chewy and chocolately type cookies.",
          topic: "paper",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          votes: 0,
          comment_count: 0,
        });
        expect(article.article_id).toEqual(expect.any(Number));
        expect(article.created_at).toEqual(expect.any(String));
      });
  });
  //sad path
  test("400: Responds with an error message 400: Bad Request for a request body that is missing one of the required fields", () => {
    return request(app)
      .post("/api/articles")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing one or more required fields");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid author that doesn't exist in the database", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "silly_username",
        title: "Cookies, so many types",
        body: "Cookies, the most scrumptious dessert there is. So many types, so many textures. I prefer the chewy and chocolately type cookies.",
        topic: "cooking",
        article_img_url: "",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Author Not Found");
      });
  });
  test("404: Responds with an error message 404: Not Found for a valid topic that doesn't exist in the database", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "Cookies, so many types",
        body: "Cookies, the most scrumptious dessert there is. So many types, so many textures. I prefer the chewy and chocolately type cookies.",
        topic: "cookies",
        article_img_url: "",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic Not Found");
      });
  });
  test("400: Responds with an error message 400: Bad Request for request body that has one or more invalid data types", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: 600,
        title: "Cookies, so many types",
        body: "Cookies, the most scrumptious dessert there is. So many types, so many textures. I prefer the chewy and chocolately type cookies.",
        topic: "cooking",
        article_img_url: "",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid data type for one or more fields");
      });
  });
});

describe("GET /api/articles (pagination)", () => {
  // happy path
  test("200: Returns 5 articles when limit = 5", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(5);
        expect(typeof body.total_count).toBe("number");
      });
  });
  test("200: Returns articles for page 2 when limit = 5 and p = 2", () => {
    return request(app)
      .get("/api/articles?limit=5&p=1")
      .then((page1Response) => {
        return request(app)
          .get("/api/articles?limit=5&p=2")
          .then((page2Response) => {
            expect(page1Response.status).toBe(200);
            expect(page2Response.status).toBe(200);
            expect(page2Response.body.articles[0].article_id).toBe(
              page1Response.body.articles[5]?.article_id ||
                page2Response.body.articles[0].article_id
            );
          });
      });
  });
  test("200: total_count is the same regardless of pagination", () => {
    return request(app)
      .get("/api/articles?limit=2&p=1")
      .then((res1) => {
        return request(app)
          .get("/api/articles?limit=2&p=2")
          .then((res2) => {
            expect(res1.body.total_count).toBe(res2.body.total_count);
          });
      });
  });
  // sad path
  test("400: returns error for invalid limit", () => {
    return request(app)
      .get("/api/articles?limit=notanumber")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Invalid Limit or Page Number");
      });
  });
  test("400: returns error for invalid page", () => {
    return request(app)
      .get("/api/articles?p=-1")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Invalid Limit or Page Number");
      });
  });
  test("200: returns empty array if page is beyond available articles", () => {
    return request(app)
      .get("/api/articles?limit=10&p=999")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
        expect(typeof res.body.total_count).toBe("number");
      });
  });
});

describe("GET /api/articles/:article_id/comments (pagination)", () => {
  // happy path
  test("200: Returns 5 comments when limit = 5", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(5);
      });
  });
  test("200: Returns comments for page 2 when limit = 5 and p = 2", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=1")
      .then((page1Response) => {
        return request(app)
          .get("/api/articles/1/comments?limit=5&p=2")
          .then((page2Response) => {
            expect(page1Response.status).toBe(200);
            expect(page2Response.status).toBe(200);
            expect(page2Response.body.comments[0].comment_id).toBe(
              page1Response.body.comments[5]?.comment_id ||
                page2Response.body.comments[0].comment_id
            );
          });
      });
  });
  test("200: total_count is the same regardless of pagination", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=2&p=1")
      .then((res1) => {
        return request(app)
          .get("/api/articles/1/comments?limit=2&p=2")
          .then((res2) => {
            expect(res1.body.total_count).toBe(res2.body.total_count);
          });
      });
  });
  // sad path
  test("400: returns error for invalid limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=notanumber")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Invalid Limit or Page Number");
      });
  });
  test("400: returns error for invalid page", () => {
    return request(app)
      .get("/api/articles/1/comments?p=-1")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Invalid Limit or Page Number");
      });
  });
  test("200: returns empty array if page is beyond available articles", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=10&p=999")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.comments).toEqual([]);
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: deletes article by id", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });
  test("400: returns error for invalid article_id", () => {
    return request(app)
      .delete("/api/articles/notanumber")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404: returns error for valid article_id that does not exist", () => {
    return request(app)
      .delete("/api/articles/999")
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.msg).toBe(
          "Oops! That article could not be found. It might have been deleted or never existed"
        );
      });
  });
});
