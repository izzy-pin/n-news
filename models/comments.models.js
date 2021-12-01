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
    .then((results) => results.rows);
};
