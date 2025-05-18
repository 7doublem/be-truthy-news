const express = require("express");
const { removeCommentById } = require("../app/controller/controller");
const commentsRouter = express.Router();

// delete comment by comment id
commentsRouter.delete("/:comment_id", removeCommentById);

module.exports = commentsRouter;
