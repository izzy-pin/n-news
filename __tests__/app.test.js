const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("status 200: responds with object containing all 3 topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body.topics)).toBe(true);
        expect(res.body.topics).toHaveLength(3);
        res.body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
  test("status 404: responds with 'path not found'", () => {
    return request(app)
      .get("/api/top")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
  });
});

describe("GET /api/articles/:article_id", () => {
  test("status 200: responds with an article object", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: "icellusedkars",
            title: "Eight pug gifs that remind me of mitch",
            article_id: 3,
            body: "some gifs",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 0,
            comment_count: "2",
          })
        );
      });
  });
  test("status 200: responds with an article object when comment_count = 0", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: "icellusedkars",
            title: expect.any(String),
            article_id: 2,
            body: expect.any(String),
            topic: "mitch",
            created_at: expect.any(String),
            votes: 0,
            comment_count: "0",
          })
        );
      });
  });
});
