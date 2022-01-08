const db = require("../db/connection");

exports.checkUsernameExists = (username) => {
  if (!username) {
    return Promise.reject({
      status: 400,
      msg: `Bad request, must have a username`,
    });
  }

  return db
    .query(
      `
SELECT username FROM users WHERE username = $1;
`,
      [username]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No user exists for username: ${username}`,
        });
      }
    });
};

exports.selectUsers = () => {
  return db
    .query(
      `
  SELECT username FROM users;
  `
    )
    .then((results) => results.rows);
};

exports.selectUserByUsername = (username) => {
  return db
    .query(
      `
    SELECT * FROM users WHERE username = $1;
    `,
      [username]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No user exists for username: ${username}`,
        });
      } else {
        return result.rows[0];
      }
    });
};
