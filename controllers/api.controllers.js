const { fetchAPISummary } = require("../models/api.models");

exports.getAPISummary = (req, res, next) => {
  fetchAPISummary().then((api) => {
    res.status(200).send(api);
  });
};
