const express = require("express");
const app = express();
const db = require("./db/connection");
const { getApi, getAllTopics } = require("./app/controller/controller");

app.use(express.json());

// get api
app.get("/api", getApi);

// get all topics
app.get("/api/topics", getAllTopics);

// 404 handler
app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

// 500 handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
