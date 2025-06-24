const express = require('express');
const app = express();
const apiRouter = require('./routes/apiRouter');
const cors = require('cors');
const {
  customErrorHandler,
  postgresErrorHandler,
  internalErrorHandler,
  notFoundHandler,
} = require('./app/middleware/errorHandlers');

app.use(express.json()); // parses incoming JSON requests
app.use(cors()); // enables Cross-Origin Resource Sharing

// all API routes handled by apiRouter at /api
app.use('/api', apiRouter);

// error handlers for custom, postgres, internal, and 404 errors
app.use(customErrorHandler);
app.use(postgresErrorHandler);
app.use(internalErrorHandler);
app.use(notFoundHandler);

module.exports = app;
