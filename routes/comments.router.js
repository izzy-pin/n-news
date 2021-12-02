const {
  deleteCommentByCommentId,
} = require("../controllers/comments.controllers");

const commentsRouter = require("express").Router();

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);
module.exports = commentsRouter;
