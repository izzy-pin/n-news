const db = require("../db/connection");

exports.checkCommentExists = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE comment_id = $1
    `,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No comment found for comment_id: ${id}`,
        });
      }
    });
};

exports.selectCommentsByArticleId = (
  id,
  sort_by = "created_at",
  order = "desc",
  p = 0,
  limit = 10
) => {
  if (!["created_at", "votes"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

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

  let commentsQueryString = `SELECT comment_id, votes, created_at, body, author 
  FROM comments 
  WHERE article_id = ${id}
  GROUP BY comment_id 
  ORDER BY ${sort_by} ${order} 
  LIMIT ${limit} OFFSET ${start};`;

  return db.query(commentsQueryString).then((results) => {
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

exports.removeCommentById = (id) => {
  return db.query(
    `
  DELETE FROM comments WHERE comment_id = $1 RETURNING *;
  `,
    [id]
  );
};

exports.updateCommentByCommentId = (id, votes) => {
  if (!votes) {
    return Promise.reject({
      status: 400,
      msg: "Bad request, must have inc_votes",
    });
  }
  return db
    .query(
      `
  UPDATE comments SET votes = votes + $1
  WHERE comment_id = $2 RETURNING votes;`,
      [votes, id]
    )
    .then((votes) => {});
};

exports.selectCommentByCommentId = (id) => {
  return db
    .query(
      `SELECT * 
        FROM comments 
        WHERE comment_id = $1;`,
      [id]
    )
    .then((results) => {
      return results.rows[0];
    });
};
