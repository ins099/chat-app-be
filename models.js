const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const ChatRoomSchema = mongoose.Schema({
  name: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{type:mongoose.Schema.Types.ObjectId, ref:'Message'}],
});

const MessageSchema = mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

const Message = mongoose.model("Message", MessageSchema);

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

module.exports = { User, ChatRoom, Message };
