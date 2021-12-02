const { checkArticleExists } = require("../models/articles.models");
const {
  selectCommentsByArticleId,
  insertCommentForArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    selectCommentsByArticleId(article_id),
    checkArticleExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentForArticleId = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;
  Promise.all([username, body, article_id, checkArticleExists(article_id)])
    .then(([username, body, article_id]) => {
      return insertCommentForArticleId(username, body, article_id);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
