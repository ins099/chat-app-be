const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { User, ChatRoom } = require("./models");
const { authenticateToken } = require("./helpers");
var cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  "mongodb+srv://ias-new:1234567890@chatapp.4or0oj5.mongodb.net/";

mongoose.connect(MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  authenticateToken(req, res, () => next());
});

// User Registration
app.post("/register", async (req, res) => {
  try {
    console.log("======REGISTER=====");
    const { full_name, email, password } = req.body;

    if (!full_name) {
      return res
        .status(400)
        .json({ message: "full_name is a required field." });
    } else if (!email) {
      return res.status(400).json({ message: "email is a required field." });
    } else if (!password) {
      return res.status(400).json({ message: "password is a required field." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }
    const user = new User({ full_name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      "this-is-secret-key-sshhh-dont-share",
      {
        expiresIn: "4h",
      }
    );

    res
      .status(201)
      .json({ message: "User registered successfully", token, user });
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong registering the user.",
      error: error.message,
    });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    console.log("=============LOGIN===========");
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "This email doesn't exist" });
    }
    const isBycrpt = await bcrypt.compare(password, user.password);

    if (!isBycrpt) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { userId: user._id },
      "this-is-secret-key-sshhh-dont-share",
      {
        expiresIn: "4h",
      }
    );

    const data = user._doc;
    delete data.password;

    res.status(200).send({
      token,
      user: data,
    });
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong registering the user.",
      error: error.message,
    });
  }
});

// Create Chat Room
app.post("/createChatRoom", async (req, res) => {
  try {
    const { name, author } = req.body;

    // Validate inputs
    if (!name || !author) {
      return res
        .status(400)
        .json({ error: "Name and author are required fields" });
    }

    // Check if the chat room with the same name already exists
    const existingChatRoom = await ChatRoom.findOne({ name });
    if (existingChatRoom) {
      return res
        .status(400)
        .json({ error: "Chat room with the same name already exists" });
    }

    // Create a new chat room
    const chatRoom = new ChatRoom({ name, author, users: [author] });
    await chatRoom.save();

    res.status(201).json({ message: "Chat room created successfully" });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Join Chat Room
app.post("/joinChatRoom", async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    // Validate inputs
    if (!roomId || !userId) {
      return res
        .status(400)
        .json({ error: "Room name and user are required fields" });
    }

    // Check if the chat room exists
    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    // Check if the user is already in the chat room
    if (chatRoom.users.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already in the chat room" });
    }

    // Add the userId to the chat room and save
    chatRoom.users.push(userId);
    await chatRoom.save();

    res.json({ message: "Joined chat room successfully" });
  } catch (error) {
    console.error("Error joining chat room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
