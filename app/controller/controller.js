const endpointsJson = require("../../endpoints.json");
const {
  selectAllTopics,
  selectArticlesById,
  selectAllArticles,
  selectCommentsByArticleId,
  insertComments,
  updateArticleById,
  deleteCommentById,
  selectAllUsers,
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
  const { sort_by, order, topic } = req.query;
  return selectAllArticles(sort_by, order, topic)
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

const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  return updateArticleById(inc_votes, article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

const removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  return deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

const getAllUsers = (req, res, next) => {
  return selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
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
  patchArticleById,
  removeCommentById,
  getAllUsers,
};
