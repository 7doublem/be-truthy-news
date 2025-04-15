const db = require("../connection");
const format = require("pg-format");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`CREATE TABLE topics (
        slug VARCHAR(10000) PRIMARY KEY UNIQUE,
        description VARCHAR(250) NOT NULL,
        img_url VARCHAR(1000) NOT NULL);`);
    })
    .then(() => {
      return db.query(`CREATE TABLE users (
        username VARCHAR(250) PRIMARY KEY UNIQUE,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(1000) NOT NULL);`);
    })
    .then(() => {
      return db.query(`CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(1000) NOT NULL,
      topic VARCHAR(1000) NOT NULL REFERENCES topics(slug),
      author VARCHAR(250) NOT NULL REFERENCES users(username),
      body text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      VOTES INT NOT NULL DEFAULT 0,
      article_img_url VARCHAR(1000) NOT NULL);`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT NOT NULL REFERENCES articles(article_id),
      body text NOT NULL,
      VOTES INT NOT NULL DEFAULT 0,
      author VARCHAR(250) NOT NULL REFERENCES users(username),
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
    })
    .then(() => {
      const formattedTopics = topicData.map((topic) => {
        return [topic.description, topic.slug, topic.img_url];
      });
      //console.log(formattedTopics);
      const insertedTopics = format(
        `INSERT INTO topics (description, slug, img_url) VALUES %L RETURNING *`,
        formattedTopics
      );

      return db.query(insertedTopics).then((resultInsertedTopics) => {
        //console.log(resultInsertedTopics);
      });
    })
    .then(() => {
      const formattedUsers = userData.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });
      //console.log(formattedUsers);
      const insertedUsers = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *`,
        formattedUsers
      );

      return db.query(insertedUsers).then((resultInsertedUsers) => {
        //console.log(resultInsertedUsers);
      });
    })
    .then(() => {
      const formattedArticles = articleData.map((article) => {
        return [
          article.title,
          article.topic,
          article.author,
          article.body,
          new Date(article.created_at * 100),
          article.votes,
          article.article_img_url,
        ];
      });
      console.log(formattedArticles);
      const insertedArticles = format(
        `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *`,
        formattedArticles
      );

      return db.query(insertedArticles).then((resultInsertedArticles) => {
        console.log(resultInsertedArticles);
      });
    })
    .then(() => {
      db.query(`SELECT article_id, title FROM articles;`).then(() => {});
    });
};
module.exports = seed;
