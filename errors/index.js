/* not actually error handling middleware 
    - is this the right place for this to go?
    - is it right to be called on everything in api.router.js as handles 
    all mtheods or app.js for an endpoint or app.js
    does this effect the order or error handling later on?*/
exports.invalidPathErrorHandler = (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

//set up a 500 error?
exports.handle500Errors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Sorry, internal server error!" });
};
