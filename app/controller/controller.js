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
  selectUserByUsername,
  updateCommentById,
  insertArticle,
  insertTopic
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
  const { sort_by, order, topic, limit = 10, p = 1 } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(p, 10);

  if (
    isNaN(parsedLimit) ||
    isNaN(parsedPage) ||
    parsedLimit <= 0 ||
    parsedPage <= 0
  ) {
    return res.status(400).send({ msg: "Invalid Limit or Page Number" });
  }

  return selectAllArticles(sort_by, order, topic, parsedLimit, parsedPage)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10, p = 1 } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(p, 10);

  if (
    isNaN(parsedLimit) ||
    isNaN(parsedPage) ||
    parsedLimit <= 0 ||
    parsedPage <= 0
  ) {
    return res.status(400).send({ msg: "Invalid Limit or Page Number" });
  }
  
  return selectCommentsByArticleId(article_id, limit, p)
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

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  return selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

const patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  return updateCommentById(inc_votes, comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

const postNewArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  return insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

const postNewTopic = (req, res, next) => {
  const { slug, description, img_url } = req.body;
  return insertTopic(slug, description, img_url)
    .then((topic) => {
      res.status(201).send({ topic });
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
  getUserByUsername,
  patchCommentById,
  postNewArticle,
  postNewTopic,
};
