const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");
const { UserSchema } = require("./User");
const PlaylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String},
    episodesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);
const Playlist = mongoose.model("Playlist", PlaylistSchema);
module.exports = {
  Playlist,
  PlaylistSchema
};