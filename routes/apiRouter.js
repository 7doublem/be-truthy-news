const express = require('express');
const { getApi } = require('../app/controller/controller');
const apiRouter = express.Router();

// handles GET request for API documentation/overview
apiRouter.get('/', getApi);

// imports subrouters for users, topics, articles, and comments
const userRouter = require('./usersRoutes');
const topicsRouter = require('./topicsRoutes');
const articlesRouter = require('./articlesRoutes');
const commentsRouter = require('./commentsRoutes');

// mounts user routes at /users
apiRouter.use('/users', userRouter);
// mounts topic routes at /topics
apiRouter.use('/topics', topicsRouter);
// mounts article routes at /articles
apiRouter.use('/articles', articlesRouter);
// mounts comment routes at /comments
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
