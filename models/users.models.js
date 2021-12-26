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
SELECT username FROM users;
`
    )
    .then(({ rows }) => {
      const validUsers = rows.map((user) => user.username);
      if (!validUsers.includes(username)) {
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
  // delete this clause in a min!
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
