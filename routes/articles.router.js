const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleByArticleId,
  patchArticleByArticleId,
  postArticle,
} = require("../controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postCommentForArticleId,
} = require("../controllers/comments.controllers");

articlesRouter.get("/", getArticles).post("/", postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticleByArticleId);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentForArticleId);

module.exports = articlesRouter;
