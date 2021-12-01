const articlesRouter = require("express").Router();
const {
  getArticleByArticleId,
  patchArticleByArticleId,
} = require("../controllers/articles.controllers");

articlesRouter.get("/:article_id", getArticleByArticleId);
articlesRouter.patch("/:article_id", patchArticleByArticleId);
module.exports = articlesRouter;
