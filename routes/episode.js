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
router.post("/:podcastId/episodes", verifyTokenAndAdmin, async (req, res) => {
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
});

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
module.exports = router;
