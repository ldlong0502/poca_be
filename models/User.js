const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    imageUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1830/1830846.png"
    },
    isAdmin: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', UserSchema);
module.exports = {
  User,
  UserSchema
}