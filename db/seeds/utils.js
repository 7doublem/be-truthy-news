const db = require("../../db/connection");
const format = require("pg-format");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createReference = (articlesData) => {
  if (articlesData.length === 0) {
    return {};
  }

  const result = {};

  articlesData.forEach((article) => {
    result[article.title] = article.article_id;
  });

  return result;
};

exports.checkExists = (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1", table, column);
  return db.query(queryStr, [value]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not Found" });
    }
    return true;
  });
};
