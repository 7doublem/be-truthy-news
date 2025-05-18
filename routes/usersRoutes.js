const express = require("express");
const { getAllUsers } = require("../app/controller/controller");
const userRouter = express.Router();

// get all users
userRouter.get("/", getAllUsers);

module.exports = userRouter;
