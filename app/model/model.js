const db = require("../../db/connection");
const { checkExists } = require("../../db/seeds/utils");

const selectAllTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

const selectArticlesById = (article_id) => {
  const queryStr = `SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count 
       FROM articles
       LEFT JOIN comments
       oN articles.article_id = comments.article_id
       WHERE articles.article_id = $1
       GROUP BY articles.article_id`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "Oops! That article could not be found. It might have been deleted or never existed",
      });
    }
    return rows[0];
  });
};

const selectAllArticles = (sort_by = "created_at", order = "desc", topic) => {
  const allowedSorts = [
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const allowedOrders = ["asc", "desc"];

  if (!allowedSorts.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid Sort Field",
    });
  }

  if (!allowedOrders.includes(order.toLowerCase())) {
    return Promise.reject({
      status: 400,
      msg: "Invalid Order Field",
    });
  }

  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id`;

  const queryValues = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url`;

  let sort_by_inc_cc;

  if (sort_by === "comment_count") {
    sort_by_inc_cc = "comment_count";
  } else {
    sort_by_inc_cc = `articles.${sort_by}`;
  }

  queryStr += ` ORDER BY ${sort_by_inc_cc} ${order.toUpperCase()}`;

  if (topic) {
    return checkExists("topics", "slug", topic).then(() => {
      return db.query(queryStr, queryValues).then(({ rows }) => {
        return rows;
      });
    });
  }
  return db.query(queryStr, queryValues).then(({ rows }) => {
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
          msg: "Oops! That article could not be found. It might have been deleted or never existed",
        });
      }
      return db
        .query(
          `SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`,
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
          msg: "Oops! That article could not be found. It might have been deleted or never existed",
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
          msg: "Oops! That article could not be found. It might have been deleted or never existed",
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

const deleteCommentById = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id = $1`,
      [comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Oops! That comment could not be found. It might have been deleted or never existed",
        });
      }
    });
};

const selectAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => {
    return rows;
  });
};

const selectUserByUsername = (username) => {
  if (!isNaN(username)) {
    return Promise.reject({ status: 400 });
  }

  return db
    .query(
      `SELECT * FROM users
    WHERE username = $1`,
      [username]
    )
    .then((userResult) => {
      if (userResult.rows.length === 0) {
        return Promise.reject({ status: 404 });
      }
      return userResult.rows[0];
    });
};

const updateCommentById = (inc_votes, comment_id) => {
  if (isNaN(comment_id) || typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }

      return db
        .query(
          `
          UPDATE comments
          SET votes = votes + $1
          WHERE comment_id = $2
          RETURNING comment_id, body, votes, author, created_at;
          `,
          [inc_votes, comment_id]
        )
        .then((updateResult) => updateResult.rows[0]);
    });
};
module.exports = {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
  insertComments,
  updateArticleById,
  deleteCommentById,
  selectAllUsers,
  selectUserByUsername,
  updateCommentById,
};
