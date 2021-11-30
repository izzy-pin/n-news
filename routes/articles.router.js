const articlesRouter = require("express").Router();
const {
  getArticleByArticleId,
} = require("../controllers/articles.controllers");

articlesRouter.get("/:article_id", getArticleByArticleId);
module.exports = articlesRouter;
