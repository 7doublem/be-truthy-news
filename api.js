const express = require("express");
const app = express();
const apiRouter = require("./routes/apiRouter");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// all API routes handled by apiRouter
app.use("/api", apiRouter);

// error handlers

// 400: Postgres bad input
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    return res.status(400).send({ msg: "Bad Request" });
  }
  next(err);
});

// 400 & 404 handler with default messages
app.use((err, req, res, next) => {
  if (err.status) {
    const messages = {
      400: "Bad Request",
      404: "Not Found",
    };
    const msg = err.msg ?? messages[err.status] ?? "Error";
    return res.status(err.status).send({ msg });
  }
  next(err);
});

// 500 handler
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

// unmatched route handler
app.use((req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

module.exports = app;
