const { articleData } = require("../db/data/test-data");
const {
  convertTimestampToDate,
  createReference,
  checkExists,
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createReference", () => {
  test("should return an empty object when passed an empty array", () => {
    const input = [];
    const result = createReference(input);
    expect(result).toEqual({});
    expect(result).toBeObject();
  });
  test("should return an object with 1 article title and corresponding article id when passed an array with a single object", () => {
    const input = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      },
    ];
    const result = createReference(input);
    expect(result).toEqual({ "Living in the shadow of a great man": 1 });
    expect(result).toBeObject();
  });
  test("should return an object with multiple article titles and corresponding article ids when passed an array with multiple objects", () => {
    const input = [
      {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: "2020-11-03T09:12:00.000Z",
        votes: 0,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      },
      {
        article_id: 4,
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: "2020-05-06T01:14:00.000Z",
        votes: 0,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      },
    ];
    const result = createReference(input);
    expect(result).toEqual({
      "Eight pug gifs that remind me of mitch": 3,
      "Student SUES Mitch!": 4,
    });
    expect(result).toBeObject();
  });
  test("should return an object with article titles and corresponding ids when passed a nested array containing article data", () => {
    const input = articleData;
    const result = createReference(input);
    expect(result).toEqual({
      [articleData[0].title]: articleData[0].article_id,
    });
    expect(result).toBeObject();
  });
});

describe("checkExists", () => {
  test("Returns true when topic exists in the topics table", () => {
    return checkExists("topics", "slug", "cats").then((result) => {
      expect(result).toBe(true);
    });
  });
  test("Rejects when the topic doesn't exist in the topics table", () => {
    return checkExists("topics", "slug", "faketopic").catch((err) => {
      expect(err).toEqual({ status: 404, msg: "Not Found" });
    });
  });
});
