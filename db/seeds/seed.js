const db = require('../connection');
const format = require('pg-format');
const {
  convertTimestampToDate,
  createReference,
} = require('../../app/utils/databaseHelpers');

// seeds the database with provided topic, user, article, and comment data
const seed = ({ topicData, userData, articleData, commentData }) => {
  // drops tables in order to avoid foreign key conflicts
  return (
    db
      .query('DROP TABLE IF EXISTS comments;')
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS articles;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS topics;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users;`);
      })
      // creates topics table
      .then(() => {
        return db.query(`CREATE TABLE topics (
        slug VARCHAR(10000) PRIMARY KEY UNIQUE,
        description VARCHAR(250) NOT NULL,
        img_url VARCHAR(1000) NOT NULL);`);
      })
      // creates users table
      .then(() => {
        return db.query(`CREATE TABLE users (
        username VARCHAR(250) PRIMARY KEY UNIQUE,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(1000) NOT NULL);`);
      })
      // creates articles table with foreign keys to topics and users
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
      // creates comments table with foreign keys to articles and users
      .then(() => {
        return db.query(`CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT NOT NULL REFERENCES articles(article_id),
      body text NOT NULL,
      VOTES INT NOT NULL DEFAULT 0,
      author VARCHAR(250) NOT NULL REFERENCES users(username),
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
      })
      // inserts topic data into topics table
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
      // inserts user data into users table
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
      // inserts article data into articles table, converting timestamps
      .then(() => {
        const formattedArticles = articleData.map((article) => {
          const convertedArticle = convertTimestampToDate(article);
          return [
            convertedArticle.title,
            convertedArticle.topic,
            convertedArticle.author,
            convertedArticle.body,
            convertedArticle.created_at,
            convertedArticle.votes,
            convertedArticle.article_img_url,
          ];
        });
        const insertedArticles = format(
          `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *`,
          formattedArticles
        );

        return db.query(insertedArticles);
      })
      // inserts comment data into comments table, mapping article titles to IDs
      .then((resultInsertedArticles) => {
        const articlesRefObject = createReference(resultInsertedArticles.rows);
        const formattedComments = commentData.map((comment) => {
          const convertedComments = convertTimestampToDate(comment);
          return [
            articlesRefObject[convertedComments.article_title],
            convertedComments.body,
            convertedComments.votes,
            convertedComments.author,
            convertedComments.created_at,
          ];
        });
        const insertedComments = format(
          `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L RETURNING *`,
          formattedComments
        );

        return db.query(insertedComments).then((resultInsertedComments) => {
          //console.log(resultInsertedComments);
        });
      })
  );
};
module.exports = seed;
