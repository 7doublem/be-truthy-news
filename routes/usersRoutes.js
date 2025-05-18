const express = require("express");
const { getAllUsers, getUserByUsername } = require("../app/controller/controller");
const userRouter = express.Router();

// get all users
userRouter.get("/", getAllUsers);

// get user by username
userRouter.get("/:username", getUserByUsername)

module.exports = userRouter;
