const express = require("express");
const app = express();
const db = require("./db/connection");
const {
  getApi,
  getAllTopics,
  getArticlesById,
} = require("./app/controller/controller");

app.use(express.json());

// get api
app.get("/api", getApi);

// get all topics
app.get("/api/topics", getAllTopics);

// get articles by article id
app.get("/api/articles/:article_id", getArticlesById);

// 404 handler
app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

// 400 and custom handlers

// 400 postgres error for invalid input
app.use((err, req, res, next) => {
  console.log(err, "error");
  if (err.code === "22P02") {
    console.log(err);
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
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
