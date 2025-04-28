const db = require("../../db/connection");

const selectAllTopics = () => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    const topics = result.rows;
    return topics;
  });
};

module.exports = { selectAllTopics };
