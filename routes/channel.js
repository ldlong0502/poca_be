const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Channel } = require("../models/Channel");
const { User } = require("../models/User");
const router = require("express").Router();


router.get("/", async (req, res) => {
  try {
    const topics = await Channel.find();
    res.status(200).json(topics);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách channel" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const allChannels = await Channel.find({});
    console.log(allChannels);
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: "Không tìm thấy channel" });
    }
    res.status(200).json(channel);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết channel" });
  }
});

router.get("/find-by-user/:userId", async (req, res) => {
  const userIdToFind = req.params.userId;

  try {
    const channel = await Channel.findOne({ idUser: userIdToFind }).exec();

    if (channel) {
      return res.status(200).json(channel);
    } else {
      return res
        .status(404)
        .json({ error: "Channel not found for the specified user" });
    }
  } catch (error) {
    console.error("Error finding channel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:channelId/add-subscribe/:userId", async (req, res) => {
  const channelId = req.params.channelId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId },
      { $addToSet: { subscribed: userId } },
      { new: true, upsert: true, includeResultMetadata: true }
    );

    if (!updatedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    return res.json(updatedChannel);
  } catch (error) {
    console.error("Error updating podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:channelId/remove-subscribe/:userId", async (req, res) => {
  const channelId = req.params.channelId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channelId },
      { $pull: { subscribed: userId } },
      { new: true }
    );

    if (!updatedChannel) {
      return res.status(404).json({ error: "Channel not found" });
    }
    console.log({ test: updatedChannel });
    return res.json(updatedChannel);
  } catch (error) {
    console.error("Error remove podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:id", async (req, res) => {
  const channelId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      updatedData,
      { new: true } // Trả về tài liệu đã được cập nhật
    );

    if (updatedChannel) {
      res.json(updatedChannel);
    } else {
      res.status(404).json({ error: "Channel not found" });
    }
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/add", async (req, res) => {
  // Assuming you're sending channel details in the request body
  const {
    name,
    about,
    info,
    idUser,
    isUser,
    subscribed,
    topics,
    imageUrl
  } = req.body;

  try {
    // Create a new channel instance
    const newChannel = new Channel({
      name,
      about,
      info,
      idUser,
      isUser,
      subscribed,
      topics,
      imageUrl
    });

    // Save the new channel to the database
    const savedChannel = await newChannel.save();

    res.status(200).json(savedChannel);
  } catch (error) {
    console.error("Error adding channel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedChannel= await Channel.findByIdAndDelete(req.params.id);

    if (!deletedChannel) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(deletedChannel);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
