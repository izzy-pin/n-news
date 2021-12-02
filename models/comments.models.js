const db = require("../db/connection");

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT comment_id, votes, created_at, body, author 
        FROM comments 
        WHERE article_id = $1
        GROUP BY comment_id;`,
      [id]
    )
    .then((results) => {
      return results.rows;
    });
};

exports.insertCommentForArticleId = (username, body, id) => {
  if (!body) {
    return Promise.reject({
      status: 400,
      msg: `Bad request, must include a comment`,
    });
  }

  if (!username) {
    return Promise.reject({
      status: 400,
      msg: `Bad request, must have a username`,
    });
  }

  return db
    .query(
      `
  INSERT INTO comments (author, article_id, body)
  VALUES ($1, $2, $3) RETURNING *;
  `,
      [username, id, body]
    )
    .then((result) => {
      return result.rows[0];
    });
};
