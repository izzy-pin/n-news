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
  test("status 404: responds with 'Path not found'", () => {
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
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .get("/api/artcles/2")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
  });
  test("status 404: responds with 'No article found for article_id: :article_id'", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No article found for article_id: 1000");
      });
  });
  test("status 400: responds with 'Bad request'", () => {
    return request(app)
      .get("/api/articles/news")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status 200: responds with the updated article where votes is a +ve num", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: 1 })
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
            votes: 1,
            comment_count: "2",
          })
        );
      });
  });
  test("status 200: responds with the updated article where votes is a -ve num", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: -100 })
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
            votes: -100,
            comment_count: "2",
          })
        );
      });
  });
  test("status 200: responds with updated article if votes is a num and ignores any extra info on the request object", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ dont_use_this: "but still update votes", inc_votes: -100 })
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
            votes: -100,
            comment_count: "2",
          })
        );
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .patch("/api/arts/2")
      .send({ inc_votes: -100 })
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
    // do a SELECT statement here to check votes hasn't been updated?
  });
  test("status 404: responds with 'No article found for article_id: :article_id, cannot update votes'", () => {
    return request(app)
      .patch("/api/articles/2607")
      .send({ inc_votes: -100 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          "No article found for article_id: 2607, cannot update votes"
        );
      });
  });
  test("status 400: responds with 'Bad request'", () => {
    return request(app)
      .patch("/api/articles/not_an_id")
      .send({ inc_votes: 4 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status 400: responds with 'Bad request' when inc_votes invalid datatype", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status 400: responds with 'Bad request, must have inc_votes' when object on body doesn't include inc_votes", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ name: "steve" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request, must have inc_votes");
      });
  });
});
