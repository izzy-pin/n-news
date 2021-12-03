const db = require("../db/connection");

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
  if (
    !["butter_bridge", "icellusedkars", "rogersop", "lurker"].includes(username)
  ) {
    return Promise.reject({
      status: 404,
      msg: `No user exists for username: ${username}`,
    });
  }

  return db
    .query(
      `
    SELECT * FROM users WHERE username = $1;
    `,
      [username]
    )
    .then((result) => result.rows[0]);
};
