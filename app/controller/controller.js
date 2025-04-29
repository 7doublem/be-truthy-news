const endpointsJson = require("../../endpoints.json");
const { selectAllTopics, selectArticlesById } = require("../model/model");

const getApi = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsJson });
};

const getAllTopics = (req, res, next) => {
  return selectAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

const getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

module.exports = { getApi, getAllTopics, getArticlesById };
