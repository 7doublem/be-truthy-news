const express = require("express");
const app = express();
const db = require("./db/connection");
const {
  getApi,
  getAllTopics,
  getArticlesById,
  getAllArticles,
  getCommentsByArticleId,
  postNewComment,
  patchArticleById
} = require("./app/controller/controller");

app.use(express.json());

// get api
app.get("/api", getApi);

// get all topics
app.get("/api/topics", getAllTopics);

// get articles by article id
app.get("/api/articles/:article_id", getArticlesById);

// get all articles
app.get("/api/articles", getAllArticles);

// get comments by article id
app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

// post new comment to article
app.post("/api/articles/:article_id/comments", postNewComment)

// patch existing article by id
app.patch("/api/articles/:article_id", patchArticleById)

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
