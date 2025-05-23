const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  blocked: { type: Boolean, default: false }, 
});

module.exports = mongoose.model("User", userSchema);