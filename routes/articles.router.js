const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleByArticleId,
  patchArticleByArticleId,
} = require("../controllers/articles.controllers");
const {
  getCommentsByArticleId,
} = require("../controllers/comments.controllers");

articlesRouter.get("/", getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticleByArticleId);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);

module.exports = articlesRouter;
