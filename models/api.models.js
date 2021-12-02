const jsonObj = require("../endpoints.json");

exports.fetchAPISummary = () => {
  return Promise.resolve(jsonObj);
};
