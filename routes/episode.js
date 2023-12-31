const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Episode } = require("../models/Episode");
const { Podcast } = require("../models/Podcast");
const router = require("express").Router();

//GET ALL Episodes
router.get("/:podcastId/episodes", async (req, res) => {
  try {
    const podcasts = await Podcast.findById(req.params.podcastId).populate(
      "episodesList"
    );
    res.status(200).json(podcasts.episodesList);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách tập" });
  }
});

router.get("/findByEpisode/:episodeId", async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      "episodesList._id": req.params.episodeId
    });
    if (!podcast) {
      res.status(404).json({ message: "Podcast not found" });
      return;
    }
    res.status(200).json(podcast);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách tập" });
  }
});

// POST: Tạo tập phim mới
router.post(
  "/:podcastId/episodes",
  verifyTokenAndAuthorization,
  async (req, res) => {
    const {
      title,
      description,
      imageUrl,
      duration,
      audioFile,
      publishDate
    } = req.body;
    try {
      const newEpisode = new Episode({
        title,
        description,
        duration,
        audioFile,
        publishDate,
        imageUrl
      });
      const podcast = await Podcast.findById(req.params.podcastId);
      podcast.episodesList.push(newEpisode);
      await Promise.all([newEpisode.save(), podcast.save()]);
      res.status(200).json(newEpisode);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Lỗi khi tạo tập phim" });
    }
  }
);

// GET: Lấy chi tiết tập phim theo ID
router.get("/latest-episode", async (req, res) => {
  try {
    const latestEpisode = await Episode.findOne().sort({ publishDate: -1 });
    if (!latestEpisode) {
      return res.status(404).json({ error: "Không tìm thấy tập phim" });
    }
    res.status(200).json(latestEpisode);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết tập phim" });
  }
});

router.get("/episodes/search", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm." });
    }

    const regex = new RegExp(keyword, "i"); // Tìm kiếm không phân biệt chữ hoa chữ thường

    const episodes = await Episode.find({
      title: { $regex: regex }
    });

    res.status(200).json(episodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tìm kiếm tập." });
  }
});
// PUT: Cập nhật tập phim theo ID

router.put(
  "/:podcastId/episodes/:episodeId",
  verifyTokenAndAdmin,
  async (req, res) => {
    const {
      title,
      description,
      imageUrl,
      duration,
      audioFile,
      publishDate,
      listens
    } = req.body;
    try {
      const podcast = await Podcast.findById(req.params.podcastId).populate(
        "episodesList"
      );
      if (!podcast) {
        return res.status(404).json({ error: "Podcast không tồn tại" });
      }

      const updatedEpisode = await Episode.findByIdAndUpdate(
        req.params.episodeId,
        {
          title,
          description,
          imageUrl,
          duration,
          audioFile,
          publishDate,
          listens
        },
        { new: true }
      );
      if (!updatedEpisode) {
        return res.status(404).json({ error: "Không tìm thấy tập phim" });
      }
      res.status(200).json(updatedEpisode);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi cập nhật tập phim" });
    }
  }
);

router.put("/:podcastId/increment-listens/:episodeId", async (req, res) => {
  const episodeId = req.params.episodeId;
  const podcastId = req.params.podcastId;

  try {
    // Find the episode by ID and update the listens field
    const updatedEpisode = await Episode.findByIdAndUpdate(
      episodeId,
      { $inc: { listens: 1 } },
      { new: true }
    );

    if (!updatedEpisode) {
      return res.status(404).json({ error: "Episode not found" });
    }
    await Podcast.updateOne(
      { _id: podcastId, "episodesList._id": episodeId },
      { $set: { "episodesList.$": updatedEpisode } }
    );

    return res.status(200).json(updatedEpisode);
  } catch (error) {
    console.error("Error updating listens:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/episodes/:id", async (req, res) => {
  try {
    console.log(req.params.id);

    const episode = await Episode.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: "Không tìm thấy episode" });
    }
    res.status(200).json(episode);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết episode" });
  }
});

router.get("/all-episodes", async (req, res) => {
  try {
    const topics = await Episode.find();
    res.status(200).json(topics);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách episode" });
  }
});

router.delete(
  "/episodes/:episodeId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    const episodeId = req.params.episodeId;

    try {
      const episode = await Episode.findById(episodeId);
      console.error(episode);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }

      // Remove the episode from all podcasts that include it
      await Podcast.updateMany(
        { "episodesList._id": episodeId }, // Find documents where episodesList array contains an episode with the given _id
        { $pull: { episodesList: { _id: episodeId } } } // Pull (remove) the episode with the specified _id from the episodesList array
      );

      // Delete the episode
      await Episode.findByIdAndDelete(episodeId);

      res.status(200).json({ message: "Episode deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi khi xóa tập phim" });
    }
  }
);

router.put(
  "/episodes/:episodeId",
  verifyTokenAndAuthorization,
  async (req, res) => {
    const episodeId = req.params.episodeId;

    try {
      // Update the episode in the Episode collection
      const updatedEpisode = await Episode.findByIdAndUpdate(
        episodeId,
        req.body, // Assuming req.body contains the updated episode data
        { new: true, runValidators: true }
      );

      if (!updatedEpisode) {
        return res.status(404).json({ error: "Episode not found" });
      }

      // Find the podcast that contains the specified episode
      const podcast = await Podcast.findOne({ "episodesList._id": episodeId });

      if (!podcast) {
        return res
          .status(404)
          .json({ error: "Podcast containing the episode not found" });
      }

      // Find the index of the episode within the episodesList
      const episodeIndex = podcast.episodesList.findIndex(
        episode => episode._id.toString() === episodeId
      );

      if (episodeIndex === -1) {
        return res
          .status(404)
          .json({ error: "Episode not found in the podcast" });
      }

      // Update the episode within the episodesList
      podcast.episodesList[episodeIndex] = {
        ...podcast.episodesList[episodeIndex],
        ...updatedEpisode.toObject() // Convert Mongoose document to plain JavaScript object
      };

      // Save the updated podcast
      const updatedPodcast = await podcast.save();

      res
        .status(200)
        .json({
          message: "Episode and Podcast episodesList updated successfully",
          updatedEpisode,
          updatedPodcast
        });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error updating the episode and podcast episodesList" });
    }
  }
);

module.exports = router;
