const db = require("../db/connection");
const { checkUsernameExists } = require("./users.models");

exports.checkArticleExists = (id) => {
  const numRegEx = /\D/;
  if (numRegEx.test(id)) {
    return Promise.reject({
      status: 400,
      msg: `Bad request`,
    });
  }

  return db
    .query(
      `SELECT * FROM articles WHERE article_id = $1
    `,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No article found with id: ${id}`,
        });
      }
    });
};

exports.selectArticleById = (id) => {
  return db
    .query(
      `
      SELECT articles.*, COUNT(comments.article_id) AS comment_count 
      FROM articles 
      LEFT JOIN comments 
      ON comments.article_id = articles.article_id 
      WHERE articles.article_id = $1 
      GROUP BY articles.article_id;`,
      [id]
    )
    .then((result) => result.rows[0]);
};

exports.updateArticleByArticleId = (inc_votes, id) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: `Bad request, must have inc_votes`,
    });
  }
  return db
    .query(
      `
  UPDATE articles SET votes = votes + $1
  WHERE article_id = $2 RETURNING votes;`,
      [inc_votes, id]
    )
    .then((votes) => {
      const voteTotal = votes.rows[0];
      if (!voteTotal) {
        return Promise.reject({
          status: 404,
          msg: `No article found, cannot update votes`,
        });
      }
    });
};

exports.selectArticles = (
  author,
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 0
) => {
  if (
    ![
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "comment_count",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let topicsCheck;
  let authorCheck;
  if (topic) {
    topicsCheck = db
      .query(
        `
      SELECT ARRAY_AGG(slug) topics FROM topics;`
      )
      .then((results) => {
        const validTopics = results.rows[0].topics;
        if (!validTopics.includes(topic)) {
          return Promise.reject({ status: 404, msg: "Topic doesn't exist" });
        }
      });
  }

  if (author) {
    authorCheck = checkUsernameExists(author);
  }

  return Promise.all([topicsCheck, authorCheck]).then(() => {
    let articlesQueryString = `
  SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, COUNT(comments.article_id) AS comment_count, COUNT(*) OVER ()::int AS total_count 
  FROM articles 
  LEFT JOIN comments 
  ON comments.article_id = articles.article_id `;

    if (typeof topic === "string") {
      articlesQueryString += `WHERE articles.topic = '${topic}' `;
    }

    // for now can only use WHERE for either topic OR author
    if (typeof author === "string") {
      articlesQueryString += `WHERE articles.author = '${author}' `;
    }

    articlesQueryString += `GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order} `;

    const numRegEx = /\D/;

    if (numRegEx.test(limit)) {
      return Promise.reject({
        status: 400,
        msg: "Bad request, please enter a valid limit",
      });
    }

    if (numRegEx.test(p)) {
      return Promise.reject({
        status: 400,
        msg: "Bad request, please enter valid page number",
      });
    }

    const start = p === 0 || p === 1 ? 0 : (p - 1) * limit;

    articlesQueryString += `LIMIT ${limit} OFFSET ${start};`;

    return db.query(articlesQueryString).then((results) => {
      return { articles: results.rows };
    });
  });
};

exports.insertArticle = (title, body, topic, author) => {
  if (!title || !body || !topic || !author) {
    return Promise.reject({
      status: 400,
      msg: "Bad request, no empty or missing parameters",
    });
  }

  return db
    .query(
      `INSERT INTO articles (title, body, topic, author)
    VALUES ($1, $2, $3, $4) RETURNING article_id`,
      [title, body, topic, author]
    )
    .then((result) => {
      return db.query(
        `
      SELECT articles.*, COUNT(comments.article_id) AS comment_count 
      FROM articles 
      LEFT JOIN comments 
      ON comments.article_id = articles.article_id 
      WHERE articles.article_id = $1 
      GROUP BY articles.article_id;`,
        [result.rows[0].article_id]
      );
    })
    .then((results) => {
      return { article: results.rows[0] };
    });
};

exports.removeArticleById = (id) => {
  return db.query(
    `DELETE FROM articles 
    WHERE article_id = $1
    RETURNING *`,
    [id]
  );
};
