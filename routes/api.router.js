const apiRouter = require("express").Router();
const { getAPISummary } = require("../controllers/api.controllers");
const articlesRouter = require("./articles.router");
const commentsRouter = require("./comments.router");
const topicsRouter = require("./topics.router");
const usersRouter = require("./users.router");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

apiRouter.get("/", getAPISummary);

module.exports = apiRouter;
