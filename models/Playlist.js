const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  episodesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
  imageUrl: { type: String, required: true }
});
const Playlist = mongoose.model("Playlist", PlaylistSchema);
module.exports = {
  Playlist,
  PlaylistSchema
};