const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { User, ChatRoom } = require("./models");

const authenticateToken = async (req, res, next) => {
  // Exclude authentication for /login and /register routes
  if (req.path === "/login" || req.path === "/register") {
    return next();
  }

  // Extract the token from the Authorization header
  const token = req.header("Authorization");

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "this-is-secret-key-sshhh-dont-share");
    // Attach the user ID to the request for future use
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw Error;
    }
    console.log("=====AUTHENTICATION SUCCESS=======", user);
    next(user);
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

module.exports = { authenticateToken };
