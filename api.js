const express = require("express");
const app = express();
const apiRouter = require("./routes/apiRouter");

app.use(express.json());

// all API routes handled by apiRouter
app.use("/api", apiRouter);

// 404 handler
app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

// 400 and custom handlers

// 400 postgres error for invalid input
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else next(err);
});

//custom error
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

// 500 handler
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
