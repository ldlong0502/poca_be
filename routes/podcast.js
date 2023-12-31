const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Podcast } = require("../models/Podcast");
const { Topic } = require("../models/Topic");
const { Episode } = require("../models/Episode");
const { User } = require("../models/User");
const { Channel } = require("../models/Channel");
const router = require("express").Router();

//GET ALL Episodes
router.get("/", async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    res.status(200).json(podcasts);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách padcasts" });
  }
});
router.get("/findByTopic/:topicId", async (req, res) => {
  try {
    var list = [];
    const podcasts = await Podcast.find({
      "topicsList._id": req.params.topicId
    }).exec();
    res.status(200).json(podcasts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách podcast theo topic" });
  }
});
router.get("/findByChannel/:channelId", async (req, res) => {
  try {
    var list = [];
    console.log(req.params.channelId);
    const podcasts = await Podcast.find({
      host: req.params.channelId
    });
    res.status(200).json(podcasts);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách podcast theo channel" });
  }
});

//search podcast
router.get("/search", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm." });
    }

    const regex = new RegExp(keyword, "i"); // Tìm kiếm không phân biệt chữ hoa chữ thường

    const podcasts = await Podcast.find({
      $or: [{ title: { $regex: regex }  }]
    });

    res.status(200).json(podcasts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tìm kiếm podcast." });
  }
});
// POST: Tạo podcast mới
router.post("/", verifyTokenAndAuthorization, async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    host,
    topicsList,
    publishDate
  } = req.body;
  try {
    const foundTopics = await Topic.find({ _id: { $in: topicsList } });

    console.log(foundTopics);
    const newPodcast = new Podcast({
      title,
      description,
      host,
      publishDate,
      imageUrl
    });

    newPodcast.topicsList = foundTopics;

    const savedPodcast = await newPodcast.save();
    res.status(200).json(savedPodcast);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi tạo podcast" });
  }
});
router.post("/:podcastId/add-favorite/:userId", async (req, res) => {
  const podcastId = req.params.podcastId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedPodcast = await Podcast.findOneAndUpdate(
      { _id: podcastId },
      { $addToSet: { favoritesList: user } },
      { new: true, upsert: true, includeResultMetadata: true }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    return res.json(updatedPodcast);
  } catch (error) {
    console.error("Error updating podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:idPodcast", verifyTokenAndAuthorization, async (req, res) => {
  const idPodcast = req.params.idPodcast;

  try {
    // Find the podcast by ID
    const deletedPodcast = await Podcast.findById(idPodcast);

    if (!deletedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    // Delete episodes from the episodesList of the podcast
    await Episode.deleteMany({ _id: { $in: deletedPodcast.episodesList } });

    // Delete the podcast
    await Podcast.findByIdAndDelete(idPodcast);

    res
      .status(200)
      .json({
        message: "Podcast and associated episodes deleted successfully"
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Lỗi khi xóa podcast và episodes liên quan" });
  }
});

router.put("/:id", async (req, res) => {
  const podcastId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedPodcast = await Podcast.findByIdAndUpdate(
      podcastId,
      updatedData,
      { new: true } // Trả về tài liệu đã được cập nhật
    );

    if (updatedPodcast) {
      res.json(updatedPodcast);
    } else {
      res.status(404).json({ error: "Podcast not found" });
    }
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Xóa một user khỏi favoritesList
router.post("/:podcastId/remove-favorite/:userId", async (req, res) => {
  const podcastId = req.params.podcastId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedPodcast = await Podcast.findOneAndUpdate(
      { _id: podcastId },
      { $pull: { favoritesList: user } },
      { new: true }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    return res.json(updatedPodcast);
  } catch (error) {
    console.error("Error updating podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/:podcastId/add-subscribe/:userId", async (req, res) => {
  const podcastId = req.params.podcastId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedPodcast = await Podcast.findOneAndUpdate(
      { _id: podcastId },
      { $addToSet: { subscribesList: user } },
      { new: true, upsert: true, includeResultMetadata: true }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }
   
    return res.json(updatedPodcast);
  } catch (error) {
    console.error("Error updating podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/:podcastId/remove-subscribe/:userId", async (req, res) => {
  const podcastId = req.params.podcastId;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedPodcast = await Podcast.findOneAndUpdate(
      { _id: podcastId },
      { $pull: {  subscribesList: { _id: userId } } },
      { new: true }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }
 console.log({ test: updatedPodcast });
    return res.json(updatedPodcast);
  } catch (error) {
    console.error("Error remove podcast:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// GET: Lấy chi tiết podcast theo ID
router.get("/:id", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: "Không tìm thấy podcast" });
    }
    res.status(200).json(podcast);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết podcast" });
  }
});

router.get("/subscribes/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
   const podcasts = await Podcast.find({ 'subscribesList._id': userId });
    console.log(podcasts);
    if (!podcasts || podcasts.length === 0) {
      return res
        .status(404)
        .json({ message: "No podcasts found for the user" });
    }

    return res.status(200).json(podcasts);
  } catch (error) {
    console.error("Error finding podcasts:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// PUT: Cập nhật podcast theo ID

// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   const {
//     title,
//     description,
//     imageUrl,
//     duration,
//     audioFile,
//     publishDate,
//     listens
//   } = req.body;
//   try {
//     const updatedEpisode = await Topic.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         description,
//         imageUrl,
//         duration,
//         audioFile,
//         publishDate,
//         listens
//       },
//       { new: true }
//     );
//     if (!updatedEpisode) {
//       return res.status(404).json({ error: "Không tìm thấy podcast" });
//     }
//     res.status(200).json(updatedEpisode);
//   } catch (err) {
//     res.status(500).json({ error: "Lỗi khi cập nhật podcast" });
//   }
// });
module.exports = router;
