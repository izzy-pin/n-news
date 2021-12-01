const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleByArticleId,
  patchArticleByArticleId,
} = require("../controllers/articles.controllers");

articlesRouter.get("/", getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleByArticleId)
  .patch(patchArticleByArticleId);
module.exports = articlesRouter;
