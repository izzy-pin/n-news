const apiRouter = require("express").Router();
const articlesRouter = require("./articles.router");
const topicsRouter = require("./topics.router");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
