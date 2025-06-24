// controller module for handling api requests and responses
// provides handlers for topics, articles, comments, users, and related operations

const endpointsJson = require('../../endpoints.json');
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
  insertTopic,
  deleteArticleById,
} = require('../model/model');
const {
  checkMissingFields,
  checkInvalidTypes,
  capitalise,
} = require('../utils/validation');

// sends the api endpoints documentation
const getApi = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsJson });
};

// fetches all topics
const getAllTopics = (req, res, next) => {
  return selectAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

// fetches an article by its id
const getArticlesById = (req, res, next) => {
  const { article_id } = req.params;

  // check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid Article ID' });
  }

  // fetch the article by id from the model
  return selectArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

// fetches all articles with optional sorting, filtering, and pagination
const getAllArticles = (req, res, next) => {
  const { sort_by, order, topic, limit = 10, p = 1 } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(p, 10);

  // validate pagination parameters
  if (
    isNaN(parsedLimit) ||
    isNaN(parsedPage) ||
    parsedLimit <= 0 ||
    parsedPage <= 0
  ) {
    return res.status(400).send({ msg: 'Invalid Limit or Page Number' });
  }

  // fetch all articles with optional filters and pagination
  return selectAllArticles(sort_by, order, topic, parsedLimit, parsedPage)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

// fetches comments for a specific article by article id
const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10, p = 1 } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(p, 10);

  // validate pagination parameters for comments
  if (
    isNaN(parsedLimit) ||
    isNaN(parsedPage) ||
    parsedLimit <= 0 ||
    parsedPage <= 0
  ) {
    return res.status(400).send({ msg: 'Invalid Limit or Page Number' });
  }

  // check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid Article ID' });
  }

  // fetch comments for the article from the model
  return selectCommentsByArticleId(article_id, limit, p)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

// posts a new comment to a specific article
const postNewComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  // check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid Article ID' });
  }

  // check for missing fields in the request body
  const missingFields = checkMissingFields(req.body, ['username', 'body']);
  if (missingFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Missing more than one required field' });
  }
  if (missingFields.length === 1) {
    const field = missingFields[0];
    return res.status(400).send({
      msg: `${capitalise(field)} is required`,
    });
  }

  // check for invalid data types in the request body
  const invalidFields = checkInvalidTypes(req.body, {
    username: 'string',
    body: 'string',
  });

  if (invalidFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Invalid data type for more than one field' });
  }
  if (invalidFields.length === 1) {
    const field = invalidFields[0];
    return res.status(400).send({
      msg: `Invalid ${capitalise(field)}`,
    });
  }

  // insert the comment into the database
  return insertComments(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

// updates the vote count for a specific article
const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  // check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid Article ID' });
  }

  // validate inc_votes is a number and present
  if (typeof inc_votes !== 'number' || inc_votes === undefined) {
    return res.status(400).send({ msg: 'Invalid or Missing Votes' });
  }

  // update the article's vote count in the model
  return updateArticleById(inc_votes, article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

// deletes a comment by its id
const removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  // check if comment_id is a valid number
  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: 'Invalid Comment ID' });
  }

  // delete the comment by id in the model
  return deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

// fetches all users
const getAllUsers = (req, res, next) => {
  return selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

// fetches a user by their username
const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  // validate username is a string and not a number
  if (
    username === undefined ||
    typeof username !== 'string' ||
    !isNaN(username)
  ) {
    return res.status(400).send({ msg: 'Invalid Username' });
  }

  // fetch user by username from the model
  return selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

// updates the vote count for a specific comment
const patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  // check if comment_id is a valid number
  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: 'Invalid Comment ID' });
  }

  // validate inc_votes is a number and present
  if (typeof inc_votes !== 'number' || inc_votes === undefined) {
    return res.status(400).send({ msg: 'Invalid or Missing Votes' });
  }

  // update the comment's vote count in the model
  return updateCommentById(inc_votes, comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

// posts a new article
const postNewArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;

  // check for missing fields in the request body
  const missingFields = checkMissingFields(req.body, [
    'author',
    'title',
    'body',
    'topic',
  ]);

  if (missingFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Missing more than one required field' });
  }
  if (missingFields.length === 1) {
    const field = missingFields[0];
    return res.status(400).send({
      msg: `${capitalise(field)} is required`,
    });
  }

  // check for invalid data types in the request body
  const invalidFields = checkInvalidTypes(req.body, {
    author: 'string',
    title: 'string',
    body: 'string',
    topic: 'string',
  });

  if (invalidFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Invalid data type for more than one field' });
  }
  if (invalidFields.length === 1) {
    const field = invalidFields[0];
    return res.status(400).send({
      msg: `Invalid ${capitalise(field)}`,
    });
  }

  // insert the article into the database
  return insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

// posts a new topic
const postNewTopic = (req, res, next) => {
  const { slug, description, img_url } = req.body;

  const fieldToRequiredMsg = {
    slug: 'Topic is required',
    description: 'Description is required',
    img_url: 'Image URL is required',
  };

  const fieldToInvalidMsg = {
    slug: 'Invalid Topic Slug',
    description: 'Invalid Description',
    img_url: 'Invalid Image URL',
  };

  // check for missing fields in the request body
  const missingFields = checkMissingFields(req.body, [
    'slug',
    'description',
    'img_url',
  ]);
  if (missingFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Missing more than one required field' });
  }
  if (missingFields.length === 1) {
    const field = missingFields[0];
    return res.status(400).send({
      msg: fieldToRequiredMsg[field] || `${field} is required`,
    });
  }

  // check for invalid data types in the request body
  const invalidFields = checkInvalidTypes(req.body, {
    slug: 'string',
    description: 'string',
    img_url: 'string',
  });

  if (invalidFields.length > 1) {
    return res
      .status(400)
      .send({ msg: 'Invalid data type for more than one field' });
  }
  if (invalidFields.length === 1) {
    const field = invalidFields[0];
    return res.status(400).send({
      msg: fieldToInvalidMsg[field] || `Invalid ${field}`,
    });
  }

  // insert the topic into the database
  return insertTopic(slug, description, img_url)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

// deletes an article by its id
const removeArticleById = (req, res, next) => {
  const { article_id } = req.params;

  // check if article_id is a valid number
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid Article ID' });
  }

  // delete the article by id in the model
  return deleteArticleById(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

// controller functions for handling api endpoints related to topics, articles, comments, and users
// each function receives express req, res, next objects and interacts with the model layer
// validation utilities are used to check request data before calling model functions

module.exports = {
  getApi,
  getAllTopics,
  getArticlesById,
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
  removeArticleById,
};
