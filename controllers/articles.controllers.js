const {
  selectArticleById,
  updateArticleByArticleId,
  selectArticles,
  checkArticleExists,
  insertArticle,
} = require("../models/articles.models");

exports.getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([selectArticleById(article_id), checkArticleExists(article_id)])
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleByArticleId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;
  Promise.all([article_id, updateArticleByArticleId(inc_votes, article_id)])
    .then(([article_id]) => {
      return selectArticleById(article_id);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { author, sort_by, order, topic, limit, p } = req.query;
  selectArticles(author, sort_by, order, topic, limit, p)
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { title, body, topic, author } = req.body;

  insertArticle(title, body, topic, author)
    .then((article) => {
      res.status(201).send(article);
    })
    .catch((err) => {
      next(err);
    });
};
