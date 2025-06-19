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