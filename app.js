const express = require("express");
const {
  invalidPathErrorHandler,
  handle500Errors,
  handleCustomErrors,
  handlePSQLError,
} = require("./errors");
const apiRouter = require("./routes/api.router");
const app = express();
app.use(express.json());

app.get("/", (req, res, next) => {
  res.status(200).send({ msg: "Hello from the news api!" });
});

app.use("/api", apiRouter);
app.all("/*", invalidPathErrorHandler);
app.use(handleCustomErrors);
app.use(handlePSQLError);
app.use(handle500Errors);

module.exports = app;
