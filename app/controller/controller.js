const { articleData } = require("../../db/data/test-data");
const endpointsJson = require("../../endpoints.json");
const {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
  insertComments,
} = require("../model/model");

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

const getAllArticles = (req, res, next) => {
  return selectAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

const postNewComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertComments(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
module.exports = {
  getApi,
  getAllTopics,
  getArticlesById,
  getAllTopics,
  getAllArticles,
  getCommentsByArticleId,
  postNewComment,
};
