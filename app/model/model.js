const db = require("../../db/connection");

const selectAllTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

const selectArticlesById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles 
        WHERE article_id = $1::int`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article Not Found`,
        });
      }
      const article = rows[0];
      return article;
    });
};

const selectAllArticles = () => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC`
    )
    .then(({ rows }) => {
      return rows;
    });
};

const selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
    WHERE article_id = $1`,
      [article_id]
    )
    .then((articleResult) => {
      if (articleResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article Not Found`,
        });
      }
      return db
        .query(
          `SELECT * FROM comments
        WHERE article_id = $1`,
          [article_id]
        )
        .then((commentResult) => {
          return commentResult.rows;
        });
    });
};

const insertComments = (article_id, username, body) => {
  if (isNaN(article_id) || !username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  if (typeof username !== "string" || typeof body !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((articleResult) => {
      if (articleResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return db
        .query(`SELECT * FROM users where username = $1`, [username])
        .then((usernameResult) => {
          if (usernameResult.rows.length === 0) {
            return Promise.reject({
              status: 404,
              msg: "Username Not Found",
            });
          }
          return db
            .query(
              `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *`,
              [article_id, username, body]
            )
            .then((commentResult) => {
              return commentResult.rows[0];
            });
        });
    });
};

const updateArticleById = (inc_votes, article_id) => {
  if (
    isNaN(article_id) ||
    typeof inc_votes !== "number" ||
    inc_votes === undefined
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((articleIdResult) => {
      if (articleIdResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return db
        .query(
          `UPDATE articles
    SET
    votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
          [inc_votes, article_id]
        )
        .then((articleResult) => {
          return articleResult.rows[0];
        });
    });
};
module.exports = {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
  insertComments,
  updateArticleById,
};
