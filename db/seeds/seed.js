const db = require("../connection");
const format = require("pg-format");

const seed = (data) => {
  const { articleData, commentData, topicData, userData } = data;
  // 1. create tables
  // turn this into async await?
  console.log(
    `Seeding db: ${process.env.PGDATABASE} \n Current node_env: ${process.env.NODE_ENV}`
  );

  return (
    db
      .query(`DROP TABLE IF EXISTS comments;`)
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS articles;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS topics;`);
      })
      // now can create the tables
      .then(() => {
        return db.query(` CREATE TABLE topics (
        slug VARCHAR(50) PRIMARY KEY,
        description TEXT NOT NULL
      );`);
      })
      .then(() => {
        return db.query(` CREATE TABLE users (
          username VARCHAR(100) PRIMARY KEY,
          avatar_url TEXT NOT NULL,
          name VARCHAR(50) NOT NULL
        );`);
      })
      .then(() => {
        return db.query(` CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          topic VARCHAR(50) REFERENCES topics(slug),
          author VARCHAR(100) REFERENCES users(username),
          created_at TIMESTAMP DEFAULT current_timestamp
        );`);
      })
      .then(() => {
        return db.query(` CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          author VARCHAR(100) REFERENCES users(username),
          article_id INT REFERENCES articles(article_id),
          votes INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT current_timestamp,
          body TEXT NOT NULL
        );`);
      })
      // 2. insert data
      .then(() => {
        const topicsInfo = topicData.map((topic) => {
          return [topic.slug, topic.description];
        });
        const topicsQueryStr = format(
          `INSERT INTO topics
    (slug, description)
    VALUES
    %L
    RETURNING *;`,
          topicsInfo
        );
        return db.query(topicsQueryStr);
      })
      // .then((topicsResult) => {
      //   console.log(topicsResult.rows);
      // })
      .then(() => {
        const usersInfo = userData.map((user) => {
          return [user.username, user.avatar_url, user.name];
        });
        const usersQueryStr = format(
          `INSERT INTO users
          (username, avatar_url, name)
          VALUES
          %L
          RETURNING *;`,
          usersInfo
        );
        return db.query(usersQueryStr);
      })
      .then(() => {
        const articlesInfo = articleData.map((article) => {
          return [
            article.title,
            article.body,
            article.votes,
            article.topic,
            article.author,
            article.created_at,
          ];
        });
        const articlesQueryStr = format(
          `INSERT INTO articles 
            (title, body, votes, topic, author, created_at)
            VALUES
            %L
            RETURNING *`,
          articlesInfo
        );
        return db.query(articlesQueryStr);
      })
      .then(() => {
        const commentsInfo = commentData.map((comment) => {
          return [
            comment.author,
            comment.article_id,
            comment.votes,
            comment.created_at,
            comment.body,
          ];
        });
        const commentsQueryStr = format(
          `INSERT INTO comments
          (author, article_id, votes, created_at, body)
          VALUES
          %L
          RETURNING *;`,
          commentsInfo
        );
        return db.query(commentsQueryStr);
      })
  );
};

module.exports = seed;
