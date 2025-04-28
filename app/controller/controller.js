const endpointsJson = require("../../endpoints.json");
const { selectAllTopics } = require("../model/model");

const getApi = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsJson });
};

const getAllTopics = (req, res) => {
  return selectAllTopics()
    .then((topic) => {
      res.status(200).send({ topics: topic });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getApi, getAllTopics };
