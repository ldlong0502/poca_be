const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  podcastId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Podcast",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = {
  Comment,
  commentSchema
};
