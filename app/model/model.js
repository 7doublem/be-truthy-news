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
          msg: `No article found for article_id: ${article_id}`,
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
          msg: `No article found for article_id: ${article_id}`,
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
module.exports = {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
};
