const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Topic } = require("../models/Topic");
const { Podcast } = require("../models/Podcast");
const { Episode } = require("../models/Episode");
const router = require("express").Router();

//GET ALL TOPICS
router.get("/" , async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách chủ đề" });
  }
});

// POST: Tạo chủ đề mới
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { name, description, imageUrl } = req.body;
  try {
    const newTopic = new Topic({ name, imageUrl });
    const savedTopic = await newTopic.save();
    res.status(200).json(savedTopic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tạo chủ đề" });
  }
});
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const { name, description, imageUrl } = req.body;
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl },
      { new: true } // Return the updated document
    );

    if (!updatedTopic) {
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }

    res.status(200).json(updatedTopic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật chủ đề" });
  }
});

// GET: Lấy chi tiết chủ đề theo ID
router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    }
    res.status(200).json(topic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết chủ đề" });
  }
});

// PUT: Cập nhật chủ đề theo ID
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { name, description , imageUrl },
      { new: true }
    );
    if (!updatedTopic) {
      return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    }
    res.status(200).json(updatedTopic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật chủ đề" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
     console.log(req.params.id);
    const deletedTopic = await Topic.findByIdAndDelete(req.params.id);

    if (!deletedTopic) {
       console.log(deletedTopic);
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }

    // Find podcasts that have the deleted topic in their topicsList
    const podcastsToUpdate = await Podcast.find({ topicsList: { $elemMatch: { _id: deletedTopic._id } } });

    // Delete the deleted topic from the topicsList of podcasts
    await Podcast.deleteMany({ _id: { $in: podcastsToUpdate.map(podcast => podcast._id) } });

    // Delete episodes from the podcastsToUpdate
    await Episode.deleteMany({ _id: { $in: podcastsToUpdate.map(podcast => podcast.episodesList).flat() } });

    res.status(200).json({
      message: "Chủ đề, podcasts, và episodes đã được xóa thành công",
      deletedTopic,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi xóa chủ đề, podcasts, và episodes" });
  }
});

module.exports = router;
