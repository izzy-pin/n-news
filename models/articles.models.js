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
  l = 10,
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
  //not sure about this syntax???
  // pagination to do!!
  return Promise.all([topicsCheck]).then(() => {
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
      const len = results.rows.length;

      // calc limit
      const numRegEx = /\D/;

      if (numRegEx.test(l)) {
        return Promise.reject({
          status: 400,
          msg: "Bad request, please enter a positive whole number",
        });
      }

      if (numRegEx.test(p)) {
        return Promise.reject({
          status: 400,
          msg: "Bad request, please enter valid page number",
        });
      }
      // calc p using limit
      const limit = parseInt(l);
      const page = parseInt(p);
      const start = page === 0 || page === 1 ? 0 : (page - 1) * limit;
      if (len > 0 && page >= len) {
        return Promise.reject({
          status: 400,
          msg: "Bad request, page number too high",
        });
      }
      const end = limit > len || start + limit > len ? len : start + limit;
      const articles = results.rows.slice(start, end);
      return { articles, total_count: len };
    });
  });
};
