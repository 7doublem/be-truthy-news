// custom error handler for errors with status and msg
function customErrorHandler(err, req, res, next) {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
}

// postgres bad input error handler (400)
function postgresErrorHandler(err, req, res, next) {
  if (err.code === '22P02' || err.code === '23502') {
    return res.status(400).send({ msg: 'Bad Input' });
  }
  next(err);
}

// internal server error handler (500)
function internalErrorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send({ msg: 'Internal Server Error' });
}

// non-existent endpoints error handler (404)
function notFoundHandler(req, res) {
  res.status(404).send({ msg: 'Page Not Found' });
}

module.exports = {
  customErrorHandler,
  postgresErrorHandler,
  internalErrorHandler,
  notFoundHandler,
};
