const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const TopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    description: { type: String},
    imageUrl: { type: String, required: true },
  }
);

const Topic = mongoose.model("Topic", TopicSchema);
module.exports = {
  Topic,
  TopicSchema
};