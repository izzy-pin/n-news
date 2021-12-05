const db = require("../db/connection");

exports.checkArticleExists = (id) => {
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
          msg: `No article found for article_id: ${id}`,
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
          msg: `No article found for article_id: ${id}, cannot update votes`,
        });
      }
    });
};

exports.selectArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10
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
  if (topic) {
    topicsCheck = db
      .query(
        `
      SELECT ARRAY_AGG(slug) topics FROM topics;`
      )
      .then((results) => {
        const validTopics = results.rows[0].topics;
        if (!validTopics.includes(topic)) {
          return Promise.reject({ status: 400, msg: "Invalid topic query" });
        }
      });
  }

  return Promise.all([sort_by, order, topic, topicsCheck]).then(
    ([sort_by, order, topic]) => {
      let articlesQueryString = `
  SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, COUNT(comments.article_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments 
  ON comments.article_id = articles.article_id `;

      if (typeof topic === "string") {
        articlesQueryString += `WHERE articles.topic = '${topic}' `;
      }

      articlesQueryString += `GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order};`;

      return db.query(articlesQueryString).then((results) => {
        limit = Math.round(limit);
        if (limit < 0) {
          limit = 0;
        }
        const regExp = /[^\d.-]/gi;
        if (regExp.test(limit)) {
          limit = 10;
        }
        return results.rows.slice(0, limit);
      });
    }
  );
};
