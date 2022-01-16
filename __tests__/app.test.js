const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app");
const e = require("express");

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

describe("/api/articles/:article_id", () => {
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
    test("status 404: responds with 'No article found with id: :id'", () => {
      return request(app)
        .get("/api/articles/1000")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No article found with id: 1000");
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
        })
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=3;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(1);
            });
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
        })
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=3;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(-100);
            });
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
        })
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=3;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(-100);
            });
        });
    });
    test("status 404: responds with 'Path not found'", () => {
      return request(app)
        .patch("/api/arts/1")
        .send({ inc_votes: -100 })
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Path not found"))
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=1;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(100);
            });
        });
    });
    test("status 404: responds with 'No article found, cannot update votes'", () => {
      return request(app)
        .patch("/api/articles/2607")
        .send({ inc_votes: -100 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No article found, cannot update votes");
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
        .patch("/api/articles/1")
        .send({ inc_votes: "banana" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        })
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=1;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(100);
            });
        });
    });
    test("status 400: responds with 'Bad request, must have inc_votes' when object on body doesn't include inc_votes", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ name: "steve" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, must have inc_votes");
        })
        .then(() => {
          return db
            .query(`SELECT votes FROM articles WHERE article_id=3;`)
            .then(({ rows }) => {
              expect(rows[0].votes).toBe(0);
            });
        });
    });
  });
});

describe("GET /api/articles", () => {
  describe("sort_by queries", () => {
    test("status 200: responds with object with key of articles and an array of articles, sorted by date by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
          articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String),
              })
            );
          });
        });
    });
    test("status 200: articles are sorted by article_id", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("article_id", { descending: true });
        });
    });
    test("status 200: articles are sorted by author", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("status 200: articles are sorted by title", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("status 200: articles are sorted by topic", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("topic", { descending: true });
        });
    });
    test("status 200: articles are sorted by votes", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("votes", { descending: true });
        });
    });
    test("status 200: articles are sorted by comment_count", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("comment_count", {
            descending: true,
            coerce: true,
          });
        });
    });
    test("status 200: articles are sorted by created_at", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status 404: responds with 'Path not found'", () => {
      return request(app)
        .get("/api/artsi?sort_by=created_at")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
    });
    test("status 400: responds with 'Invalid sort_by query'", () => {
      return request(app)
        .get("/api/articles?sort_by=fake_news")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Invalid sort_by query"));
    });
  });
  describe("order queries", () => {
    test("status 200: articles with no query in descending order, sorted by date by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status 200: where query order=desc specified, articles sorted by date, descending", () => {
      return request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status 200: where query order=asc specified, articles sorted by date, ascending", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("status 400: responds with 'Invalid order query'", () => {
      return request(app)
        .get("/api/articles?order=big-to-small")
        .expect(400)
        .then(({ body: { msg } }) => expect(msg).toBe("Invalid order query"));
    });
  });
  describe("filter by topic query", () => {
    test("status 200: where query value topic 'mitch' exists, return a filtered by topic, sorted by date, desc", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status 200: where query value topic 'cats' exists, return a filtered by topic, sorted by date, desc", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(1);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status 200: where query value topic 'paper' exists but no articles have it, return an empty array", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(0);
        });
    });
    test("status 404: responds with 'Invalid topic query'", () => {
      return request(app)
        .get("/api/articles?topic=lawnmowers")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Topic doesn't exist"));
    });
  });
  describe("limit query", () => {
    test("status 200, defaults to 10 articles, responds with an array of 10 article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
        });
    });
    test("status 200, returns array of articles, the amount equal to limit", () => {
      return request(app)
        .get("/api/articles?limit=8")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(8);
        })
        .then(() => {
          return db.query(`SELECT * FROM articles;`).then(({ rows }) => {
            expect(rows.length).toBe(12);
          });
        });
    });
    test("status 200, returns array of all articles, when limit > the number of articles", () => {
      return request(app)
        .get("/api/articles?limit=200")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(12);
        });
    });
    test("status 400, returns 'Bad request, please enter a valid limit' when given anything other than an int", () => {
      return request(app)
        .get("/api/articles?limit=5.3")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, please enter a valid limit");
        });
    });
    test("status 400, returns 'Bad request, please enter a valid limit' when given anything other than an int", () => {
      return request(app)
        .get("/api/articles?limit=-53")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, please enter a valid limit");
        });
    });
    test("status 400, returns 'Bad request, please enter a valid limit' when given anything other than an int", () => {
      return request(app)
        .get("/api/articles?limit=banana")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, please enter a valid limit");
        });
    });
  });
  describe("page query", () => {
    test("status 200, p defaults to first page", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(10);
          expect(articles[0]).toEqual(
            expect.objectContaining({
              article_id: 3,
              author: "icellusedkars",
              comment_count: "2",
              created_at: "2020-11-03T09:12:00.000Z",
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              votes: 0,
            })
          );
        });
    });
    test("status 200, returns array of length 4, elements selected using queries", () => {
      return request(app)
        .get("/api/articles?p=2&limit=4")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(4);
          expect(articles[0]).toMatchObject({
            article_id: 5,
            author: "rogersop",
            comment_count: "2",
            created_at: expect.any(String),
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            total_count: 12,
            votes: 0,
          });
          expect(articles[3]).toMatchObject({
            article_id: 10,
            author: "rogersop",
            comment_count: "0",
            created_at: expect.any(String),
            title: "Seven inspirational thought leaders from Manchester UK",
            topic: "mitch",
            total_count: 12,
            votes: 0,
          });
        });
    });

    test("status 200, returns array of length 2, last page size is less than limit", () => {
      return request(app)
        .get("/api/articles?p=2&limit=10")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(2);
          expect(articles[0]).toEqual(
            expect.objectContaining({
              author: "icellusedkars",
              title: "Am I a cat?",
              article_id: 11,
              topic: "mitch",
              created_at: "2020-01-15T22:21:00.000Z",
              votes: 0,
              comment_count: "0",
            })
          );
          expect(articles[1]).toEqual(
            expect.objectContaining({
              author: "icellusedkars",
              title: "Z",
              article_id: 7,
              topic: "mitch",
              created_at: "2020-01-07T14:08:00.000Z",
              votes: 0,
              comment_count: "0",
            })
          );
        });
    });
    test("status 200, only page query, no limit provided returns array of length 2", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(2);
          expect(articles[0]).toEqual(
            expect.objectContaining({
              author: "icellusedkars",
              title: "Am I a cat?",
              article_id: 11,
              topic: "mitch",
              created_at: "2020-01-15T22:21:00.000Z",
              votes: 0,
              comment_count: "0",
            })
          );
        });
    });

    test("status 400, returns 'Bad request, please enter valid page number' when given anything other than an int", () => {
      return request(app)
        .get("/api/articles?p=5.3")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, please enter valid page number");
        });
    });
  });

  describe("add a total count properties to articles", () => {
    test("status 200: articles has a total count  property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles).toHaveLength(10);
          expect(body.articles[0].total_count).toBe(12);
        });
    });
    test("status 200, page 2 of 12 results is array of 2, total_count is 12", () => {
      return request(app)
        .get("/api/articles?p=2&limit=10")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(2);
          expect(articles[0]).toHaveProperty("total_count", 12);
        });
    });
    test("status 200:  query search with topic 'mitch', page and limit", () => {
      return request(app)
        .get("/api/articles?topic=mitch&p=1&limit=4")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(Array.isArray(articles)).toBe(true);
          expect(articles).toHaveLength(4);
          expect(articles[0]).toHaveProperty("total_count", 11);
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET /api/articles/:article_id/comments", () => {
    test("status 200: responds with object comments: array of comments of the given article_id, newest first", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(Array.isArray(comments)).toBe(true);
          expect(comments).toHaveLength(2);

          expect(comments[0]).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: "butter_bridge",
              body: expect.any(String),
            })
          );
        });
    });
    test("status 200: responds with an object with key comments and value of an empty array when an article has no comments", () => {
      return request(app)
        .get("/api/articles/4/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(Array.isArray(comments)).toBe(true);
          expect(comments).toHaveLength(0);
        });
    });
    test("status 404: responds with 'Path not found'", () => {
      return request(app)
        .get("/api/articles/2/comme")
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
    });
    test("status 404: responds with 'No article found for: :id'", () => {
      return request(app)
        .get("/api/articles/1000/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No article found with id: 1000");
        });
    });
    test("status 400: responds with 'Bad request'", () => {
      return request(app)
        .get("/api/articles/not-an-article/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    describe("p and limit query", () => {
      test("status 200, returns array of length 3, using pagination queries", () => {
        return request(app)
          .get("/api/articles/1/comments?p=3&limit=4")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(Array.isArray(comments)).toBe(true);
            expect(comments).toHaveLength(3);
            comments.forEach((comment) => {
              expect(comment).toEqual(
                expect.objectContaining({
                  comment_id: expect.any(Number),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                })
              );
            });
          });
      });
      test("status 200, returns array of length 10, with/out queries, default values used", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(Array.isArray(comments)).toBe(true);
            expect(comments).toHaveLength(10);
            expect(comments[0]).toEqual(
              expect.objectContaining({
                comment_id: 5,
                votes: 0,
                created_at: expect.any(String),
                author: "icellusedkars",
                body: expect.any(String),
              })
            );
          });
      });
      test("status 400, returns 'Bad request, please enter valid page number' when given anything other than an int", () => {
        return request(app)
          .get("/api/articles/1/comments?p=5.3")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request, please enter valid page number");
          });
      });
      test("status 400, returns 'Bad request, please enter a valid limit' when given anything other than an int", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=5.3")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request, please enter a valid limit");
          });
      });
    });
  });

  describe("POST /api/articles/:article_id/comments", () => {
    test("status 201, responds with the posted comment taken from req body", () => {
      return request(app)
        .post("/api/articles/5/comments")
        .send({ username: "butter_bridge", body: "love this article!" })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: 19,
              votes: 0,
              created_at: expect.any(String),
              author: "butter_bridge",
              body: "love this article!",
            })
          );
        })
        .then(() => {
          return db
            .query(`SELECT * FROM comments WHERE article_id=5;`)
            .then(({ rows }) => {
              expect(rows.length).toBe(3);
            });
        });
    });
    test("status 201, responds with the posted comment for an article with no comments", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ username: "butter_bridge", body: "love this article!" })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: 19,
              votes: 0,
              created_at: expect.any(String),
              author: "butter_bridge",
              body: "love this article!",
            })
          );
        });
    });
    test("status 201, responds with the posted comment for an article when body isn't given as a string", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ username: "butter_bridge", body: true })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: 19,
              votes: 0,
              created_at: expect.any(String),
              author: "butter_bridge",
              body: "true",
            })
          );
        });
    });
    test("status 201, ignores unnecessary properties + responds with the posted comment", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({
          username: "butter_bridge",
          body: "love this article!",
          fruit: "banana",
        })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: 19,
              votes: 0,
              created_at: expect.any(String),
              author: "butter_bridge",
              body: "love this article!",
            })
          );
          expect(comment).not.toHaveProperty("fruit", "banana");
        });
    });

    test("status 404: responds with 'Path not found'", () => {
      return request(app)
        .post("/api/articles/2/comms")
        .send({ username: "butter_bridge", body: "love this article!" })
        .expect(404)
        .then(({ body: { msg } }) => expect(msg).toBe("Path not found"))
        .then(() => {
          return db
            .query(`SELECT exists(SELECT 1 FROM comments where article_id=2);`)
            .then(({ rows }) => {
              expect(rows[0].exists).toBe(false);
            });
        });
    });
    test("status 404: responds with 'No article found with id: :id'", () => {
      return request(app)
        .post("/api/articles/2607/comments")
        .send({ username: "butter_bridge", body: "love this article!" })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No article found with id: 2607");
        })
        .then(() => {
          return db
            .query(
              `SELECT exists(SELECT 1 FROM comments where article_id=2607);`
            )
            .then(({ rows }) => {
              expect(rows[0].exists).toBe(false);
            });
        });
    });
    test("status 404: responds with 'username does not exist'", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ username: "nonexistent-user", body: "love this article!" })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No user exists for username: nonexistent-user");
        });
    });
    test("status 400: responds with 'Bad request' when article_id is incorrect datatype", () => {
      return request(app)
        .post("/api/articles/not_an_id/comments")
        .send({ username: "butter_bridge", body: "love this article!" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("status 400: responds with 'Bad request, must include a comment' when object on body doesn't include body", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ username: "butter_bridge" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, must include a comment");
        })
        .then(() => {
          return db
            .query(`SELECT exists(SELECT 1 FROM comments where article_id=2);`)
            .then(({ rows }) => {
              expect(rows[0].exists).toBe(false);
            });
        });
    });
    test("status 400: responds with 'Bad request, must include a comment' when object on body when body is an empty string", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ username: "butter_bridge", body: "" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, must include a comment");
        })
        .then(() => {
          return db
            .query(
              `SELECT exists(SELECT 1 FROM comments where article_id=2607);`
            )
            .then(({ rows }) => {
              expect(rows[0].exists).toBe(false);
            });
        });
    });
    test("status 400: responds with 'Bad request, must have a username' when no username given", () => {
      return request(app)
        .post("/api/articles/2/comments")
        .send({ body: "hello" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request, must have a username");
        })
        .then(() => {
          return db
            .query(
              `SELECT exists(SELECT 1 FROM comments where article_id=2607);`
            )
            .then(({ rows }) => {
              expect(rows[0].exists).toBe(false);
            });
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("status 204: no content returned", () => {
    return request(app)
      .delete("/api/comments/6")
      .expect(204)
      .then(() => {
        return db
          .query(`SELECT exists(SELECT 1 FROM comments where comment_id=6);`)
          .then(({ rows }) => {
            expect(rows[0].exists).toBe(false);
          });
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .delete("/api/commes/4")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"))
      .then(() => {
        return db
          .query(`SELECT exists(SELECT 1 FROM comments where comment_id=4);`)
          .then(({ rows }) => {
            expect(rows[0].exists).toBe(true);
          });
      });
  });
  test("status 404: responds with 'No article found for article_id: :article_id, cannot update votes'", () => {
    return request(app)
      .delete("/api/comments/2607")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No comment found for comment_id: 2607");
      });
  });

  test("status 400: 'Bad request'", () => {
    return request(app)
      .delete("/api/comments/not-an-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status 400: 'Bad request'", () => {
    return request(app)
      .delete("/api/comments/3.2")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api", () => {
  test("status 200, responds with json object of all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ text }) => {
        expect(typeof text).toBe("string");
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .get("/ap")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
  });
});

describe("GET /api/users", () => {
  test("status 200, responds with an array of objects {username: 'username'} no name or avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
            })
          );
        });
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .get("/api/us")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
  });
});

describe("GET /api/users/:username", () => {
  test("status 200, responds with a user object with properties username, avatar_url and name", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual(
          expect.objectContaining({
            username: "lurker",
            name: "do_nothing",
            avatar_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          })
        );
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .get("/api/user/lurker")
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"));
  });
  test("status 404: responds with 'No user exists for username: :username'", () => {
    return request(app)
      .get("/api/users/1amJonSn0w")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No user exists for username: 1amJonSn0w");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("status 200, responds with updated comment when req body given a valid inc_votes int", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: 3,
            body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
            votes: 101,
            author: "icellusedkars",
            article_id: 1,
            created_at: expect.any(String),
          })
        );
      })
      .then(() => {
        return db
          .query(`SELECT * FROM comments WHERE comment_id=3;`)
          .then(({ rows }) => {
            expect(rows[0].votes).toBe(101);
          });
      });
  });
  test("status 200: responds with updated article if votes is a num and ignores any extra info on the request object", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ dont_use_this: "but still update votes", inc_votes: -100 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: 3,
            body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
            votes: 0,
            author: "icellusedkars",
            article_id: 1,
            created_at: expect.any(String),
          })
        );
      })
      .then(() => {
        return db
          .query(`SELECT * FROM comments WHERE comment_id=3;`)
          .then(({ rows }) => {
            expect(rows[0].votes).toBe(0);
          });
      });
  });
  test("status 404: responds with 'Path not found'", () => {
    return request(app)
      .patch("/api/comms/1")
      .send({ inc_votes: -100 })
      .expect(404)
      .then(({ body: { msg } }) => expect(msg).toBe("Path not found"))
      .then(() => {
        return db
          .query(`SELECT votes FROM comments WHERE comment_id=1;`)
          .then(({ rows }) => {
            expect(rows[0].votes).toBe(16);
          });
      });
  });
  test("status 404: responds with 'No comment found for comment_id: :comment_id'", () => {
    return request(app)
      .patch("/api/comments/2607")
      .send({ inc_votes: -100 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No comment found for comment_id: 2607");
      });
  });
  test("status 400: responds with 'Bad request'", () => {
    return request(app)
      .patch("/api/comments/not_an_id")
      .send({ inc_votes: 4 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status 400: responds with 'Bad request' when inc_votes invalid datatype", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1.1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      })
      .then(() => {
        return db
          .query(`SELECT votes FROM comments WHERE comment_id=1;`)
          .then(({ rows }) => {
            expect(rows[0].votes).toBe(16);
          });
      });
  });
  test("status 400: responds with 'Bad request, must have inc_votes' when object on body doesn't include inc_votes", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({ name: "steve" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request, must have inc_votes");
      })
      .then(() => {
        return db
          .query(`SELECT votes FROM comments WHERE comment_id=3;`)
          .then(({ rows }) => {
            expect(rows[0].votes).toBe(100);
          });
      });
  });
});
