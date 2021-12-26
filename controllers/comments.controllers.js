const { checkArticleExists } = require("../models/articles.models");
const {
  selectCommentsByArticleId,
  insertCommentForArticleId,
  removeCommentById,
  checkCommentExists,
  updateCommentByCommentId,
  selectCommentByCommentId,
} = require("../models/comments.models");
const { checkUsernameExists } = require("../models/users.models");

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
  Promise.all([
    username,
    body,
    article_id,
    ,
    checkUsernameExists(username),
    checkArticleExists(article_id),
  ])
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

exports.deleteCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  Promise.all([comment_id, checkCommentExists(comment_id)])
    .then(([comment_id]) => {
      return removeCommentById(comment_id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  Promise.all([comment_id, inc_votes, checkCommentExists(comment_id)])
    .then(([comment_id, inc_votes]) => {
      return Promise.all([
        comment_id,
        updateCommentByCommentId(comment_id, inc_votes),
      ]);
    })
    .then(([comment_id]) => {
      return selectCommentByCommentId(comment_id);
    })
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
