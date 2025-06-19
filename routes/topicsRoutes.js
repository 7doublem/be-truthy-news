const express = require("express");
const { getAllTopics, postNewTopic } = require("../app/controller/controller");
const topicsRouter = express.Router();

// get all topics
topicsRouter.get("/", getAllTopics);

// post new topic
topicsRouter.post("/", postNewTopic);

module.exports = topicsRouter;
