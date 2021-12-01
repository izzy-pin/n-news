const db = require("../db/connection");

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
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: `No article found for article_id: ${id}`,
        });
      }
      return article;
    });
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

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
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

  return db.query(articlesQueryString).then((results) => results.rows);
};
