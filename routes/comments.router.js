const {
  deleteCommentByCommentId,
  patchCommentByCommentId,
} = require("../controllers/comments.controllers");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .patch(patchCommentByCommentId)
  .delete(deleteCommentByCommentId);
module.exports = commentsRouter;
