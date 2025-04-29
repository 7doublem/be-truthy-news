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

module.exports = { selectAllTopics, selectArticlesById };
