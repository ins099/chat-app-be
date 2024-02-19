const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  full_name: String,
  email: String,
  password: String,
});

const ChatRoomSchema = mongoose.Schema({
  name: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", UserSchema);

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

module.exports = { User, ChatRoom };
