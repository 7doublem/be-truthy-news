const express = require("express");
const { getAllTopics } = require("../app/controller/controller");
const topicsRouter = express.Router();

// get all topics
topicsRouter.get("/", getAllTopics);

module.exports = topicsRouter;
