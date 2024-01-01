const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");
const { EpisodeSchema } = require("./Episode");
const { TopicSchema } = require("./Topic");
const { UserSchema } = require("./User");
const PodcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  episodesList: [EpisodeSchema],
  topicsList: [TopicSchema],
  subscribesList: [UserSchema],
  publishDate: { type: Number, required: true },
  favoritesList: [UserSchema],
  imageUrl: { type: String, required: true }
});

const Podcast = mongoose.model("Podcast", PodcastSchema);
module.exports = {
  Podcast,
  PodcastSchema
};