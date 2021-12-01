const {
  selectArticleById,
  updateArticleByArticleId,
  selectArticles,
} = require("../models/articles.models");

exports.getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
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
  const { sort_by, order, topic } = req.query;
  selectArticles(sort_by, order, topic).then((articles) => {
    res.status(200).send({ articles });
  });
};
