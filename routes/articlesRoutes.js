const express = require('express');
const {
  getAllArticles,
  getArticlesById,
  getCommentsByArticleId,
  postNewComment,
  patchArticleById,
  postNewArticle,
  removeArticleById,
} = require('../app/controller/controller');
const articlesRouter = express.Router();

// get all articles
articlesRouter.get('/', getAllArticles);

// get articles by article id
articlesRouter.get('/:article_id', getArticlesById);

// get comments by article id
articlesRouter.get('/:article_id/comments', getCommentsByArticleId);

// post new comment to article
articlesRouter.post('/:article_id/comments', postNewComment);

// patch existing article by article id
articlesRouter.patch('/:article_id', patchArticleById);

// post new article
articlesRouter.post('/', postNewArticle);

// delete article by article id
articlesRouter.delete('/:article_id', removeArticleById);

module.exports = articlesRouter;
