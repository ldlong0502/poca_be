const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");
const { UserSchema } = require("./User");
const EpisodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, },
  duration: { type: Number, required: true },
  audioFile: { type: String, required: true },
  publishDate: { type: Number, required: true },
  listens: { type: Number, default: 0 },
  favoritesList: [UserSchema],
  imageUrl: {
    type: String,
    default:
      "https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/03/Guide-to-Podcast-Art-Images-Featured.jpg"
  }
});

var Episode = mongoose.model("Episode", EpisodeSchema);
module.exports = {
  Episode,
  EpisodeSchema
};