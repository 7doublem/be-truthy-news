const express = require("express");
const { getApi } = require("../app/controller/controller");
const apiRouter = express.Router();

// get api
apiRouter.get("/", getApi);

//subroutes
const userRouter = require("./usersRoutes");
const topicsRouter = require("./topicsRoutes");
const articlesRouter = require("./articlesRoutes");
const commentsRouter = require("./commentsRoutes");

apiRouter.use("/users", userRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
