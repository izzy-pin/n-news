const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleByArticleId,
  patchArticleByArticleId,
  postArticle,
  deleteArticleByArticleId,
} = require("../controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postCommentForArticleId,
} = require("../controllers/comments.controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticleByArticleId)
  .delete(deleteArticleByArticleId);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentForArticleId);

module.exports = articlesRouter;
