const express = require("express");
const { removeCommentById, patchCommentById } = require("../app/controller/controller");
const commentsRouter = express.Router();

// delete comment by comment id
commentsRouter.delete("/:comment_id", removeCommentById);

// patch comment by comment_id
commentsRouter.patch("/:comment_id", patchCommentById)

module.exports = commentsRouter;
