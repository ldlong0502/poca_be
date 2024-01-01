const mongoose = require("mongoose");
const { UserSchema } = require("./User");
const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  about: { type: String },
  info: { type: Map },
  idUser: { type: String, default: "" },
  isUser: { type: Boolean, default: false },
  subscribed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],

  imageUrl: {
    type: String,
    default:
      "https://th.bing.com/th/id/R.bb3917a51611bb54a809e50067f2c0c3?rik=BYfAldKswtgzng&pid=ImgRaw&r=0"
  }
});

var Channel = mongoose.model("Channel", ChannelSchema);
module.exports = {
  Channel,
  ChannelSchema
};
