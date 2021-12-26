const db = require("../connection");
const format = require("pg-format");

const seed = (data) => {
  const { articleData, commentData, topicData, userData } = data;

  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => db.query(`DROP TABLE IF EXISTS articles;`))
    .then(() => db.query(`DROP TABLE IF EXISTS users;`))
    .then(() => db.query(`DROP TABLE IF EXISTS topics;`))
    .then(() => {
      const createTopicsTable = db.query(` 
        CREATE TABLE topics (
          slug VARCHAR(50) PRIMARY KEY,
          description TEXT
        );`);
      const createUsersTable = db.query(`
        CREATE TABLE users (
          username VARCHAR(100) PRIMARY KEY,
          avatar_url TEXT,
          name VARCHAR(50) NOT NULL
        );`);
      return Promise.all([createTopicsTable, createUsersTable]);
    })
    .then(() => {
      return db.query(` CREATE TABLE articles 
        (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          topic VARCHAR(50) REFERENCES topics(slug),
          author VARCHAR(100) REFERENCES users(username),
          created_at TIMESTAMP DEFAULT NOW()
        );`);
    })
    .then(() => {
      return db.query(` CREATE TABLE comments 
        (
          comment_id SERIAL PRIMARY KEY,
          author VARCHAR(100) REFERENCES users(username),
          article_id INT REFERENCES articles(article_id),
          votes INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          body TEXT NOT NULL
        );`);
    })
    .then(() => {
      const topicsQueryStr = format(
        `INSERT INTO topics
            (slug, description)
            VALUES
            %L
            RETURNING *;`,
        topicData.map((topic) => [topic.slug, topic.description])
      );

      const usersQueryStr = format(
        `INSERT INTO users
          (username, avatar_url, name)
          VALUES
          %L
          RETURNING *;`,
        userData.map((user) => [user.username, user.avatar_url, user.name])
      );

      const insertTopicsData = db.query(topicsQueryStr);
      const insertUsersData = db.query(usersQueryStr);
      return Promise.all([insertTopicsData, insertUsersData]);
    })
    .then(() => {
      const articlesQueryStr = format(
        `INSERT INTO articles 
            (title, body, votes, topic, author, created_at)
            VALUES
            %L
            RETURNING *`,
        articleData.map((article) => [
          article.title,
          article.body,
          article.votes,
          article.topic,
          article.author,
          article.created_at,
        ])
      );
      return db.query(articlesQueryStr);
    })
    .then(() => {
      const commentsQueryStr = format(
        `INSERT INTO comments
          (author, article_id, votes, created_at, body)
          VALUES
          %L
          RETURNING *;`,
        commentData.map((comment) => [
          comment.author,
          comment.article_id,
          comment.votes,
          comment.created_at,
          comment.body,
        ])
      );
      return db.query(commentsQueryStr);
    });
};

module.exports = seed;
